# MyClash

Mihomo（Clash Meta）配置文件和覆写脚本，分别提供全量版和精简版，无DNS泄露（图一乐），内置多项分流策略、地区策略，实现全局排除节点、自动识别节点倍率等功能

友情推荐，非常好用、省电且内存占用低的代理软件：[Bettbox](https://github.com/appshubcc/Bettbox)

## 配置文件

> - _配置文件实现的效果和脚本基本一致_
> - _不支持自定义 **启用/禁用** 策略组_
> - _无法像脚本那样实现不生成未匹配到节点的策略组_

复制以下任意一个链接或者复制完整代码后导入代理客户端

- [mihomoConfig.yaml（全量版）](/Config/mihomoConfig.yaml)

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfig.yaml
```

- [mihomoConfigLite.yaml（精简版）](/Config/mihomoConfigLite.yaml)

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Config/mihomoConfigLite.yaml
```

## 覆写脚本

> [!IMPORTANT]
> **注意⚠️：该脚本仅适用于覆写机场提供的配置文件，请勿用于覆写自己编写的配置文件**

复制以下任意一个链接或者复制完整代码后按如图所示步骤导入到代理客户端，以 [Bettbox](https://github.com/appshubcc/Bettbox) 为例

- [mihomoScript.js（全量版）](/Script/mihomoScript.js)

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/mihomoScript.js
```

- [Script.js（精简版）](/Script/Script.js)

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/Script.js
```

|                                                                                   |
| --------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/import.webp) |

## 配置和脚本说明

- 仅适用于使用 [mihomo 内核](https://github.com/MetaCubeX/mihomo/tree/Alpha) 的代理客户端

- 脚本仅适用于覆写机场提供的配置文件，请勿用于覆写自己编写的配置文件

- 全量版脚本内策略组、节点组均支持自定义是否启用（默认启用）

- 内置的DNS配置已解决DNS泄露问题（图一乐），建议不要开启代理软件的DNS覆写

- 规则采用 `rule-set` 模式，按需添加规则集，告别臃肿的 geodata，减少内存占用

- 规则以 `domain` 与 `ipcidr` 行为为主，相比 `classical` 查询效率更高

- 自动排除非国家或地区的信息节点，可自定义是否启用（默认启用）

- 自动识别节点倍率，并分别归类为独立节点组：
  - 高倍率节点（倍率 ≥2）
  - 低倍率节点（倍率 ≤0.5）

## 内置策略组

> - _若不需要某个分流策略组，可在脚本中将 `ruleOptionsEnable` 对应值设为 `false`_

- `默认代理`
- `自动选择`
- `负载均衡`
- `AI`
- `YouTube`
- `FCM`
- `Google`
- `GitHub`
- `Microsoft`
- `Apple`
- `Telegram`
- `Cloudflare`
- `Pixiv`
- `Steam`
- `Twitter`
- `Instagram`
- `Emby`
- `Spotify`
- `TikTok`
- `Netflix`
- `广告拦截`
- `直连` （可自定义IP优先级，建议使用 `IPv4优先`，防止出现一些问题）
- `漏网之鱼`

## 内置节点组

> - _所有组均为手动选择（select），内部包含对应的自动选择策略组和负载均衡策略组_
> - _若机场订阅中不存在对应节点组的节点，则该节点组不会显示_
> - _未匹配到地区组的节点节点将归类至 「其他节点」_

- `香港`
- `日本`
- `美国`
- `新加坡`
- `台湾省`
- `低倍率节点`
- `高倍率节点`
- `其他节点`

## 效果展示

- 客户端： [Bettbox](https://github.com/appshubcc/Bettbox)

|                                                                                  |                                                                                  |                                                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_1.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_2.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_3.webp) |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_4.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_5.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/main/Image/IMG_6.webp) |

## 致谢

感谢以下项目以及所有上游项目

- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet/blob/main/Mihomo/global_script.js)

- [YiXuanZX/rules](https://github.com/YiXuanZX/rules)

- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)

- [wwqgtxx/clash-rules](https://github.com/wwqgtxx/clash-rules)

- [217heidai/adblockfilters](https://github.com/217heidai/adblockfilters)

- [Koolson/Qure](https://github.com/Koolson/Qure)
