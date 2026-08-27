# MyClash

基于 [Mihomo](https://github.com/MetaCubeX/mihomo/tree/Alpha) 的配置文件与覆写脚本，提供全量版和精简版。

主要特性：

- 内置多种分流策略与地区策略
- 自动排除无效地区节点
- 自动识别节点倍率并分类
- 解决机场私有 DNS、hosts 导致节点域名无法解析的问题
- 优化 DNS 配置，无 DNS 泄露风险
- 支持 Bettbox 图形化配置管理

友情推荐：
[Bettbox](https://github.com/appshubcc/Bettbox) —— 一款轻量、省电、低内存占用的代理客户端。

**覆写脚本已适配 Bettbox，可通过图形界面自定义启用策略组及配置选项，获得更灵活的使用体验，具体效果请查看下方效果预览图。**

---

## 覆写脚本

### 注意事项

> [!IMPORTANT]
>
> ⚠️该脚本仅用于覆写机场提供的配置文件，请勿用于覆写自行编写的配置
>
> ⚠️脚本已解决部分机场抽象DNS导致无法解析节点或者使用脚本覆写导致解析出来节点延迟高的问题，请务必关闭代理软件的DNS覆写功能

### 脚本功能

- ✅ 解决机场私有 DNS 或节点域名 hosts 映射导致的节点解析问题（节点 hosts 映射将自动改写进节点 `server`，无需复制 hosts）
- ✅ 根据节点匹配情况动态生成地区策略组
- ✅ 支持自定义是否生成地区自动选择策略组
- ✅ 支持自定义是否隐藏地区手动选择策略组
- ✅ 支持自定义是否生成 高/低 倍率节点组
- ✅ 支持自定义是否将全部节点加入分流策略组
- ✅ 支持自定义是否过滤高倍率节点
- ✅ 支持自定义是否过滤非地区节点
- ✅ 支持自定义是否屏蔽国外 QUIC 流量
- ✅ 支持自定义是否将订阅节点统一为 IPv4/IPv6 优先（同时开启时不生效）
- ✅ 支持在脚本中配置自定义节点（自动生成“自建节点”策略组，与订阅节点重名时自动添加“自建-”前缀）
- ✅ 支持链式代理（将自定义节点作为落地节点，经“链式中转”策略组通过订阅节点中转；启用后自动为自定义节点添加 `dialer-proxy`）

### 使用方法（脚本）

复制以下任意一个链接或者复制完整代码后按如图所示步骤导入到代理客户端，以 [Bettbox](https://github.com/appshubcc/Bettbox) 为例

- [mihomoScript.js（全量版）](/Script/mihomoScript.js)，复制下面这个链接使用👇👇👇

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/mihomoScript.js
```

- [Script.js（精简版）](/Script/Script.js)，仅包含少量分流策略组，复制下面这个链接使用👇👇👇

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/Script.js
```

|                                                                                   |
| --------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/import.webp) |

## 配置文件

配置文件与脚本实现效果基本一致，但功能存在限制。

### 限制

- 不支持自定义启用/禁用配置项
- 无法根据节点匹配情况动态生成策略组
- 使用私有 DNS 或 hosts 节点域名映射的机场需要手动写入配置中
- 未匹配地区的策略组将回退至 REJECT

### 使用方法（配置）

复制以下任意一个链接或者复制完整代码后导入代理客户端

- [mihomoConfig.yaml（全量版）](/Config/mihomoConfig.yaml)，复制下面这个链接使用👇👇👇

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfig.yaml
```

- [mihomoConfigLite.yaml（精简版）](/Config/mihomoConfigLite.yaml)，仅包含少量分流策略组，复制下面这个链接使用👇👇👇

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfigLite.yaml
```

## 功能说明

- 仅适用于使用 [mihomo 内核](https://github.com/MetaCubeX/mihomo/tree/Alpha) 的代理客户端

- 全量版和精简版仅有分流策略组数量差异，其他基本一致，若不需要很多分流策略组，可使用精简版

- 内置的DNS配置已解决DNS泄露问题（在 Windows 上需要关闭系统的智能多宿主解析功能或在代理软件中开启 [严格路由](https://wiki.metacubex.one/config/inbound/tun/#strict-route)），DNS配置和路由规则是配套的，建议不要开启代理软件的DNS覆写或随意修改

- 规则采用 `rule-set` 模式，按需添加规则集，告别臃肿的 geodata，减少内存占用

- 规则以 `domain` 与 `ipcidr` 行为为主，相比 `classical` 查询效率更高

- 自动排除非国家或地区的信息节点

- 自动识别节点倍率，并分别归类为独立节点组：
  - 高倍率节点（倍率 ≥2）
  - 低倍率节点（倍率 ≤0.5）

## 内置策略组

> - 若不需要某个分流策略组，可在脚本中将 `ruleOptionsEnable` 对应值设为 `false`

- `默认代理`
- `手动选择`
- `自动选择`
- `负载均衡`
- `FCM`
- `YouTube`
- `Google`
- `AI`
- `Microsoft`
- `Apple`
- `Telegram`
- `Steam`
- `TikTok`
- `Instagram`
- `Netflix`
- `Twitter`
- `Emby`
- `PikPak`
- `Spotify`
- `Crypto`
- `EHentai`
- `AdBlock`
- `直连` （可自定义 `双栈/IPv4优先/IPv6优先/仅IPv4/仅IPv6`）
- `漏网之鱼`
- `自建节点/链式落地` （仅添加了自定义节点时生成）
- `链式中转` （仅启用链式代理且配置自定义节点时生成）

## 内置节点组

> - 所有组均为手动选择（select），内部包含对应的自动选择策略组
> - 未匹配到地区组的节点节点将归类至 「其他节点」

- `香港`
- `日本`
- `美国`
- `新加坡`
- `台湾省`
- `低倍率节点`
- `高倍率节点`
- `其他节点`

## 效果预览

- 客户端： [Bettbox](https://github.com/appshubcc/Bettbox)

|                                                                                  |                                                                                  |                                                                                  |                                                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_1.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_2.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_3.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_4.webp) |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_5.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_6.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_7.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_8.webp) |

## 致谢

感谢以下项目以及所有上游项目

- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet/blob/main/Mihomo/global_script.js)

- [YiXuanZX/rules](https://github.com/YiXuanZX/rules)

- [appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)

- [wwqgtxx/clash-rules](https://github.com/wwqgtxx/clash-rules)

- [217heidai/adblockfilters](https://github.com/217heidai/adblockfilters)

- [Koolson/Qure](https://github.com/Koolson/Qure)
