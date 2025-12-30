// --- 1. 静态配置区域 ---

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
  ai: true, // 国外AI
  youtube: true, // YouTube
  google: true, // Google服务
  github: true, // Github服务
  microsoft: true, // 微软服务
  telegram: true, // Telegram通讯软件
  twitter: true, // Twitter社交平台
  steam: true, // Steam游戏平台
  pixiv: true, // Pixiv绘画网站
  ads: true, // 常见的网络广告
};

/**
 * 节点组配置
 * true = 启用
 * false = 禁用
 * 未启用的节点组将不会被生成，且该节点组的节点会被分类到其他节点组中
 */
const regionDefinitionsEnable = {
  "🇭🇰 香港": true,
  "🇺🇸 美国": true,
  "🇯🇵 日本": true,
  "🇰🇷 韩国": true,
  "🇸🇬 新加坡": true,
  "🇨🇳 中国大陆": true,
  "🇹🇼 台湾省": true,
  "🇬🇧 英国": true,
  "🇩🇪 德国": true,
  "🇲🇾 马来西亚": true,
  "🇹🇷 土耳其": true,
  "🇨🇦 加拿大": true,
  "🇦🇺 澳大利亚": true,
  "⛵ 低倍率节点": true,
  "✈️ 高倍率节点": true,
};

const skipIps = [
  "10.0.0.0/8",
  "100.64.0.0/10",
  "169.254.0.0/16",
  "172.16.0.0/12",
  "192.0.0.0/24",
  "192.168.0.0/16",
  "198.18.0.0/15",
  "FC00::/7",
  "FE80::/10",
  "::1/128",
];

// 初始规则
const rules = [
  "RULE-SET,private,DIRECT",
  "RULE-SET,private_ip,DIRECT,no-resolve",
  "RULE-SET,AWAvenue_Ads,广告拦截",
  "RULE-SET,steam_cn,DIRECT",
  "RULE-SET,epicgames,DIRECT",
  "RULE-SET,nvidia_cn,DIRECT",
  "PROCESS-NAME,nvcontainer.exe,DIRECT", // NVIDIA App 下载器
  "RULE-SET,applications,DIRECT",
  "DOMAIN-SUFFIX,githubusercontent.com,Github", // download 规则集包含此域名，但github直连下载速度比较慢，因此放在download前面优先匹配
  "DOMAIN-SUFFIX,greasyfork.org,其他外网",
  "RULE-SET,download,下载专用",
];

// 排除倍率 ≤0.5 的低倍率节点
const excludeLowMultiplier = "(?!.*0\\.[0-5])";

// 排除倍率 ≥2 的高倍率节点
// 使用 .source 可以直接获取正则内容的字符串，无需手动处理转义字符
const excludeHighMultiplier =
  /(?!.*(?:(?:[*xX✕✖⨉]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*xX✕✖⨉]))))/
    .source;

// 地区定义
const regionDefinitions = [
  {
    name: "🇭🇰 香港",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(港|🇭🇰|hk|hongkong|hong kong)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png",
  },
  {
    name: "🇺🇸 美国",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?!.*aus)(?=.*(美|🇺🇸|us(?!t)|usa|america|united states)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png",
  },
  {
    name: "🇯🇵 日本",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(日本|🇯🇵|jp|japan)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png",
  },
  {
    name: "🇰🇷 韩国",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(韩|🇰🇷|kr|korea)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png",
  },
  {
    name: "🇸🇬 新加坡",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(新加坡|🇸🇬|sg|singapore)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png",
  },
  {
    name: "🇨🇳 中国大陆",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(中国|🇨🇳|cn|china)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png",
  },
  {
    name: "🇹🇼 台湾省",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(台湾|🇹🇼|tw|taiwan|tai wan)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png",
  },
  {
    name: "🇬🇧 英国",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(英|🇬🇧|uk|united kingdom|great britain)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png",
  },
  {
    name: "🇩🇪 德国",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(德国|🇩🇪|de|germany)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png",
  },
  {
    name: "🇲🇾 马来西亚",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(马来|🇲🇾|my|malaysia)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png",
  },
  {
    name: "🇹🇷 土耳其",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(土耳其|🇹🇷|tk|turkey)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png",
  },
  {
    name: "🇨🇦 加拿大",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(加拿大|🇨🇦|ca|canada)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png",
  },
  {
    name: "🇦🇺 澳大利亚",
    regex: new RegExp(
      `^${excludeLowMultiplier}${excludeHighMultiplier}(?=.*(澳大利亚|🇦🇺|au|australia|sydney)).*`,
      "iu"
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png",
  },
  {
    name: "⛵ 低倍率节点",
    regex: /0\.[0-5]|0\.0|下载|低倍/u,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available_1.png",
  },
  {
    name: "✈️ 高倍率节点",
    regex:
      /(?:[*xX✕✖⨉]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*xX✕✖⨉]))/iu,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png",
  },
];

