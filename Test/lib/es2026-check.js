'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const { SCRIPT_FILES } = require('./scripts');

// ES2027+ 全局构造函数 / 顶层函数：作为独立标识符引用（new / 调用）即视为越界。
// ES2027 尚无定稿 API，清单暂为空；保留结构便于后续补充。
const GLOBAL_APIS = [];

// ES2027+ 成员方法（专有名称，作为属性名出现即视为越界）。
// 已随基线放开（ES2022–ES2026 均已允许）：hasOwn、structuredClone、at、findLast(Index)、
// toReversed/toSorted/toSpliced/with、fromAsync、groupBy、withResolvers、waitAsync、
// transfer(ToFixedLength)、isWellFormed/toWellFormed、Set 集合运算（union/intersection/
// difference/symmetricDifference/isSubsetOf/isSupersetOf/isDisjointFrom）、Promise.try、
// RegExp.escape、Map.getOrInsert(Computed) 等。
const MEMBER_APIS = [];

// 通用短名方法：仅在作为方法调用（x.xxx(...)）时才视为越界，降低误报
const CALL_ONLY_APIS = [];

/** 尝试加载 espree；仅「未安装」时返回 null（调用方应优雅跳过） */
function tryLoadEspree() {
  try {
    return require('espree');
  } catch (e) {
    // 其他错误（包损坏、加载失败等）如实抛出，避免被误判为「未安装」而掩盖真实问题
    if (e && e.code === 'MODULE_NOT_FOUND') return null;
    throw e;
  }
}

/** 遍历 AST，收集标识符调用与成员访问/调用信息 */
function collectUsages(ast) {
  const idUsages = new Set(); // 作为 new / 函数调用的标识符名
  const memberNames = new Set(); // MemberExpression 属性名
  const memberCalls = new Set(); // 作为方法调用 x.xxx(...) 的属性名

  (function walk(node) {
    if (!node || typeof node.type !== 'string') return;
    switch (node.type) {
      case 'CallExpression':
        if (node.callee.type === 'Identifier') {
          idUsages.add(node.callee.name);
        } else if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') {
          memberCalls.add(node.callee.property.name);
          memberNames.add(node.callee.property.name);
        }
        break;
      case 'NewExpression':
        if (node.callee.type === 'Identifier') idUsages.add(node.callee.name);
        break;
      case 'MemberExpression':
        if (node.property.type === 'Identifier') memberNames.add(node.property.name);
        break;
      default:
        break;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) walk(c);
      } else if (child && typeof child.type === 'string') {
        walk(child);
      }
    }
  })(ast);

  return { idUsages, memberNames, memberCalls };
}

/** 检查 AST 中是否使用了 ES2027+ 的内置 API，返回违规描述列表 */
function findApiViolations(ast) {
  const { idUsages, memberNames, memberCalls } = collectUsages(ast);
  const violations = [];
  for (const name of GLOBAL_APIS) {
    if (idUsages.has(name)) violations.push(`${name}（ES2027+ 全局 API）`);
  }
  for (const name of MEMBER_APIS) {
    if (memberNames.has(name)) violations.push(`xxx.${name}(...)（ES2027+ 成员方法）`);
  }
  for (const name of CALL_ONLY_APIS) {
    if (memberCalls.has(name)) violations.push(`xxx.${name}(...)（ES2027+ 成员方法）`);
  }
  return violations;
}

/**
 * ES2026 兼容性检查（同步，静态分析）：
 * 1. 用 espree 以 ecmaVersion: 2026 解析脚本 —— 任何 ES2027+ 语法都会抛出解析错误；
 * 2. 遍历 AST 检查是否使用了 ES2027+ 的内置 API（当前清单为空，留作后续扩展）。
 * 未安装 espree 时跳过（不记入通过/失败）。
 *
 * @param {object} opts { harness }
 */
function runES2026Checks({ harness }) {
  const espree = tryLoadEspree();
  if (!espree) {
    harness.section('ES2026 兼容性检查（已跳过）');
    console.log('    ⚠ 未安装 espree 依赖，已跳过 ES2026 兼容性检查。');
    console.log('      如需启用：npm --prefix Test install');
    return;
  }

  harness.section('ES2026 兼容性检查');
  for (const rel of SCRIPT_FILES) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    let ast = null;

    harness.test(`${rel}：语法不超出 ES2026`, () => {
      try {
        ast = espree.parse(code, { ecmaVersion: 2026, sourceType: 'script', loc: true });
      } catch (e) {
        harness.assert(false, `第 ${e.lineNumber} 行: ${e.message}`);
      }
    });

    harness.test(`${rel}：未使用 ES2027+ 内置 API`, () => {
      harness.assert(ast !== null, '语法解析失败（超出 ES2026），跳过 API 检查');
      const violations = findApiViolations(ast);
      harness.assert(violations.length === 0, `检测到 ${violations.join('、')}`);
    });
  }
}

module.exports = { runES2026Checks };
