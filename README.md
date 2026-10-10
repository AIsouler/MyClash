# MyClash

基于 [Mihomo](https://github.com/MetaCubeX/mihomo/tree/Alpha) 的**覆写脚本与配置文件**，仅适用于 mihomo 内核的代理客户端

> [!IMPORTANT]
>
> ⚠️ 使用脚本或配置时，请关闭代理软件的 DNS 覆写功能，以确保功能正常

## 特色功能

- 🧩 **丰富的分流策略组**：内置 AI、YouTube、Google、Telegram、Steam、Netflix、Spotify 等常用分流组，可按需启用
- 🎨 **精美图标**：策略组采用精心绘制的 SVG 图标，支持无损缩放与高清渲染，任意尺寸下均保持清晰
- 🌏 **地区节点自动分组**：自动识别香港、日本、美国、新加坡、台湾等地区，并生成对应策略组
- 🧹 **节点智能整理**：自动补国旗、优化节点名称、过滤无效节点，并按倍率自动分类
- ✨ **精准国内外分流**：区别于常见的 `cn-domain,直连` 分流方案，本仓库采用优化后的 `cn-ip,直连` 作为兜底规则，结合 `cn-domain` 国内 DNS 分流，减少国内流量误走代理、国外流量误判直连的情况，让分流更精准
- 🪶 **轻量规则方案**：采用 `rule-set` 按需加载规则，减少配置体积与内存占用
- 🛡️ **无 DNS 泄露**：DNS 配置与路由规则配套设计，解决 DNS 泄露问题
- 🔧 **私有 DNS 自动处理**：自动处理机场私有 DNS 与节点域名 hosts 映射，无需手动修改
- 🪜 **高级代理功能**：支持自定义节点、链式代理、IPv4 / IPv6 优先及国外 QUIC 屏蔽
- 📱 **适配 [Bettbox](https://github.com/appshubcc/Bettbox) 图形化配置**：可直接在图形界面中开关策略组和功能选项，无需手动修改代码

## 版本选择

提供**全量版**和**精简版**，两者功能基本一致，仅分流策略组数量不同：

- **全量版**：包含完整的分流策略组，适合需要精细分流的用户
- **精简版**：仅保留常用分流策略组，配置更加简洁

---

## 覆写脚本

> [!IMPORTANT]
>
> - 脚本仅用于覆写机场提供的配置文件，请勿用于覆写自行编写的配置
> - 脚本已处理部分机场私有 DNS 和节点域名 hosts 映射导致的解析问题，请关闭代理软件的 DNS 覆写功能
> - 在 Windows 上如需解决 DNS 泄露，需关闭系统“智能多宿主名称解析”，或在代理软件中开启 [严格路由](https://wiki.metacubex.one/config/inbound/tun/#strict-route)

### DNS 处理（核心特色功能）

越来越多的机场开始使用私有 DNS 解析节点域名，普通公共 DNS 无法正确解析，更有甚者通过 hosts 映射节点域名，再通过本地监听回环到 DNS 解析，普通覆写手段根本无法处理，本项目脚本针对以上情况做了完善的处理，避免覆写后节点无法解析或被解析到垃圾线路（也就是常说的内鬼组），如果遇到解析问题请反馈

### 可配置功能

使用 **[Bettbox](https://github.com/appshubcc/Bettbox)** 时，可以直接通过图形界面管理这些选项

| 分类     | 功能                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 策略组   | 内置多个分流策略组，每个都可单独开关，根据节点自动生成地区策略组，可选择地区自动选择、手动选择及高 / 低倍率组 |
| 节点处理 | 过滤高倍率、低倍率及非地区节点，可统一设置 IPv4 / IPv6 优先                                                   |
| 分流     | 可将全部节点加入分流策略组，也可启用极简模式                                                                  |
| 网络     | 可选屏蔽国外 QUIC 流量                                                                                        |
| 高级     | 支持自定义节点与链式代理                                                                                      |
| 兼容     | 自动处理节点 hosts 映射及机场私有 DNS                                                                         |

### 使用方法（脚本）

选择对应版本，将链接或完整代码按如图所示步骤导入支持脚本覆写的客户端即可

- **全量版**

[mihomoScript.js](/Script/mihomoScript.js)，复制下面这个链接使用👇👇👇

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/mihomoScript.js
```

- **精简版**

[Script.js](/Script/Script.js)，复制下面这个链接使用👇👇👇

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/Script.js
```

|                                                                                   |
| --------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/import.webp) |

---

## 配置文件

配置文件与覆写脚本的整体效果基本一致，但由于 YAML 是静态配置，无法像脚本那样灵活处理

因此存在以下限制：

- 没有自定义配置项
- 无法根据节点动态生成地区策略组，未匹配到节点的地区会回退到 `REJECT`
- 使用私有 DNS 或 hosts 节点域名映射的机场，需要手动写入配置

### 使用方法（配置）

选择对应版本，将链接或完整代码导入 mihomo 客户端即可

- **全量版**

[mihomoConfig.yaml](/Config/mihomoConfig.yaml)，复制下面这个链接使用👇👇👇

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfig.yaml
```

- **精简版**

[mihomoConfigLite.yaml](/Config/mihomoConfigLite.yaml)，复制下面这个链接使用👇👇👇

```text
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfigLite.yaml
```

---

## 效果预览

推荐使用 [Bettbox](https://github.com/appshubcc/Bettbox) 管理覆写脚本，可通过图形界面调整策略组和配置项

|                                                                                  |                                                                                  |                                                                                  |                                                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_1.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_2.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_3.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_4.webp) |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_5.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_6.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_7.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_8.webp) |

## Star History

[![Star History Chart](https://api.star-history.com/chart?repos=aisouler/myclash&type=date&legend=top-left)](https://www.star-history.com/?repos=aisouler%2Fmyclash&type=date&legend=top-left)

## 致谢

感谢以下项目以及所有上游项目：

- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet)
- [YiXuanZX/rules](https://github.com/YiXuanZX/rules)
- [appshubcc/bett-rules](https://github.com/appshubcc/bett-rules)
- [Koolson/Qure](https://github.com/Koolson/Qure)
- [jsdmirror/JSDMirror](https://github.com/jsdmirror/JSDMirror)
