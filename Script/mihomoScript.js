// --- 1. 静态配置区域 ---

// 脚本链接：https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Script/mihomoScript.js

/**
 * 整个脚本的总开关
 * true = 启用
 * false = 禁用
 */
const enable = true;

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
 * 节点组配置，用于分类地区节点和倍率节点
 * 未启用的节点组将不会被生成，且该节点组的节点会被分类到其他节点组中
 * true = 启用
 * false = 禁用
 */
const regionDefinitionsEnable = {
  香港: true,
  日本: true,
  美国: true,
  英国: true,
  新加坡: true,
  台湾省: true,
  低倍率节点: true,
  高倍率节点: true,
};

/**
 * 全局排除节点过滤配置
 * 该配置用于启用全局排除节点过滤功能
 * true = 启用
 * false = 禁用
 */
const excludeFilterEnable = true;

// 定义全局排除节点的正则表达式，用于排除非地区的信息节点
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|⚠️|@|Expire|http|com/u;

// rules 预定义
const rules = [
  // 私有网络直连
  'RULE-SET,private,直连',
  'RULE-SET,private_ip,直连,no-resolve',

  // 进程规则
  'RULE-SET,DownloadApps,下载专用', // 常见磁力下载软件

  // 国内直连
  'RULE-SET,steam_cn,直连',
  'RULE-SET,epicgames,直连',
  'RULE-SET,nvidia_cn,直连',
  'RULE-SET,microsoft_cn,直连',
  'RULE-SET,cloudflare_cn,直连',
];

// 定义节点组
const regionDefinitions = [
  {
    name: '香港',
    regex: /(港|🇭🇰|\bHK\b|hong\s*kong)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: '日本',
    regex: /(日本|🇯🇵|\bJP\b|japan)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png',
  },
  {
    name: '美国',
    regex: /(美|🇺🇸|\bUS\b|america|united\s*states)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png',
  },
  {
    name: '英国',
    regex: /(英国|🇬🇧|\bUK\b|united\s*kingdom|britain|england)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_Kingdom.png',
  },
  {
    name: '新加坡',
    regex: /(新加坡|狮城|🇸🇬|\bSG\b|singapore)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
  },
  {
    name: '台湾省',
    regex: /(台湾|🇹🇼|\bTW\b|tai\s*wan)/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png',
  },
  {
    name: '低倍率节点',
    regex: /^(?!.*(?:剩|期|客户端|软件))(?=.*(?:0\.[0-5]|下载|低倍)).*/u,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Available_1.png',
  },
  {
    name: '高倍率节点',
    regex:
      /(?:[*×✕✖⨉]\s*(?:[2-9]\d*(?:\.\d+)?))|(?:(?:[2-9]\d*(?:\.\d+)?)\s*(?:倍|[*×✕✖⨉]))/iu,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png',
  },
];

// Rule Providers 通用配置
const ruleProviderFormatYaml = { format: 'yaml' };
const ruleProviderFormatText = { format: 'text' };
const ruleProviderFormatMrs = { format: 'mrs' };

const ruleProviderCommonDomain = {
  type: 'http',
  interval: 86400,
  behavior: 'domain',
};
const ruleProviderCommonIpcidr = {
  type: 'http',
  interval: 86400,
  behavior: 'ipcidr',
};
const ruleProviderCommonClassical = {
  type: 'http',
  interval: 86400,
  behavior: 'classical',
};

