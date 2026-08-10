'use strict';

const { loadScript } = require('./lib/loader');
const { Harness } = require('./lib/harness');
const fx = require('./lib/fixtures');
const { runUnitTests } = require('./suites/unit');
const { runIntegrationTests } = require('./suites/integration');
const { runES2020Checks } = require('./lib/es2020-check');
const { runQuickJSChecks } = require('./lib/quickjs-check');
const { SCRIPTS } = require('./lib/scripts');

// 运行范围筛选：--node / --es2020 / --quickjs；不传参数则全部运行
const ARGS = new Set(process.argv.slice(2));
const runAll = !ARGS.has('--node') && !ARGS.has('--es2020') && !ARGS.has('--quickjs');
const shouldRunNode = runAll || ARGS.has('--node');
const shouldRunES2020 = runAll || ARGS.has('--es2020');
const shouldRunQuickJS = runAll || ARGS.has('--quickjs');

/** 打印一份覆写结果概览，便于快速确认输出规模 */
function printDemo(api, label, meta) {
  try {
    const out = api.main(fx.typicalSubscription());
    const groups = out['proxy-groups'];
    const regionSelect = groups.filter((g) => g.type === 'select' && meta.regions.includes(g.name)).map((g) => g.name);
    const other = groups.some((g) => g.name === '其他节点') ? ['其他节点'] : [];
    console.log(`\n  ── 覆写结果概览 (${label}) ──`);
    console.log(`     代理节点: ${out.proxies.length}`);
    console.log(`     策略组:   ${groups.length}`);
    console.log(`     规则:     ${out.rules.length}`);
    console.log(`     规则集:   ${Object.keys(out['rule-providers']).length}`);
    console.log(`     生成地区组: ${[...regionSelect, ...other].join(' / ')}`);
  } catch (err) {
    console.log(`\n  ── 覆写结果概览失败 (${label}): ${err.message}`);
  }
}

async function main() {
  console.log('MyClash 覆写脚本测试');
  console.log('='.repeat(64));
  let totalPassed = 0;
  let totalFailed = 0;

  // Node 单元 + 集成测试
  if (shouldRunNode) {
    for (const script of SCRIPTS) {
      console.log(`\n${'='.repeat(64)}`);
      console.log(`  测试对象: ${script.label}  (${script.file})`);
      console.log(`${'='.repeat(64)}`);

      const api = loadScript(script.file);
      const h = new Harness(script.label);

      runUnitTests(h, api, script.meta);
      runIntegrationTests(h, api, script.meta, fx, loadScript, script.file);
      printDemo(api, script.label, script.meta);

      const s = h.summary();
      totalPassed += s.passed;
      totalFailed += s.failed;
    }
  }

  // ES2020 兼容性检查（语法 + 内置 API 静态扫描，未安装 espree 时自动跳过）
  if (shouldRunES2020) {
    const hES2020 = new Harness('ES2020 兼容性检查');
    runES2020Checks({ harness: hES2020 });
    const se = hES2020.summary();
    totalPassed += se.passed;
    totalFailed += se.failed;
  }

  // QuickJS 引擎兼容性验证（真实引擎加载 + 实际调用 main，未安装依赖时自动跳过）
  if (shouldRunQuickJS) {
    const hQuickJS = new Harness('QuickJS 引擎验证');
    await runQuickJSChecks({ harness: hQuickJS, fixtures: fx });
    const sq = hQuickJS.summary();
    totalPassed += sq.passed;
    totalFailed += sq.failed;
  }

  console.log(`\n${'='.repeat(64)}`);
  console.log(`  总计: 通过 ${totalPassed} 项，失败 ${totalFailed} 项`);
  console.log(`${'='.repeat(64)}`);

  if (totalFailed > 0) {
    console.log('\n有失败用例，请查看上方 ✗ 标记的详细信息。');
  } else {
    console.log('\n全部测试通过 ✅');
  }

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`\n测试运行异常: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
