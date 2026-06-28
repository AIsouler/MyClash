/**
 * mihomo配置覆写脚本（全量版）
 * 作者：AIsouler
 * 原仓库：https://github.com/AIsouler/MyClash
 * 脚本链接：https://raw.githubusercontent.com/AIsouler/MyClash/main/Script/mihomoScript.js
 * 友情推荐，非常好用、省电且内存占用低的代理软件：https://github.com/appshubcc/Bettbox
 */

// --- 静态配置区域 ---

/**
 * 分流规则配置，会自动生成对应的策略组
 * true = 启用
 * false = 禁用
 */
const ruleOptionsEnable = {
  ai: true, // 国外AI服务
  youtube: true, // YouTube
  googlefcm: true, // FCM服务
  google: true, // Google服务
  github: true, // GitHub服务
  microsoft: true, // Microsoft服务
  apple: true, // Apple服务
  telegram: true, // Telegram通讯软件
  twitter: true, // Twitter社交平台
  instagram: true, // Instagram社交平台
  steam: true, // Steam游戏平台
  cloudflare: true, // Cloudflare服务
  pixiv: true, // Pixiv绘画网站
  emby: true, // Emby媒体服务
  spotify: true, // Spotify音乐服务
  tiktok: true, // TikTok短视频平台
  netflix: true, // Netflix视频服务
  adblock: true, // 广告拦截
};

/**
 * 全局排除高倍率节点配置
 * 该配置用于启用全局排除高倍率节点功能
 * true = 启用
 * false = 禁用
 */
const excludeHighRateProxiesEnable = false;

// 定义全局排除节点的正则表达式，用于排除非地区的信息节点
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|⚠️|@|Expire|http|com/u;

// 预定义 rules
const rules = [
  // 禁用国外 QUIC 流量
  'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',

  // 私有网络直连
  'RULE-SET,private,直连',
  'RULE-SET,private_ip,直连,no-resolve',

  // 国内直连
  'RULE-SET,games_cn,直连', // 已包含 steam 下载域名
  'RULE-SET,epicgames,直连',
  'RULE-SET,nvidia_cn,直连',
  'RULE-SET,cloudflare_cn,直连',
  'RULE-SET,apple_cn,直连',
  'RULE-SET,microsoft_cn,直连',
  'DOMAIN,fsend.cn,直连',
  'DOMAIN,international-gfe.download.nvidia.com,直连',
];

// 定义地区策略组
const regionDefinitions = [
  {
    name: '香港',
    regex: /🇭🇰|港|HK|[Hh]ong\s*[Kk]ong/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: '日本',
    regex: /🇯🇵|日本|JP|[Jj]apan/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png',
  },
  {
    name: '美国',
    regex: /🇺🇸|美|US|[Aa]merica|[Uu]nited\s*[Ss]tates/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png',
  },
  {
    name: '新加坡',
    regex: /🇸🇬|新加坡|狮城|SG|[Ss]ingapore/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
  },
  {
    name: '台湾省',
    regex: /🇹🇼|台湾|TW|[Tt]aiwan/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png',
  },
  {
    name: '低倍率节点',
    regex: /^(?!.*(?:剩|期|客户端|软件)).*(?:(?<!\d)0\.[0-5]|下载|低倍)/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Available_1.png',
  },
  {
    name: '高倍率节点',
    regex:
      /(?:[*×xX✕✖⨉]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*×xX✕✖⨉]))/u,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png',
  },
];

// Rule Providers 通用配置
const ruleProviderCommonDomain = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
};
const ruleProviderCommonIpcidr = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'ipcidr',
};

// 定义基础 Rule Providers
const baseRuleProviders = {
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },
  epicgames: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/epicgames.mrs',
    path: './ruleset/epicgames.mrs',
    'path-in-bundle': 'geo/geosite/epicgames.mrs',
  },
  nvidia_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/nvidia@cn.mrs',
    path: './ruleset/nvidia@cn.mrs',
    'path-in-bundle': 'geo/geosite/nvidia@cn.mrs',
  },
  games_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-games@cn.mrs',
    path: './ruleset/category-games@cn.mrs',
    'path-in-bundle': 'geo/geosite/category-games@cn.mrs',
  },
  private: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
    'path-in-bundle': 'geo/geoip/private.mrs',
  },
  gfw: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs',
    path: './ruleset/gfw.mrs',
    'path-in-bundle': 'geo/geosite/gfw.mrs',
  },
  cn_additional: {
    ...ruleProviderCommonDomain,
    url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
    path: './ruleset/cn-additional-list.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/direct.mrs',
    path: './ruleset/cn.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
    'path-in-bundle': 'geo/geoip/cn.mrs',
  },
  cloudflare_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare@cn.mrs',
    path: './ruleset/cloudflare@cn.mrs',
    'path-in-bundle': 'geo/geosite/cloudflare@cn.mrs',
  },
  apple_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple@cn.mrs',
    path: './ruleset/apple@cn.mrs',
    'path-in-bundle': 'geo/geosite/apple@cn.mrs',
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft@cn.mrs',
    path: './ruleset/microsoft@cn.mrs',
    'path-in-bundle': 'geo/geosite/microsoft@cn.mrs',
  },
};

