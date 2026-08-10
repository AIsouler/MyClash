'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * 覆写脚本本身没有模块导出（是给 mihomo JS 运行时执行的）。
 * 这里在 vm 沙箱中执行脚本，并在末尾追加一条导出语句，
 * 从而把 main 及其内部函数、配置对象暴露给测试使用。
 * 注意：整个过程不改动磁盘上的原脚本。
 */
// 仅导出测试实际用到的符号（其余内部函数的行为由 main 的集成测试间接覆盖）
const EXPORT_SUFFIX = `
;module.exports = {
  main,
  matchDomainPattern,
  applyHostsToProxies,
  stripDnsSuffix,
  getMatchedRegions,
  normalizeProxyName,
  fixDialerProxy,
  ruleOptionsEnable
};
// 仅全量版存在 buildCustomizeGroups，精简版无此函数时保持导出不报错
if (typeof buildCustomizeGroups !== 'undefined') {
  module.exports.buildCustomizeGroups = buildCustomizeGroups;
}`;

/**
 * 加载指定覆写脚本，返回其导出的符号。
 * @param {string} scriptPath 相对仓库根目录的脚本路径，如 'Script/Script.js'
 * @param {(code: string) => string} [transform] 可选：在沙箱执行前对源码做字符串变换（用于注入自定义节点等静态配置）
 */
function loadScript(scriptPath, transform) {
  const abs = path.resolve(__dirname, '..', '..', scriptPath);
  let code = fs.readFileSync(abs, 'utf8');
  if (typeof transform === 'function') code = transform(code);

  const sandbox = {
    module: { exports: {} },
    console,
    process,
    Buffer,
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(code + EXPORT_SUFFIX, sandbox, { filename: path.basename(abs) });
  return sandbox.module.exports;
}

module.exports = { loadScript };
