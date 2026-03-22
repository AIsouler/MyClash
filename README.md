# MyClash

Mihomo（Clash Meta）配置全局覆写脚本，内置多项分流策略、地区策略，实现全局排除节点、自动识别节点倍率等功能

注意⚠️：该脚本仅适用于覆写机场提供的配置文件，请勿用于覆写自己编写的配置文件

## 使用方式（任选其一）

### 方式一

将以下链接复制到代理客户端中导入：

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Script/mihomoScript.js
```

### 方式二

复制 [脚本完整代码](https://github.com/AIsouler/MyClash/blob/main/Script/mihomoScript.js) 粘贴到代理客户端中使用

## 脚本说明

- 仅适用于使用 [mihomo 内核](https://github.com/MetaCubeX/mihomo) 的代理客户端

- 仅适用于覆写机场提供的配置文件，请勿用于覆写自己编写的配置文件

- 规则采用 `rule-set` 模式，按需添加规则集，告别臃肿的 geodata

- 规则以 `domain` 与 `ipcidr` 行为为主，相比 `classical` 查询效率更高

- 自动排除非国家或地区的信息节点，可自定义是否启用（默认启用）

- 自动识别节点倍率，并分别归类为独立节点组：
  - 高倍率节点（倍率 ≥2）
  - 低倍率节点（倍率 ≤0.5）

- 脚本内策略组、节点组均支持自定义是否启用（默认启用）

## 内置策略组

> - _所有组均为手动选择（select）_
> - _若不需要某个策略组，可在脚本中将对应开关设为 `false`_

- `默认节点`
- `全局自动选择`
- `国外AI`
- `YouTube`
- `FCM服务`
- `谷歌服务`
- `Github`
- `微软服务`
- `Telegram`
- `Pixiv`
- `Steam`
- `Twitter`
- `Emby`
- `Spotify`
- `广告拦截`
- `下载专用`
- `直连` （可自定义IP优先级，建议使用 `IPv4优先`，防止出现一些问题）

## 内置节点组

> - _所有组均为手动选择（select），内部包含对应的自动选择策略组_
> - _若不需要某个节点组，可在脚本中将对应开关设为 `false`_
> - _若机场订阅中不存在对应节点组的节点，则该节点组不会显示_
> - _未匹配节点组或未启用节点组的节点，将统一归类至 「其他节点」_

- `香港`
- `日本`
- `美国`
- `新加坡`
- `台湾省`
- `韩国`
- `英国`
- `德国`
- `法国`
- `加拿大`
- `澳大利亚`
- `俄罗斯`
- `低倍率节点`
- `高倍率节点`
- `其他节点`

## 效果展示

- 客户端： [Bettbox](https://github.com/appshubcc/Bettbox)

|                                                                                             |                                                                                             |                                                                                             |                                                                                             |                                                                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/IMG_1.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/IMG_2.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/IMG_3.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/IMG_4.webp) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/IMG_5.webp) |

## 致谢

感谢以下项目以及所有上游项目

- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet/blob/main/Mihomo/global_script.js)

- [YiXuanZX/rules](https://github.com/YiXuanZX/rules)

- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)

- [TG-Twilight/AWAvenue-Ads-Rule](https://github.com/TG-Twilight/AWAvenue-Ads-Rule)

- [DustinWin/ruleset_geodata](https://github.com/DustinWin/ruleset_geodata)

- [Koolson/Qure](https://github.com/Koolson/Qure)
