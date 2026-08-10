# MyClash 覆写脚本测试

对 `Script/Script.js`（精简版）与 `Script/mihomoScript.js`（全量版）两个覆写脚本的自动化测试。

## 运行方式

在仓库根目录执行：

```bash
node Test/run-tests.js
# 或
npm --prefix Test test
```

仅需要 Node.js（推荐 ≥ 16）。

可按需只运行某一部分（参数可组合）：

```bash
node Test/run-tests.js --node     # 仅 Node 单元+集成测试
node Test/run-tests.js --es2020   # 仅 ES2020 兼容性检查
node Test/run-tests.js --quickjs  # 仅 QuickJS 引擎验证
```

### 兼容性验证（可选依赖）

`run-tests.js` 会自动执行两项兼容性验证，分别依赖两个 npm 包，首次使用前安装：

```bash
npm --prefix Test install
```

- **ES2020 兼容性检查**：用 `espree` 以 `ecmaVersion: 2020` 解析脚本（任何 ES2021+ 语法都会报错），并静态扫描是否使用了 ES2021+ 的内置 API。
  单独运行：`npm --prefix Test run test:es2020`（等价于 `node Test/run-tests.js --es2020`）
- **QuickJS 引擎验证**：用真实 QuickJS 引擎加载脚本并调用 `main()`。
  单独运行：`npm --prefix Test run test:quickjs`（等价于 `node Test/run-tests.js --quickjs`）

任一依赖未安装时，对应部分会自动跳过（不影响其余测试结果）。

## 覆盖内容

### 单元测试（纯函数）

- `matchDomainPattern`：精确 / `+.` / `.` / `*.` / 中间通配符、大小写
- `applyHostsToProxies`：hosts 映射改写节点 server（精确/通配/数组取值/优先级/链式映射，回环映射防御性终止）
- `stripDnsSuffix`：# 策略组后缀处理（#direct 或 #direct&参数 整条保留，direct 后接其他字符仍剥离）
- `getMatchedRegions`：香港 / 日本 / 美国 / 新加坡 / 台湾省（全量版）以及低/高倍率匹配
- `normalizeProxyName`：自动补国旗、折叠空格、保持原名
- `fixDialerProxy`：重命名引用更新、引用目标不存在时移除、未变引用保留
- `buildCustomizeGroups`：自定义节点标准化、与订阅节点重名加“自建-”前缀、内部去重、构建“自建节点”策略组

### 集成测试（main 覆写）

- 节点过滤（DIRECT/REJECT/rematch/信息节点）、标准化补国旗、dialer-proxy 修复
- GLOBAL 策略组聚合所有策略组
- DNS 与 hosts（私有 DNS 保留、公共 DNS 过滤、节点域名 policy/fake-ip-filter 保留、hosts 映射改写 server；仅当 `proxy-server-nameserver` 有且仅有一个条目且包含 `listen` 值时才触发改写，未命中时跳过改写）
- 配置选项开关（过滤高倍率 / 自动选择组 / 隐藏手动组 / 分流组添加所有节点 / QUIC 及 cn_additional 规则集 / 关闭分流组）
- 自定义节点：未配置时不生成自建节点组；配置后生成“自建节点”组、重名加“自建-”前缀、不参与 hosts 改写与 DNS 域名处理、默认代理/GLOBAL/手动选择包含自定义节点
- 异常场景（空节点、仅 DIRECT/REJECT/rematch 类型、全部可过滤节点 → 抛错）

## 文件结构

```text
Test/
├── package.json            # npm test / test:es2020 / test:quickjs 脚本
├── run-tests.js            # 唯一入口：Node 测试 + ES2020 检查 + QuickJS 验证（支持 --node/--es2020/--quickjs 筛选）
├── README.md
├── lib/
│   ├── loader.js           # vm 沙箱加载脚本并暴露 main / 内部函数 / ruleOptionsEnable
│   ├── harness.js          # 轻量断言与 ✓/✗ 输出、汇总
│   ├── fixtures.js         # 模拟订阅配置（典型/精简/空/仅type过滤/全部可过滤/hosts映射/通配映射/链式映射）
│   ├── scripts.js          # 待测试脚本列表（单一来源，供 run-tests / 两个检查模块共用）
│   ├── es2020-check.js     # ES2020 兼容性检查逻辑（espree 语法 + 内置 API 静态扫描）
│   └── quickjs-check.js    # QuickJS 兼容性验证逻辑（语法解析/顶层执行/main 调用）
└── suites/
    ├── unit.js             # 纯函数单元测试
    └── integration.js      # main() 集成测试
```

## 说明

- 通过 `vm` 沙箱执行原脚本并在末尾追加导出语句来获取内部符号，**不会修改 `Script/` 目录下的原文件**。
- 测试通过修改导出的 `ruleOptionsEnable` 对象来模拟配置项开关，用 `withOptions` 保证用后恢复。