// 策略组公共配置
const groupBaseOption = {
  interval: 600,
  timeout: 3000,
  url: 'https://g.cn/generate_204',
  lazy: true,
  'max-failed-times': 3,
};

// select策略组通用配置
const selectBaseOption = {
  ...groupBaseOption,
  type: 'select',
  hidden: false,
};

// url-test策略组通用配置
const urlTestBaseOption = {
  ...groupBaseOption,
  type: 'url-test',
  tolerance: 50,
  'exclude-type': 'DIRECT',
  icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png',
  hidden: true,
};

// load-balance策略组通用配置
const loadBalanceBaseOption = {
  ...groupBaseOption,
  type: 'load-balance',
  strategy: 'sticky-sessions',
  'exclude-type': 'DIRECT',
  icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Round_Robin.png',
  hidden: true,
};

// 定义分流策略组配置
const serviceConfigs = [
  {
    key: 'ai',
    name: 'AI',
    defaultSelected: '日本',
    providers: {
      ai: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ai-!cn.mrs',
        path: './ruleset/ai.mrs',
        'path-in-bundle': 'geo/geosite/category-ai-!cn.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    rules: ['RULE-SET,ai,AI'],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    providers: {
      youtube: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs',
        path: './ruleset/youtube.mrs',
        'path-in-bundle': 'geo/geosite/youtube.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png',
    rules: ['RULE-SET,youtube,YouTube'],
  },
  {
    key: 'googlefcm',
    name: 'FCM',
    direct: true,
    defaultSelected: '直连',
    providers: {
      googlefcm: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs',
        path: './ruleset/googlefcm.mrs',
        'path-in-bundle': 'geo/geosite/googlefcm.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/fcm.png',
    rules: ['RULE-SET,googlefcm,FCM'],
  },
  {
    key: 'google',
    name: 'Google',
    providers: {
      google: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs',
        path: './ruleset/google.mrs',
        'path-in-bundle': 'geo/geosite/google.mrs',
      },
      google_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs',
        path: './ruleset/google_ip.mrs',
        'path-in-bundle': 'geo/geoip/google.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    rules: ['RULE-SET,google,Google', 'RULE-SET,google_ip,Google,no-resolve'],
  },
  {
    key: 'github',
    name: 'GitHub',
    providers: {
      github: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs',
        path: './ruleset/github.mrs',
        'path-in-bundle': 'geo/geosite/github.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/GitHub.png',
    rules: ['RULE-SET,github,GitHub'],
  },
  {
    key: 'microsoft',
    name: 'Microsoft',
    direct: true,
    providers: {
      microsoft: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs',
        path: './ruleset/microsoft.mrs',
        'path-in-bundle': 'geo/geosite/microsoft.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png',
    rules: ['RULE-SET,microsoft,Microsoft'],
  },
  {
    key: 'apple',
    name: 'Apple',
    direct: true,
    providers: {
      apple: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs',
        path: './ruleset/apple.mrs',
        'path-in-bundle': 'geo/geosite/apple.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png',
    rules: ['RULE-SET,apple,Apple'],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    providers: {
      telegram: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs',
        path: './ruleset/telegram.mrs',
        'path-in-bundle': 'geo/geosite/telegram.mrs',
      },
      telegram_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs',
        path: './ruleset/telegram_ip.mrs',
        'path-in-bundle': 'geo/geoip/telegram.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    rules: ['RULE-SET,telegram,Telegram', 'RULE-SET,telegram_ip,Telegram,no-resolve'],
  },
  {
    key: 'cloudflare',
    name: 'Cloudflare',
    providers: {
      cloudflare: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare.mrs',
        path: './ruleset/cloudflare.mrs',
        'path-in-bundle': 'geo/geosite/cloudflare.mrs',
      },
      cloudflare_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudflare.mrs',
        path: './ruleset/cloudflare_ip.mrs',
        'path-in-bundle': 'geo/geoip/cloudflare.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png',
    rules: ['RULE-SET,cloudflare,Cloudflare', 'RULE-SET,cloudflare_ip,Cloudflare,no-resolve'],
  },
  {
    key: 'pixiv',
    name: 'Pixiv',
    providers: {
      pixiv: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/pixiv.mrs',
        path: './ruleset/pixiv.mrs',
        'path-in-bundle': 'geo/geosite/pixiv.mrs',
      },
    },
    icon: 'https://play-lh.googleusercontent.com/Ls9opXo6-wfEWmbBU8heJaFS8HwWydssWE1J3vexIGvkF-UJDqcW7ZMD8w6dQABfygONd4z3Yt4TfRDZAPYq=w480-h960-rw',
    rules: [
      'RULE-SET,pixiv,Pixiv',
      'PROCESS-NAME,com.perol.pixez,Pixiv', // Pixez
      'PROCESS-NAME,com.perol.play.pixez,Pixiv', // Pixez Google Play 版
    ],
  },
  {
    key: 'steam',
    name: 'Steam',
    direct: true,
    providers: {
      steam: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam.mrs',
        path: './ruleset/steam.mrs',
        'path-in-bundle': 'geo/geosite/steam.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Steam.png',
    rules: ['RULE-SET,steam,Steam'],
  },
  {
    key: 'twitter',
    name: 'Twitter',
    providers: {
      twitter: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs',
        path: './ruleset/twitter.mrs',
        'path-in-bundle': 'geo/geosite/twitter.mrs',
      },
      twitter_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs',
        path: './ruleset/twitter_ip.mrs',
        'path-in-bundle': 'geo/geoip/twitter.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitter.png',
    rules: ['RULE-SET,twitter,Twitter', 'RULE-SET,twitter_ip,Twitter,no-resolve'],
  },
  {
    key: 'instagram',
    name: 'Instagram',
    providers: {
      instagram: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/instagram.mrs',
        path: './ruleset/instagram.mrs',
        'path-in-bundle': 'geo/geosite/instagram.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Instagram.png',
    rules: ['RULE-SET,instagram,Instagram'],
  },
  {
    key: 'emby',
    name: 'Emby',
    direct: true,
    providers: {
      emby: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
        path: './ruleset/emby.mrs',
        'path-in-bundle': 'geo/geosite/category-emby.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png',
    rules: ['RULE-SET,emby,Emby', 'DOMAIN-SUFFIX,mb3admin.com,Emby', 'DOMAIN-KEYWORD,emby,Emby'],
  },
  {
    key: 'spotify',
    name: 'Spotify',
    direct: true,
    providers: {
      spotify: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/spotify.mrs',
        path: './ruleset/spotify.mrs',
        'path-in-bundle': 'geo/geosite/spotify.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png',
    rules: ['RULE-SET,spotify,Spotify'],
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    providers: {
      tiktok: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/tiktok.mrs',
        path: './ruleset/tiktok.mrs',
        'path-in-bundle': 'geo/geosite/tiktok.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png',
    rules: ['RULE-SET,tiktok,TikTok'],
  },
  {
    key: 'netflix',
    name: 'Netflix',
    providers: {
      netflix: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs',
        path: './ruleset/netflix.mrs',
        'path-in-bundle': 'geo/geosite/netflix.mrs',
      },
      netflix_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs',
        path: './ruleset/netflix_ip.mrs',
        'path-in-bundle': 'geo/geoip/netflix.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png',
    rules: ['RULE-SET,netflix,Netflix', 'RULE-SET,netflix_ip,Netflix,no-resolve'],
  },
  {
    key: 'adblock',
    name: '广告拦截',
    reject: true,
    providers: {
      adblockmihomolite: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
        path: './ruleset/adblockmihomolite.mrs',
        'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png',
    rules: ['RULE-SET,adblockmihomolite,广告拦截'],
  },
];

// 定义创建地区策略组的函数
function createRegionGroup(name, icon, proxies) {
  const urlTestName = `${name}-自动选择`;
  const loadBalanceName = `${name}-负载均衡`;
  return [
    {
      ...urlTestBaseOption,
      name: urlTestName,
      proxies,
    },
    {
      ...loadBalanceBaseOption,
      name: loadBalanceName,
      proxies,
    },
    {
      ...selectBaseOption,
      name,
      icon,
      proxies: [...proxies, urlTestName, loadBalanceName],
    },
  ];
}

// --- 主入口 ---

function main(config) {
  const newConfig = {};

  // 排除匹配到的节点
  if (Array.isArray(config.proxies)) {
    const highRateRegex = excludeHighRateProxiesEnable
      ? regionDefinitions.find((r) => r.name === '高倍率节点')?.regex
      : null;

    config.proxies = config.proxies.filter(
      (proxy) => !excludeFilter.test(proxy.name) && !highRateRegex?.test(proxy.name),
    );
  }

  // 获取节点列表
  const proxies = config.proxies || [];

  // 验证节点列表是否存在代理节点
  const isAllDirectOrReject = proxies.every((p) => {
    const type = p.type?.toLowerCase();
    return type === 'direct' || type === 'reject';
  });

  if (!proxies.length || isAllDirectOrReject) {
    throw new Error('配置文件中未找到任何代理节点，请使用机场提供的配置文件进行覆写');
  }

  // --- 构建地区组和倍率组 ---

  // 节点分类
  const regionGroups = Object.fromEntries(regionDefinitions.map((r) => [r.name, { ...r, proxies: [] }]));
  const otherProxies = [];

  for (const proxy of proxies) {
    let matched = false;

    for (const region of regionDefinitions) {
      if (region.regex.test(proxy.name)) {
        regionGroups[region.name].proxies.push(proxy.name);

        // 如果匹配到的是地区组（非倍率组），则标记为已分类
        if (region.name !== '低倍率节点' && region.name !== '高倍率节点') {
          matched = true;
        }
      }
    }

    // 未匹配到地区组（不包含倍率组）的归为其他节点
    if (!matched) {
      otherProxies.push(proxy.name);
    }
  }

  // 构建地区策略组
  const generatedRegionGroups = regionDefinitions
    .filter((r) => regionGroups[r.name].proxies.length > 0)
    .flatMap((r) => createRegionGroup(r.name, r.icon, regionGroups[r.name].proxies));

  if (otherProxies.length > 0) {
    generatedRegionGroups.push(
      ...createRegionGroup(
        '其他节点',
        'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png',
        otherProxies,
      ),
    );
  }

  // --- 构建分流策略组 ---

  const functionalGroups = [];
  const finalRules = [...rules];
  const finalRuleProviders = { ...baseRuleProviders };

  // 筛选类型为 select 的地区策略组
  const groupNamesOfSelect = generatedRegionGroups.filter((g) => g.type === 'select').map((g) => g.name);

  // 生成基础策略组
  functionalGroups.push(
    {
      ...selectBaseOption,
      name: '默认代理',
      proxies: [...groupNamesOfSelect, '自动选择', '负载均衡'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
    },
    {
      ...urlTestBaseOption,
      name: '自动选择',
      'include-all': true,
    },
    {
      ...loadBalanceBaseOption,
      name: '负载均衡',
      'include-all': true,
    },
  );

  // 构建分流策略组
  for (const svc of serviceConfigs) {
    if (!ruleOptionsEnable[svc.key]) continue;

    finalRules.push(...svc.rules);

    // 添加分流策略组对应的 Rule Providers
    const providers = svc.providers || {};
    for (const [providerName, providerConfig] of Object.entries(providers)) {
      finalRuleProviders[providerName] = providerConfig;
    }

    // 添加分流策略组对应的节点列表
    const groupProxies = svc.reject
      ? ['REJECT', 'REJECT-DROP', 'PASS']
      : ['默认代理', '自动选择', '负载均衡', ...groupNamesOfSelect, ...(svc.direct ? ['直连'] : [])];

    functionalGroups.push({
      ...selectBaseOption,
      name: svc.name,
      icon: svc.icon,
      'default-selected': svc.defaultSelected,
      proxies: groupProxies,
    });
  }

  // 添加其他策略组
  functionalGroups.push(
    {
      ...selectBaseOption,
      name: '直连',
      proxies: ['🇨🇳 直连 | IPv4优先', '🇨🇳 直连 | IPv6优先', '🇨🇳 直连 | 双栈'],
      url: 'https://connectivitycheck.platform.hicloud.com/generate_204',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png',
    },
    {
      ...selectBaseOption,
      name: '漏网之鱼',
      proxies: ['默认代理', '直连'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Stack.png',
    },
  );

  // 构建 GLOBAL 全局策略组
  const globalGroup = {
    ...selectBaseOption,
    name: 'GLOBAL',
    proxies: [...functionalGroups.map((g) => g.name), ...generatedRegionGroups.map((g) => g.name)],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
  };

  // --- 添加基础配置 ---

  // DNS配置
  // 读取订阅中的 DNS 配置，保留订阅中的私有 DNS
  // 用以解决部分机场使用私有 DNS 导致无法解析节点的问题
  const originalDnsConfig = config.dns || {};

  // 过滤常见的公共 DNS
  const commonDnsRegex =
    /(223\.5\.5\.5|223\.6\.6\.6|119\.29\.29\.29|1\.12\.12\.12|120\.53\.53\.53|114\.114\.114\.114|180\.76\.76\.76|1\.1\.1\.1|1\.0\.0\.1|8\.8\.8\.8|8\.8\.4\.4|alidns|doh\.pub|dot\.pub|dns\.baidu|dns\.google|cloudflare|system)/i;

  const originalProxyServerNameserver = (originalDnsConfig['proxy-server-nameserver'] || []).filter(
    (dns) => !commonDnsRegex.test(String(dns)),
  );

  // 合并 nameserver-policy 和 proxy-server-nameserver-policy
  // 部分机场会把节点域名解析器写到 nameserver-policy 中
  const originalPolicyNameserver = {};

  for (const policy of [
    originalDnsConfig['proxy-server-nameserver-policy'] || {}, // 优先遍历此项配置
    originalDnsConfig['nameserver-policy'] || {},
  ]) {
    for (const [rule, dns] of Object.entries(policy)) {
      const dnsList = Array.isArray(dns) ? dns : [dns];

      // 只要有一个匹配公共 DNS，就跳过整个规则
      if (dnsList.some((item) => commonDnsRegex.test(String(item)))) {
        continue;
      }

      originalPolicyNameserver[rule] = dns;
    }
  }

  // 国内外 DNS 定义
  const chinaDNS = ['https://dns.alidns.com/dns-query#DIRECT', 'https://doh.pub/dns-query#DIRECT'];
  const foreignDNS = ['https://dns.cloudflare.com/dns-query#默认代理', 'https://dns.google/dns-query#默认代理'];

  newConfig['dns'] = {
    enable: true,
    ipv6: true,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-range6': 'fc00::/18',
    'fake-ip-filter': ['rule-set:private', 'rule-set:fakeip_filter'],
    'proxy-server-nameserver': [
      ...(originalProxyServerNameserver.length > 0 ? originalProxyServerNameserver : chinaDNS),
    ],
    ...(Object.keys(originalPolicyNameserver).length > 0 && {
      'proxy-server-nameserver-policy': originalPolicyNameserver,
    }),
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [...foreignDNS],
    'nameserver-policy': {
      'rule-set:cn': [...chinaDNS],
    },
    'direct-nameserver': ['system', '223.5.5.5', '119.29.29.29'],
  };

  // hosts 配置
  newConfig['hosts'] = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['1.12.12.12', '120.53.53.53'],
    'dns.cloudflare.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],

    // 解决谷歌商店无法下载的问题
    'services.googleapis.cn': ['services.googleapis.com'],

    // 屏蔽哔哩哔哩PCDN，解决访问视频卡顿问题
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
  };

  newConfig['allow-lan'] = true;
  newConfig['ipv6'] = true;
  newConfig['mode'] = 'rule';
  newConfig['log-level'] = 'info';
  newConfig['bind-address'] = '*';
  newConfig['unified-delay'] = true;
  newConfig['tcp-concurrent'] = true;
  newConfig['keep-alive-idle'] = 600;
  newConfig['keep-alive-interval'] = 60;
  newConfig['find-process-mode'] = 'strict';

  newConfig['external-controller'] = '127.0.0.1:9090';
  newConfig['external-ui'] = 'ui';
  newConfig['external-ui-url'] = 'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip';

  newConfig['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  };

  newConfig['ntp'] = {
    enable: true,
    'write-to-system': false,
    server: 'ntp.aliyun.com',
    port: 123,
    interval: 60,
  };

  newConfig['tun'] = {
    enable: true,
    stack: 'system',
    'auto-route': true,
    'strict-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'dns-hijack': ['any:53', 'tcp://any:53'],
  };

  // 添加节点
  newConfig['proxies'] = [
    ...config.proxies,
    {
      name: '🇨🇳 直连 | IPv4优先',
      type: 'direct',
      'ip-version': 'ipv4-prefer',
    },
    {
      name: '🇨🇳 直连 | IPv6优先',
      type: 'direct',
      'ip-version': 'ipv6-prefer',
    },
    {
      name: '🇨🇳 直连 | 双栈',
      type: 'direct',
    },
  ];

  newConfig['proxy-groups'] = [globalGroup, ...functionalGroups, ...generatedRegionGroups];
  newConfig['rule-providers'] = finalRuleProviders;

  newConfig['rules'] = [
    ...finalRules,

    // 兜底规则
    'RULE-SET,gfw,默认代理',
    'RULE-SET,cn_additional,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,漏网之鱼',
  ];

  return newConfig;
}
