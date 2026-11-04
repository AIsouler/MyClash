'use strict';

/**
 * 临时修改 ruleOptionsEnable 的若干选项，执行完成后恢复，避免污染后续用例。
 * 单元测试与集成测试共用，避免同一实现维护两份。
 */
function withOptions(api, patch, fn) {
  const saved = {};
  for (const key of Object.keys(patch)) {
    saved[key] = api.ruleOptionsEnable[key];
    api.ruleOptionsEnable[key] = patch[key];
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(patch)) api.ruleOptionsEnable[key] = saved[key];
  }
}

module.exports = { withOptions };