// 定义 Rule Providers
const ruleProviders = {
  adblockmihomolite: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
    path: './ruleset/adblockmihomolite.mrs',
  },
  DownloadApps: {
    ...ruleProviderCommonClassical,
    ...ruleProviderFormatText,
    url: 'https://fastly.jsdelivr.net/gh/AIsouler/MyClash@main/Rules/DownloadApps.txt',
    path: './ruleset/DownloadApps.txt',
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatText,
    url: 'https://fastly.jsdelivr.net/gh/juewuy/ShellCrash@dev/public/fake_ip_filter.list',
    path: './ruleset/fakeip-filter.list',
  },
  epicgames: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/epicgames.mrs',
    path: './ruleset/epicgames.mrs',
  },
  nvidia_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/nvidia@cn.mrs',
    path: './ruleset/nvidia@cn.mrs',
  },
  ai: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ai-!cn.mrs',
    path: './ruleset/ai.mrs',
  },
  youtube: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs',
    path: './ruleset/youtube.mrs',
  },
  googlefcm: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs',
    path: './ruleset/googlefcm.mrs',
  },
  google: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs',
    path: './ruleset/google.mrs',
  },
  google_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs',
    path: './ruleset/google_ip.mrs',
  },
  github: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs',
    path: './ruleset/github.mrs',
  },
  microsoft: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs',
    path: './ruleset/microsoft.mrs',
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft@cn.mrs',
    path: './ruleset/microsoft@cn.mrs',
  },
  telegram: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs',
    path: './ruleset/telegram.mrs',
  },
  telegram_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/echs-top/proxy@main/rules/mrs/telegram_ip.mrs',
    path: './ruleset/telegram_ip.mrs',
  },
  pixiv: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/pixiv.mrs',
    path: './ruleset/pixiv.mrs',
  },
  steam: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam.mrs',
    path: './ruleset/steam.mrs',
  },
  steam_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam@cn.mrs',
    path: './ruleset/steam@cn.mrs',
  },
  twitter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs',
    path: './ruleset/twitter.mrs',
  },
  twitter_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs',
    path: './ruleset/twitter_ip.mrs',
  },
  private: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
  },
  gfw: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs',
    path: './ruleset/gfw.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
    path: './ruleset/cn.mrs',
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
  },
  emby: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
    path: './ruleset/emby.mrs',
  },
  emby_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/666OS/rules@release/mihomo/ip/Emby.mrs',
    path: './ruleset/emby_ip.mrs',
  },
  spotify: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/spotify.mrs',
    path: './ruleset/spotify.mrs',
  },
  tiktok: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/tiktok.mrs',
    path: './ruleset/tiktok.mrs',
  },
  netflix: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs',
    path: './ruleset/netflix.mrs',
  },
  netflix_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs',
    path: './ruleset/netflix_ip.mrs',
  },
  cloudflare: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare.mrs',
    path: './ruleset/cloudflare.mrs',
  },
  cloudflare_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare@cn.mrs',
    path: './ruleset/cloudflare_cn.mrs',
  },
  cloudflare_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudflare.mrs',
    path: './ruleset/cloudflare_ip.mrs',
  },
  apple: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs',
    path: './ruleset/apple.mrs',
  },
  connectivity_check: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/connectivity-check.mrs',
    path: './ruleset/connectivity-check.mrs',
  },
  category_ntp: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ntp.mrs',
    path: './ruleset/category-ntp.mrs',
  },
};

// --- 2. 功能策略组数据结构 ---

// 策略组通用配置
const groupBaseOption = {
  interval: 600,
  timeout: 3000,
  url: 'https://g.cn/generate_204',
  lazy: false,
  'max-failed-times': 3,
  hidden: false,
};

const serviceConfigs = [
  {
    key: 'ai',
    name: 'AI',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    rules: ['RULE-SET,ai,AI'],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png',
    rules: [
      'AND,((NETWORK,UDP),(DST-PORT,443),(RULE-SET,youtube)),REJECT', // 阻断 YouTube UDP 流量
      'RULE-SET,youtube,YouTube',
    ],
  },
  {
    key: 'googlefcm',
    name: 'FCM',
    icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/fcm.png',
    rules: ['RULE-SET,googlefcm,FCM'],
  },
  {
    key: 'google',
    name: 'Google',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    rules: ['RULE-SET,google,Google', 'RULE-SET,google_ip,Google,no-resolve'],
  },
  {
    key: 'github',
    name: 'GitHub',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/GitHub.png',
    rules: ['RULE-SET,github,GitHub'],
  },
  {
    key: 'microsoft',
    name: 'Microsoft',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png',
    rules: ['RULE-SET,microsoft,Microsoft'],
  },
  {
    key: 'apple',
    name: 'Apple',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png',
    rules: ['RULE-SET,apple,Apple'],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    rules: [
      'RULE-SET,telegram,Telegram',
      'RULE-SET,telegram_ip,Telegram,no-resolve',
    ],
  },
  {
    key: 'cloudflare',
    name: 'Cloudflare',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png',
    rules: [
      'RULE-SET,cloudflare,Cloudflare',
      'RULE-SET,cloudflare_ip,Cloudflare,no-resolve',
    ],
  },
  {
    key: 'pixiv',
    name: 'Pixiv',
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
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Steam.png',
    rules: ['RULE-SET,steam,Steam'],
  },
  {
    key: 'twitter',
    name: 'Twitter',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitter.png',
    rules: [
      'RULE-SET,twitter,Twitter',
      'RULE-SET,twitter_ip,Twitter,no-resolve',
    ],
  },
  {
    key: 'emby',
    name: 'Emby',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png',
    rules: [
      'RULE-SET,emby,Emby',
      'RULE-SET,emby_ip,Emby,no-resolve',
      'DOMAIN-KEYWORD,emby,Emby',
    ],
  },
  {
    key: 'spotify',
    name: 'Spotify',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png',
    rules: ['RULE-SET,spotify,Spotify'],
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png',
    rules: ['RULE-SET,tiktok,TikTok'],
  },
  {
    key: 'netflix',
    name: 'Netflix',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png',
    rules: [
      'RULE-SET,netflix,Netflix',
      'RULE-SET,netflix_ip,Netflix,no-resolve',
    ],
  },
  {
    key: 'adblock',
    name: '广告拦截',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png',
    rules: ['RULE-SET,adblockmihomolite,广告拦截'],
    reject: true,
  },
];

