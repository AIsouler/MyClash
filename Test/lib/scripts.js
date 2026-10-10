'use strict';

/**
 * 待测试/验证的脚本及差异元信息（单一来源）。
 * run-tests.js（Node 测试）、es2020-check.js、quickjs-check.js 共用，
 * 避免脚本列表在多处重复维护导致不同步。
 */
const SCRIPTS = [
  {
    file: 'Script/Script.js',
    label: '精简版 Script.js',
    meta: {
      full: false,
      regions: ['香港', '日本', '美国', '新加坡'],
    },
  },
  {
    file: 'Script/mihomoScript.js',
    label: '全量版 mihomoScript.js',
    meta: {
      full: true,
      regions: ['香港', '日本', '美国', '新加坡', '台湾'],
    },
  },
];

/** 脚本文件路径列表（供兼容性检查模块使用） */
const SCRIPT_FILES = SCRIPTS.map((s) => s.file);

module.exports = { SCRIPTS, SCRIPT_FILES };
