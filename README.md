# MyClash

mihomo（clashmeta）配置覆写脚本

## 使用方式（任选其一）

### 方式一

将以下链接复制到代理客户端中导入：

```txt
https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Script/mihomoScript.js
```

### 方式二

复制 [脚本完整代码](https://github.com/AIsouler/MyClash/blob/main/Script/mihomoScript.js) 粘贴到代理客户端中使用

## 脚本说明

- 适用于使用 [mihomo 内核](https://github.com/MetaCubeX/mihomo) 的代理客户端

- 规则采用 `rule-set` 模式，按需添加规则集，告别臃肿的 geodata

- 规则以 `domain` 与 `ipcidr` 行为为主，相比 `classical` 查询效率更高

- 自动识别节点倍率，并分别归类为独立节点组：

  - 高倍率节点（倍率 ≥2）
  - 低倍率节点（倍率 ≤0.5）

- 脚本内策略组、节点组均支持自定义控制是否启用

## 内置策略组

> _若不需要某个策略组，可在脚本中将对应开关设为 `false`_

- `默认节点`
- `国外AI`
- `YouTube`
- `谷歌服务`
- `Github`
- `微软服务`
- `Telegram`
- `Pixiv`
- `Steam`
- `Twitter`
- `广告拦截`
- `下载专用`
- `其他外网`
- `国内网站`

## 内置节点组

> - _若不需要某个节点组，可在脚本中将对应开关设为 `false`_
> - _若机场订阅中不存在对应节点组的节点，则该节点组不会显示_
> - _未匹配节点组或未启用节点组的节点，将统一归类至 「其他节点」_

- `香港`
- `美国`
- `日本`
- `韩国`
- `新加坡`
- `中国大陆`
- `台湾省`
- `英国`
- `德国`
- `马来西亚`
- `土耳其`
- `加拿大`
- `澳大利亚`
- `低倍率节点`
- `高倍率节点`
- `其他节点`

## 效果展示

- 客户端： [FlClash](https://github.com/chen08209/FlClash)

|                                                                                                   |                                                                                                   |                                                                                                   |                                                                                                   |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/mihomo/IMG_1.jpg) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/mihomo/IMG_2.jpg) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/mihomo/IMG_3.jpg) | ![img](https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Image/mihomo/IMG_4.jpg) |

## 致谢

感谢以下项目以及所有上游项目

- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet/blob/main/Mihomo/global_script.js)

- [YiXuanZX/rules](https://github.com/YiXuanZX/rules)

- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)

- [TG-Twilight/AWAvenue-Ads-Rule](https://github.com/TG-Twilight/AWAvenue-Ads-Rule)

- [DustinWin/ruleset_geodata](https://github.com/DustinWin/ruleset_geodata)

- [SukkaW/Surge](https://github.com/SukkaW/Surge)
