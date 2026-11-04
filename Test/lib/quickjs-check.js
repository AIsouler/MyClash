/**
 * 用真实 QuickJS 引擎验证 Script/Script.js 与 Script/mihomoScript.js 的兼容性。
 *
 * 覆盖两层验证：
 * 1. 语法解析 + 顶层执行（含所有正则字面量编译）
 * 2. 集成验证：在 QuickJS 上下文实际调用 main() 处理 typicalSubscription 配置，
 *    确认输出结构完整（proxies / proxy-groups / rules / dns / hosts）。
 *
 * 由 Test/run-tests.js 调用（npm --prefix Test run test:quickjs，需要已安装 quickjs-emscripten）。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SCRIPT_FILES } = require('./scripts');

const ROOT = path.resolve(__dirname, '..', '..');

/** 尝试加载 quickjs-emscripten；仅「未安装」时返回 null（调用方应优雅跳过） */
function tryLoadQuickJS() {
  try {
    return require('quickjs-emscripten');
  } catch (e) {
    // 其他错误（包损坏、加载失败等）如实抛出，避免被误判为「未安装」而掩盖真实问题
    if (e && e.code === 'MODULE_NOT_FOUND') return null;
    throw e;
  }
}

/** 在 QuickJS 上下文执行代码，返回 { ok, value, error } */
function run(ctx, code, filename) {
  const res = ctx.evalCode(code, filename);
  if (res.error) {
    const errText = String(ctx.dump(res.error));
    res.error.dispose();
    if (res.value) res.value.dispose();
    return { ok: false, error: errText };
  }
  const value = ctx.dump(res.value);
  res.value.dispose();
  return { ok: true, value };
}

/**
 * QuickJS 引擎兼容性验证（异步：需等待 WASM 模块初始化）。
 * 覆盖：语法解析 + 顶层执行、实际调用 main() 并校验输出结构完整。
 * 未安装 quickjs-emscripten 时跳过（不记入通过/失败）。
 *
 * @param {object} opts { harness, fixtures }
 */
async function runQuickJSChecks({ harness, fixtures }) {
  const quickjs = tryLoadQuickJS();
  if (!quickjs) {
    harness.section('QuickJS 引擎兼容性验证（已跳过）');
    console.log('    ⚠ 未安装 quickjs-emscripten 依赖，已跳过 QuickJS 验证。');
    console.log('      如需启用：npm --prefix Test install');
    return;
  }

  const QuickJS = await quickjs.getQuickJS();

  // ---------- 1. 语法解析 + 顶层执行（含所有正则字面量编译） ----------
  harness.section('QuickJS：语法解析 + 顶层执行');
  for (const rel of SCRIPT_FILES) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    harness.test(`${rel}（${code.split('\n').length} 行）`, () => {
      const ctx = QuickJS.newContext();
      try {
        const r = run(ctx, code, rel);
        harness.assert(r.ok, r.error || 'QuickJS 解析/执行失败');
      } finally {
        ctx.dispose();
      }
    });
  }

  // ---------- 2. 集成验证：QuickJS 中实际调用 main()，并与 Node 引擎对照 ----------
  harness.section('QuickJS：实际调用 main()');
  for (const rel of SCRIPT_FILES) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const cfgJson = JSON.stringify(fixtures.typicalSubscription());
    const ctx = QuickJS.newContext();
    let out = null;
    try {
      harness.test(`${rel}：main() 正常运行并产出完整配置`, () => {
        // 加载脚本并把 main 暴露到 globalThis，然后传入模拟订阅配置并调用
        const driver = `
${code}
globalThis.__main = main;
globalThis.__out = JSON.stringify(__main(JSON.parse(${JSON.stringify(cfgJson)})));
`;
        const r = run(ctx, driver, rel);
        harness.assert(r.ok, r.error || 'main() 执行失败');

        const outHandle = ctx.getProp(ctx.global, '__out');
        out = JSON.parse(String(ctx.dump(outHandle)));
        outHandle.dispose();

        harness.assert(Array.isArray(out.proxies) && out.proxies.length > 0, 'proxies 缺失或为空');
        harness.assert(Array.isArray(out['proxy-groups']) && out['proxy-groups'].length > 0, 'proxy-groups 缺失或为空');
        harness.assert(Array.isArray(out.rules) && out.rules.length > 0, 'rules 缺失或为空');
        harness.assert(out.dns && out.hosts, 'dns/hosts 缺失');
      });
    } finally {
      ctx.dispose();
    }
  }
}

module.exports = { runQuickJSChecks };