// 通用配置
const ruleProviderFormatYaml = { format: "yaml" };
const ruleProviderFormatTxt = { format: "text" };
const ruleProviderFormatMrs = { format: "mrs" };

const ruleProviderCommonDomain = {
  type: "http",
  interval: 86400,
  behavior: "domain",
};
const ruleProviderCommonIpcidr = {
  type: "http",
  interval: 86400,
  behavior: "ipcidr",
};
const ruleProviderCommonClassical = {
  type: "http",
  interval: 86400,
  behavior: "classical",
};
const groupBaseOption = {
  interval: 600,
  timeout: 5000,
  url: "https://www.gstatic.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false,
};

// 定义 Rule Providers
const ruleProviders = {
  AWAvenue_Ads: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
    path: "./ruleset/AWAvenue_Ads.mrs",
  },
  applications: {
    ...ruleProviderCommonClassical,
    ...ruleProviderFormatTxt,
    url: "https://raw.githubusercontent.com/DustinWin/ruleset_geodata/mihomo-ruleset/applications.list",
    path: "./ruleset/applications.list",
  },
  download: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatTxt,
    url: "https://ruleset.skk.moe/Clash/domainset/download.txt",
    path: "./ruleset/download.mrs",
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/DustinWin/ruleset_geodata/mihomo-ruleset/fakeip-filter.mrs",
    path: "./ruleset/fakeip-filter.mrs",
  },
  epicgames: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/epicgames.mrs",
    path: "./ruleset/epicgames.mrs",
  },
  nvidia_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/nvidia@cn.mrs",
    path: "./ruleset/nvidia@cn.mrs",
  },
  ai: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/DustinWin/ruleset_geodata/mihomo-ruleset/ai.mrs",
    path: "./ruleset/ai.mrs",
  },
  youtube: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs",
    path: "./ruleset/youtube.mrs",
  },
  google: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs",
    path: "./ruleset/google.mrs",
  },
  google_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.mrs",
    path: "./ruleset/google_ip.mrs",
  },
  github: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs",
    path: "./ruleset/github.mrs",
  },
  microsoft: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs",
    path: "./ruleset/microsoft.mrs",
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft@cn.mrs",
    path: "./ruleset/microsoft@cn.mrs",
  },
  telegram: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs",
    path: "./ruleset/telegram.mrs",
  },
  telegram_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/telegram.mrs",
    path: "./ruleset/telegram_ip.mrs",
  },
  pixiv: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat//meta/geo/geosite/pixiv.mrs",
    path: "./ruleset/pixiv.mrs",
  },
  steam: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam.mrs",
    path: "./ruleset/steam.mrs",
  },
  steam_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam@cn.mrs",
    path: "./ruleset/steam@cn.mrs",
  },
  twitter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs",
    path: "./ruleset/twitter.mrs",
  },
  twitter_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/twitter.mrs",
    path: "./ruleset/twitter_ip.mrs",
  },
  private: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs",
    path: "./ruleset/private.mrs",
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs",
    path: "./ruleset/private_ip.mrs",
  },
  gfw: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/DustinWin/ruleset_geodata//mihomo-ruleset/gfw.mrs",
    path: "./ruleset/gfw.mrs",
  },
  cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/YiXuanZX/rules/main/cn-additional-list.mrs",
    path: "./ruleset/cn.mrs",
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    path: "./ruleset/cn_ip.mrs",
  },
};