// --- 3. 主入口 ---

function main(config) {
  if (!enable) return config;

  // 排除匹配到的节点
  if (config.proxies && Array.isArray(config.proxies) && excludeFilterEnable) {
    config.proxies = config.proxies.filter(
      (proxy) => !excludeFilter.test(proxy.name),
    );
  }

  const proxies = config?.proxies || [];
  const proxyCount = proxies.length;
  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object'
      ? Object.keys(config['proxy-providers']).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理');
  }

  // 高效代理分类 (单次遍历)
  const regionGroups = {};
  regionDefinitions.forEach(
    (r) =>
      (regionGroups[r.name] = {
        ...r,
        proxies: [],
      }),
  );

  // 节点组分类
  const lowGroup = regionGroups['低倍率节点'];
  const highGroup = regionGroups['高倍率节点'];
  const otherProxies = [];

  for (const proxy of proxies) {
    const name = proxy.name;
    if (
      regionDefinitionsEnable['低倍率节点'] &&
      regionDefinitions.find((r) => r.name === '低倍率节点').regex.test(name)
    ) {
      lowGroup.proxies.push(name);
    }

    if (
      regionDefinitionsEnable['高倍率节点'] &&
      regionDefinitions.find((r) => r.name === '高倍率节点').regex.test(name)
    ) {
      highGroup.proxies.push(name);
    }

    let matched = false;
    for (const region of regionDefinitions) {
      if (region.name === '低倍率节点' || region.name === '高倍率节点')
        continue;

      if (region.regex.test(name) && regionDefinitionsEnable[region.name]) {
        regionGroups[region.name].proxies.push(name);
        matched = true;
        break;
      }
    }

    // 未分类的归为其他节点
    if (!matched) {
      otherProxies.push(name);
    }
  }

  // 构建地区策略组
  const generatedRegionGroups = [];
  regionDefinitions.forEach((r) => {
    const groupData = regionGroups[r.name];
    if (groupData.proxies.length > 0) {
      // 构建 url-test 节点组
      const autoTestName = `${r.name}-自动选择`;
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: autoTestName,
        type: 'url-test',
        tolerance: 100,
        icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png',
        proxies: groupData.proxies,
        hidden: true,
      });

      // 构建 select 节点组
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: r.name,
        type: 'select',
        icon: r.icon,
        proxies: [autoTestName, ...groupData.proxies],
      });
    }
  });

  if (otherProxies.length > 0) {
    generatedRegionGroups.push({
      ...groupBaseOption,
      name: '其他节点',
      type: 'select',
      proxies: otherProxies,
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png',
    });
  }

  const regionGroupNames = generatedRegionGroups
    .filter((g) => g.type === 'select')
    .map((g) => g.name);

  // 构建功能策略组
  const functionalGroups = [];

  functionalGroups.push({
    ...groupBaseOption,
    name: '默认代理',
    type: 'select',
    proxies: [...regionGroupNames],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
  });

  serviceConfigs.forEach((svc) => {
    if (ruleOptionsEnable[svc.key]) {
      rules.push(...svc.rules);

      let groupProxies;
      if (svc.reject) {
        groupProxies = ['REJECT', 'REJECT-DROP', 'PASS'];
      } else if (
        svc.key === 'microsoft' ||
        svc.key === 'apple' ||
        svc.key === 'spotify'
      ) {
        groupProxies = ['默认代理', '直连', ...regionGroupNames];
      } else if (svc.key === 'googlefcm') {
        groupProxies = ['直连', '默认代理', ...regionGroupNames];
      } else {
        groupProxies = ['默认代理', ...regionGroupNames];
      }

      functionalGroups.push({
        ...groupBaseOption,
        name: svc.name,
        type: 'select',
        proxies: groupProxies,
        icon: svc.icon,
      });
    }
  });

  // 添加其他策略组
  functionalGroups.push(
    {
      ...groupBaseOption,
      name: '下载专用',
      type: 'select',
      proxies: ['直连', '默认代理'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Download.png',
    },
    {
      ...groupBaseOption,
      name: '直连',
      type: 'select',
      proxies: ['🇨🇳 直连 | IPv4优先', '🇨🇳 直连 | IPv6优先', '🇨🇳 直连 | 双栈'],
      url: 'https://connectivitycheck.platform.hicloud.com/generate_204',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png',
    },
  );

  // 构建 GLOBAL 全局策略组
  const allGroupNames = [
    ...functionalGroups.map((g) => g.name),
    ...generatedRegionGroups.map((g) => g.name),
  ];
  const globalGroup = {
    ...groupBaseOption,
    name: 'GLOBAL',
    type: 'select',
    proxies: allGroupNames,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
  };

  // --- 4. 覆盖基础配置 ---

  config.proxies.push(
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
  );

  // 组装最终结果
  config['proxy-groups'] = [
    globalGroup,
    ...functionalGroups,
    ...generatedRegionGroups,
  ];
  config['rule-providers'] = ruleProviders;
  config['rules'] = [
    ...rules,

    // 兜底规则
    'RULE-SET,gfw,默认代理',
    'RULE-SET,cn,直连',
    'DOMAIN-WILDCARD,*.cn,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,默认代理',
  ];

  config['allow-lan'] = true;
  config['ipv6'] = true;
  config['bind-address'] = '*';
  config['unified-delay'] = true;
  config['tcp-concurrent'] = true;
  config['keep-alive-idle'] = 600;
  config['keep-alive-interval'] = 60;
  config['find-process-mode'] = 'strict';

  config['external-controller'] = '[::]:9090';
  config['external-ui'] = 'ui';
  config['external-ui-url'] =
    'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip';

  config['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  };

  // 国内外 DNS 定义
  const chinaDNS = [
    'system',
    'https://dns.alidns.com/dns-query',
    'https://doh.pub/dns-query',
  ];
  const foreignDNS = [
    'https://1.1.1.1/dns-query#默认代理',
    'https://8.8.8.8/dns-query#默认代理',
  ];

  // 直连规则集列表
  const direct_rules = [
    'private',
    'cn',
    'googlefcm',
    'steam_cn',
    'epicgames',
    'nvidia_cn',
    'microsoft_cn',
    'cloudflare_cn',
  ];

  // DNS 配置
  config['dns'] = {
    enable: true,
    ipv6: true,
    listen: ':1053',
    'cache-algorithm': 'arc',
    'use-hosts': true,
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-range-v6': 'fc00::/18',
    'fake-ip-filter': [
      '+.cn',
      'rule-set:category_ntp',
      'rule-set:fakeip_filter',
      'rule-set:connectivity_check',
      ...direct_rules.map((rule) => `rule-set:${rule}`),
    ],
    'proxy-server-nameserver': [
      'https://doh.pub/dns-query#DIRECT',
      'https://dns.alidns.com/dns-query#DIRECT',
    ],
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [...foreignDNS],
    'nameserver-policy': {
      '*': 'system',
      '+.arpa': 'system',
      '+.cn': [...chinaDNS],
      [`rule-set:${[...direct_rules, 'microsoft', 'apple', 'spotify'].join(',')}`]:
        [...chinaDNS],
    },
    'direct-nameserver': ['system', '223.5.5.5', '119.29.29.29'],
    'direct-nameserver-follow-policy': true,
  };

  // hosts 配置
  config['hosts'] = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['1.12.12.12', '120.53.53.53'],

    // 解决谷歌商店无法下载的问题
    'services.googleapis.cn': ['services.googleapis.com'],

    // 屏蔽哔哩哔哩PCDN，解决访问视频卡顿问题
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
  };

  config['sniffer'] = {
    enable: true,
    'force-dns-mapping': true,
    'parse-pure-ip': true,
    'override-destination': false,
    sniff: {
      HTTP: {
        ports: [80, '8080-8880'],
        'override-destination': true,
      },
      TLS: {
        ports: [443, 8443],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    'skip-domain': [
      'Mijia Cloud',
      '+.oray.com',
      '+.push.apple.com',
      'cloudflare-ech.com',
    ],
    'skip-dst-address': ['rule-set:telegram_ip'],
  };

  config['ntp'] = {
    enable: true,
    'write-to-system': false,
    server: 'cn.ntp.org.cn',
  };

  config['tun'] = {
    enable: true,
    stack: 'system',
    'auto-route': true,
    'strict-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'dns-hijack': ['udp://any:53', 'tcp://any:53'],
  };

  return config;
}
