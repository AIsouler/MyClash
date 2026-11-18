# 在 FlClash（Concord 内核）中使用

[FlClash](https://github.com/chen08209/FlClash) 的新内核是 [Concord](https://github.com/chen08209/concord)——一个用 Rust 重写、读取 mihomo 配置的代理内核。绝大多数 mihomo 配置可以直接跑，但**不是全部参数都被读取**，有些写法会让整份配置被拒绝。旧版 FlClash 仍使用 mihomo，两套文件并存，按内核选一套用即可。

因此本仓库为 Concord 单独维护了一套文件：

| 版本   | 覆写脚本                                               | 配置文件                                                   |
| ------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| 全量版 | [concordScript.js](../Script/concordScript.js)         | [concordConfig.yaml](../Config/concordConfig.yaml)         |
| 精简版 | [concordScriptLite.js](../Script/concordScriptLite.js) | [concordConfigLite.yaml](../Config/concordConfigLite.yaml) |

> [!IMPORTANT]
>
> 使用前先确认内核：在 FlClash 的「设置 → 关于」或「核心状态」处看内核信息。显示 `concord` 用本文的 concord 版本；仍显示 `mihomo` 请继续用 [mihomoScript.js](../Script/mihomoScript.js) / [Script.js](../Script/Script.js)，两套文件不要混用。

---

## 用法一：覆写脚本（推荐）

脚本会读取机场订阅的原始配置，再整体改写为带策略组、规则集和 DNS 方案的完整配置，所以它只适用于**覆写机场订阅**，不要拿去覆写自己手写的配置。

- 全量版

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/concordScript.js
```

- 精简版

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/concordScriptLite.js
```

**导入步骤**

1. 打开 FlClash 的「配置」页，添加并选中你的机场订阅；
2. 进入该配置的编辑页，把「扩展模式」切换为**脚本模式**（标准模式只附加规则，脚本模式才会改写整份配置）；
3. 点「前往配置脚本」，再选择**通过URL导入**，粘贴上面的链接；
4. 保存，然后重启内核（或在配置页重新应用）让脚本生效。

> [!TIP]
>
> 界面措辞可能随版本微调，按关键字「脚本」「扩展模式」「通过URL导入」找即可；也可以先把脚本下载到本地，改用「通过文件导入」。

**配套设置（很重要）**

- 「网络 → 覆写项」里的 **DNS 覆写项请留空**。那里的项会覆写所有 URL 和文件配置的 DNS，而本仓库的 DNS 分流与规则集是配套设计的，被覆写后会出现解析异常或流量误判；TUN 覆写项同理，未确认用途前不要添加。
- 不要开启代理软件自带的 DNS 覆写开关，保持脚本对 DNS 的控制权。
- Windows 上如要彻底避免 DNS 泄露，关闭系统「智能多宿主名称解析」，或在 TUN 设置里开启严格路由（`strict-route`）。

---

## 用法二：直接用配置文件

YAML 是静态配置，无法像脚本那样按订阅节点动态生成策略组，因此限制与 mihomo 版一致：

- 没有可开关的自定义配置项；
- 地区策略组是固定的，没匹配到节点的地区会回退到 `REJECT`；
- 使用私有 DNS 或 hosts 映射节点域名的机场，需要手动补写。

- 全量版

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/concordConfig.yaml
```

- 精简版

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/concordConfigLite.yaml
```

导入方式：配置页 → 导入 → 通过URL导入，粘贴上面的链接。导入后记得编辑配置，把 `proxy-providers` 里 `provider1` 的 `url` 换成你的订阅链接（订阅需要解密时再填 `age-secret-key`）。

---

## 与 mihomo 版的区别

concord 版本不是新写的配置，而是从 mihomo 版逐项裁剪而来，只删掉了 Concord 不读、或会直接报错的参数，其余策略组、规则集、DNS 方案完全一致。

| 被移除的参数                     | 原因                                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| 所有规则集的 `path-in-bundle`    | Concord 不支持，命中时**整份配置被拒绝**（不是警告）                     |
| `external-ui`、`external-ui-url` | Concord 没有内置面板，永不读取                                           |
| `tun.auto-redirect`              | Concord 的 TUN 没有自动重定向开关                                        |
| `external-controller`            | FlClash 内嵌内核时自己接管监听地址，写了只会多一条 `host_owned_key` 告警 |

另外，那些只用来挂锚点的容器键（`dns_common`、`rule_providers_common`、`group_common`、`proxies_common`、`group_filter`）已经全部去掉，锚点直接定义在原来的下级键上（如 `chinaDNS: &chinaDNS [...]`）。这些键自身带锚点，Concord 会把它们当作模板键静默丢弃；再多包一层没有锚点的容器，就会每个容器报一条 `unknown_key` 警告，FlClash 会弹出「配置警告」。

如果你想独立运行 `concord run` 并用面板查看状态，自行加回 `external-controller: '127.0.0.1:9090'` 即可，此时它才生效。

---

## 用起来会不太一样的地方

这些是 Concord 与 mihomo 的固有差异，和本仓库的配置无关，遇到时不必当成故障：

- **不支持的节点不会让整份配置失败**，而是被单独「搁置」并告警。Tailscale、Easytier、Zerotier、OpenVPN、Masque、Sudoku、kcp 系传输、restls / jls / kcptun 插件、SSR 的 `chacha20` / `xchacha20` 等都在此列。若某个策略组因此变空、或你选中的节点被搁置，该组会直接拒绝连接，不会自动改选别的节点（除非配置了 `empty-fallback`，本仓库配置为 `REJECT`）。
- **拨号不重试**。mihomo 会在 5 秒内重试最多 10 次，Concord 一条连接只拨一次，失败即失败，弱网下体感是切换变干脆、但偶发失败不再自愈。
- **`GEOIP` 只认 mmdb**。`geodata-mode`、`geox-url.geoip` 被忽略；只存在于自定义 `GeoIP.dat` 里的代码不会匹配。本仓库不使用 `GEOIP` 规则，不受影响。
- **TUN 行为更强势**：开启 `auto-route` 后 Concord 会把 TUN 设为系统解析器（macOS 也一样），`dns-mode` 不被读取；`tun.gso` 只告警不生效；节点的 `tfo` 在 macOS / Windows 上不起作用。
- **控制面板差异**：mihomo 的 REST API 大部分可用，但 `/restart`、`/upgrade`、`/storage`、`/ui` 等返回 501，`PATCH /configs` 只接受 `mode`、`log-level`、`ipv6`、`allow-lan`、`mixed-port`、`tcp-concurrent`、`find-process-mode` 等少数键，`/rules` 没有命中计数。FlClash 自带界面不受影响，第三方面板的部分按钮会失效。
- **文件型规则集会每 2 秒轮询重载**，不再依赖文件系统事件。
- **UDP 按目标逐一匹配规则**，同一个源的不同目标可能走不同出口（纯 VMess 除外）。

---

## 常见问题

**策略组是空的 / 选中后连不上**

多半是节点被搁置或过滤了。看 FlClash 的内核日志：Concord 的告警带稳定 `code`，节点被搁置是 `proxy_quarantined`，参数被忽略是 `unsupported_key` / `unknown_key` / `proxy_option`，按提示换节点或换机场订阅。

**界面里找不到「脚本模式」**

先确认 FlClash 版本足够新；旧版本只有标准模式（附加规则），此时改用「用法二」直接导入 `concordConfig.yaml`。

**想回到 mihomo**

把配置里的脚本换回 `mihomoScript.js` / `Script.js`，或导入 `mihomoConfig.yaml` 即可，两套文件互不影响。

**规则集 / 图标加载慢**

两者都走 jsDelivr 的 `fastly.jsdelivr.net`，国内网络不佳时属于 CDN 问题，不是内核问题。

---

参考：[Concord 兼容性说明](https://github.com/chen08209/concord/blob/main/docs/compatibility.md) · [Concord 使用说明](https://github.com/chen08209/concord/blob/main/docs/usage.md)（本文依据 2026-11 的文档整理，内核升级后以官方文档为准）