// --- 2. 服务规则数据结构 ---
const serviceConfigs = [
  {
    key: "ai",
    name: "国外AI",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
    rules: ["RULE-SET,ai,国外AI"],
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png",
    rules: ["RULE-SET,youtube,YouTube"],
  },
  {
    key: "google",
    name: "谷歌服务",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png",
    rules: [
      "RULE-SET,google,谷歌服务",
      "RULE-SET,google_ip,谷歌服务,no-resolve",
    ],
  },
  {
    key: "github",
    name: "Github",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/GitHub.png",
    rules: ["RULE-SET,github,Github"],
  },
  {
    key: "microsoft",
    name: "微软服务",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png",
    rules: ["RULE-SET,microsoft_cn,国内网站", "RULE-SET,microsoft,微软服务"],
  },
  {
    key: "telegram",
    name: "Telegram",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png",
    rules: [
      "RULE-SET,telegram,Telegram",
      "RULE-SET,telegram_ip,Telegram,no-resolve",
    ],
  },
  {
    key: "pixiv",
    name: "Pixiv",
    icon: "https://play-lh.googleusercontent.com/Ls9opXo6-wfEWmbBU8heJaFS8HwWydssWE1J3vexIGvkF-UJDqcW7ZMD8w6dQABfygONd4z3Yt4TfRDZAPYq=w480-h960-rw",
    rules: [
      "RULE-SET,pixiv,Pixiv",
      "PROCESS-NAME,com.perol.pixez,Pixiv",
      "PROCESS-NAME,com.perol.play.pixez,Pixiv",
    ],
  },
  {
    key: "steam",
    name: "Steam",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png",
    rules: ["RULE-SET,steam,Steam"],
  },
  {
    key: "twitter",
    name: "Twitter",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Twitter.png",
    rules: [
      "RULE-SET,twitter,Twitter",
      "RULE-SET,twitter_ip,Twitter,no-resolve",
    ],
  },
  {
    key: "ads",
    name: "广告拦截",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png",
    rules: [], // 规则写在了初始规则里面，优先匹配
    reject: true,
  },
];

// const excludeHighPercentage = true;
// const globalRatioLimit = 2;

// // 倍率正则预编译
// const multiplierRegex =
//   /(?<=[xX✕✖⨉倍率])([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])*/i;

// --- 3. 主入口 ---

function main(config) {
  if (!enable) return config;

  const proxies = config?.proxies || [];
  const proxyCount = proxies.length;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 3.1 覆盖基础配置
  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["mode"] = "rule";
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["keep-alive-idle"] = 600;
  config["keep-alive-interval"] = 60;
  config["find-process-mode"] = "strict";

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true,
  };

  // DNS 配置
  config["dns"] = {
    enable: true,
    listen: ":1053",
    "cache-algorithm": "arc",
    "use-hosts": true,
    "use-system-hosts": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["rule-set:fakeip_filter"],
    nameserver: ["https://dns.alidns.com/dns-query"],
    "direct-nameserver": ["system"],
    "proxy-server-nameserver": ["https://doh.pub/dns-query"],
    "nameserver-policy": {
      "*": "system",
      "+.arpa": "system",
      "rule-set:gfw": "https://dns.google/dns-query#其他外网",
    },
  };

  // hosts 配置
  config["hosts"] = {
    "dns.alidns.com": ["223.5.5.5", "223.6.6.6"],
    "doh.pub": ["1.12.12.21", "120.53.53.53"],
    "dns.google": ["8.8.8.8", "8.8.4.4"],
  };

  config["sniffer"] = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    sniff: {
      HTTP: {
        ports: [80, "8080-8880"],
      },
      TLS: {
        ports: [443, 8443],
      },

      QUIC: {
        ports: [443, 8443],
      },
    },
    "skip-src-address": skipIps,
    "skip-dst-address": skipIps,
    "skip-domain": ["Mijia Cloud", "+.oray.com", "+.push.apple.com"],
  };

  config["ntp"] = {
    enable: true,
    "write-to-system": false,
    server: "cn.ntp.org.cn",
  };

  config["tun"] = {
    enable: true,
    stack: "mixed",
    "auto-route": true,
    "auto-redirect": true,
    "auto-detect-interface": true,
    "exclude-interface": ["NodeBabyLink"],
    "route-exclude-address": skipIps,
    "dns-hijack": ["udp://any:53", "tcp://any:53"],
  };

  config.proxies.push(
    {
      name: "直连",
      type: "direct",
      udp: true,
    },
    {
      name: "拦截",
      type: "reject",
    }
  );

  // 3.2 高效代理分类 (单次遍历)
  const regionGroups = {};
  regionDefinitions.forEach(
    (r) =>
      (regionGroups[r.name] = {
        ...r,
        proxies: [],
      })
  );

  const otherProxies = [];

  for (let i = 0; i < proxyCount; i++) {
    const proxy = proxies[i];
    const name = proxy.name;
    let matched = false;

    // // 检查倍率
    // if (excludeHighPercentage) {
    //   const match = multiplierRegex.exec(name);
    //   if (match && parseFloat(match[1]) > globalRatioLimit) {
    //     continue;
    //   }
    // }

    // 尝试匹配地区
    for (const region of regionDefinitions) {
      if (
        region.regex.test(name) &&
        region.name in regionDefinitionsEnable &&
        regionDefinitionsEnable[region.name]
      ) {
        regionGroups[region.name].proxies.push(name);
        matched = true;
        break;
      }
    }

    if (!matched) {
      otherProxies.push(name);
    }
  }

  const generatedRegionGroups = [];
  regionDefinitions.forEach((r) => {
    const groupData = regionGroups[r.name];
    if (groupData.proxies.length > 0) {
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: r.name,
        type: "url-test",
        tolerance: 50,
        icon: r.icon,
        proxies: groupData.proxies,
      });
    }
  });

  const regionGroupNames = generatedRegionGroups.map((g) => g.name);

  if (otherProxies.length > 0) {
    generatedRegionGroups.push({
      ...groupBaseOption,
      name: "其他节点",
      type: "select",
      proxies: otherProxies,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png",
    });
  }

  // 3.3 构建功能策略组
  const functionalGroups = [];

  functionalGroups.push({
    ...groupBaseOption,
    name: "默认节点",
    type: "select",
    proxies: [...regionGroupNames, "其他节点", "直连"].filter(
      (n) => n !== "其他节点" || otherProxies.length > 0
    ),
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
  });

  serviceConfigs.forEach((svc) => {
    if (ruleOptionsEnable[svc.key]) {
      rules.push(...svc.rules);
      if (svc.provider) {
        ruleProviders[svc.provider.key] = {
          behavior: svc.provider.behavior,
          format: svc.provider.format,
          url: svc.provider.url,
          path: svc.provider.path,
        };
      }

      let groupProxies;
      if (svc.reject) {
        groupProxies = ["拦截", "直连", "默认节点"];
      } else if (svc.key === "biliintl" || svc.key === "bahamut") {
        groupProxies = ["默认节点", "直连", ...regionGroupNames];
      } else {
        groupProxies = ["默认节点", ...regionGroupNames, "直连"];
      }

      functionalGroups.push({
        ...groupBaseOption,
        name: svc.name,
        type: "select",
        proxies: groupProxies,
        icon: svc.icon,
      });
    }
  });

  // 3.4 添加通用兜底策略组
  rules.push(
    "RULE-SET,gfw,其他外网",
    "RULE-SET,cn,国内网站",
    "RULE-SET,cn_ip,国内网站",
    "MATCH,其他外网"
  );

  functionalGroups.push(
    {
      ...groupBaseOption,
      name: "下载专用",
      type: "select",
      proxies: ["直连", "默认节点", ...regionGroupNames],
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png",
    },
    {
      ...groupBaseOption,
      name: "其他外网",
      type: "select",
      proxies: ["默认节点", ...regionGroupNames],
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Streaming!CN.png",
    },
    {
      ...groupBaseOption,
      name: "国内网站",
      type: "select",
      proxies: ["直连", "默认节点", ...regionGroupNames],
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/StreamingCN.png",
    }
  );

  // 3.5 组装最终结果
  config["proxy-groups"] = [...functionalGroups, ...generatedRegionGroups];
  config["rules"] = rules;
  config["rule-providers"] = ruleProviders;

  return config;
}
