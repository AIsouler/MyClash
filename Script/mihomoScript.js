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
const ruleOptions = {
  microsoft: true, // 微软服务
  github: true, // Github服务
  google: true, // Google服务
  youtube: true, // YouTube
  ai: true, // 国外AI
  telegram: true, // Telegram通讯软件
  twitter: true, // Twitter社交平台
  steam: true, // Steam游戏平台
  ads: true, // 常见的网络广告
};

const skipIps = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "169.254.0.0/16",
  "127.0.0.0/8",
  "FC00::/7",
  "FE80::/10",
  "::1/128",
];

// 初始规则
const rules = [
  "RULE-SET,applications,下载软件",
  "RULE-SET,private,DIRECT",
  "RULE-SET,private_ip,DIRECT,no-resolve",
  "DOMAIN-SUFFIX,steamserver.net,DIRECT",
];

// 地区定义
const regionDefinitions = [
  {
    name: "🇭🇰 香港",
    regex: /港|🇭🇰|hk|hongkong|hong kong/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png",
  },
  {
    name: "🇺🇸 美国",
    regex: /(?!.*aus)(?=.*(美|🇺🇸|us(?!t)|usa|american|united states)).*/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png",
  },
  {
    name: "🇯🇵 日本",
    regex: /日本|🇯🇵|jp|japan/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png",
  },
  {
    name: "🇰🇷 韩国",
    regex: /韩|🇰🇷|kr|korea/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png",
  },
  {
    name: "🇸🇬 新加坡",
    regex: /新加坡|🇸🇬|sg|singapore/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png",
  },
  {
    name: "🇨🇳 中国大陆",
    regex: /中国|🇨🇳|cn|china/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png",
  },
  {
    name: "🇹🇼 台湾省",
    regex: /台湾|🇹🇼|tw|taiwan|tai wan/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png",
  },
  {
    name: "🇬🇧 英国",
    regex: /英|🇬🇧|uk|united kingdom|great britain/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png",
  },
  {
    name: "🇩🇪 德国",
    regex: /德国|🇩🇪|de|germany/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png",
  },
  {
    name: "🇲🇾 马来西亚",
    regex: /马来|🇲🇾|my|malaysia/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png",
  },
  {
    name: "🇹🇷 土耳其",
    regex: /土耳其|🇹🇷|tk|turkey/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png",
  },
  {
    name: "🇨🇦 加拿大",
    regex: /加拿大|🇨🇦|ca|canada/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png",
  },
  {
    name: "🇦🇺 澳大利亚",
    regex: /澳大利亚|🇦🇺|au|australia|sydney/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png",
  },
];
const excludeHighPercentage = true;
const globalRatioLimit = 2;

// DNS 配置
const chinaDNS = [
  "https://doh.pub/dns-query",
  "https://dns.alidns.com/dns-query",
];
// const foreignDNS = [
//   "https://dns.google/dns-query",
//   "https://dns.cloudflare.com/dns-query",
// ];
// const defaultDNS = ["119.29.29.29", "223.5.5.5"];
const dnsConfig = {
  enable: true,
  listen: ":1053",
  ipv6: true,
  "cache-algorithm": "arc",
  //"prefer-h3": true,
  "use-hosts": true,
  "use-system-hosts": true,
  //"respect-rules": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-range6": "3fff::/20",
  "fake-ip-filter": [
    "*.lan",
    "+.market.xiaomi.com",
    "localhost.ptlogin2.qq.com",
    "lancache.steamcontent.com",
    "rule-set:fakeip_filter",
  ],
  nameserver: chinaDNS,
  "direct-nameserver": ["system"],
  "proxy-server-nameserver": chinaDNS,
  "nameserver-policy": {
    "*": "system",
    "+.arpa": "system",
    "rule-set:gfw": "https://dns.google/dns-query#其他外网",
  },
};

// 通用配置
const ruleProviderCommonDomain = {
  type: "http",
  format: "mrs",
  interval: 86400,
  behavior: "domain",
};
const ruleProviderCommonIp = {
  type: "http",
  format: "mrs",
  interval: 86400,
  behavior: "ipcidr",
};
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: "https://www.gstatic.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false,
};

// 预定义 Rule Providers
const ruleProviders = {
  applications: {
    type: "http",
    format: "text",
    behavior: "classical",
    url: "https://github.com/DustinWin/ruleset_geodata/raw/refs/heads/mihomo-ruleset/applications.list",
    path: "./ruleset/applications.list",
    interval: 86400,
  },
  youtube: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs",
    path: "./ruleset/youtube.mrs",
  },
  AWAvenue_Ads: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
    path: "./ruleset/AWAvenue-Ads-Rule-Clash.mrs",
  },
  google: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs",
    path: "./ruleset/google.mrs",
  },
  google_ip: {
    ...ruleProviderCommonIp,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.mrs",
    path: "./ruleset/google_ip.mrs",
  },
  ai: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/JohnsonRan/CRules/mihomo/resources/rules/ai.mrs",
    path: "./ruleset/ai.mrs",
  },
  github: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs",
    path: "./ruleset/github.mrs",
  },
  microsoft: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs",
    path: "./ruleset/microsoft.mrs",
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft@cn.mrs",
    path: "./ruleset/microsoft@cn.mrs",
  },
  steam: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam.mrs",
    path: "./ruleset/steam.mrs",
  },
  steam_cn: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam@cn.mrs",
    path: "./ruleset/steam@cn.mrs",
  },
  twitter: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs",
    path: "./ruleset/twitter.mrs",
  },
  telegram: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs",
    path: "./ruleset/telegram.mrs",
  },
  telegram_ip: {
    ...ruleProviderCommonIp,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/telegram.mrs",
    path: "./ruleset/telegram_ip.mrs",
  },
  private: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs",
    path: "./ruleset/private.mrs",
  },
  private_ip: {
    ...ruleProviderCommonIp,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs",
    path: "./ruleset/private_ip.mrs",
  },
  gfw: {
    ...ruleProviderCommonDomain,
    url: "https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/gfw.mrs",
    path: "./ruleset/gfw.mrs",
  },
  cn: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
    path: "./ruleset/cn.mrs",
  },
  cn_ip: {
    ...ruleProviderCommonIp,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    path: "./ruleset/cn_ip.mrs",
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: "https://raw.githubusercontent.com/wwqgtxx/clash-rules/release/fakeip-filter.mrs",
    path: "./ruleset/fakeip-filter.mrs",
  },
};

// 倍率正则预编译
const multiplierRegex =
  /(?<=[xX✕✖⨉倍率])([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])*/i;

// --- 2. 服务规则数据结构 ---
// Icons 更新为 GitHub Raw
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
    key: "steam",
    name: "Steam",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png",
    rules: ["RULE-SET,steam_cn,国内网站", "RULE-SET,steam,Steam"],
  },
  {
    key: "twitter",
    name: "Twitter",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Twitter.png",
    rules: ["RULE-SET,twitter,Twitter"],
  },
  {
    key: "ads",
    name: "广告拦截",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png",
    rules: ["RULE-SET,adblockmihomo,广告拦截"],
    reject: true,
  },
];

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
  config["dns"] = dnsConfig;
  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true,
  };
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["keep-alive-interval"] = 1800;
  config["find-process-mode"] = "strict";
  config["geodata-mode"] = true;
  config["geodata-loader"] = "memconservative";
  config["geo-auto-update"] = true;
  config["geo-update-interval"] = 24;

  config["sniffer"] = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": false,
    "override-destination": true,
    sniff: {
      TLS: {
        ports: [443, 8443],
      },
      HTTP: {
        ports: [80, "8080-8880"],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    "skip-src-address": skipIps,
    "skip-dst-address": skipIps,
    "force-domain": [
      "+.google.com",
      "+.googleapis.com",
      "+.googleusercontent.com",
      "+.youtube.com",
      "+.facebook.com",
      "+.messenger.com",
      "+.fbcdn.net",
      "fbcdn-a.akamaihd.net",
    ],
    "skip-domain": ["Mijia Cloud", "+.oray.com"],
  };

  config["ntp"] = {
    enable: true,
    "write-to-system": false,
    server: "cn.ntp.org.cn",
  };
  config["tun"] = {
    stack: "mixed",
    "exclude-interface": ["NodeBabyLink"],
    "route-exclude-address": skipIps,
    "dns-hijack": ["any:53", "tcp://any:53"],
  };

  config.proxies.push({
    name: "直连",
    type: "direct",
    udp: true,
  });

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

    // 检查倍率
    if (excludeHighPercentage) {
      const match = multiplierRegex.exec(name);
      if (match && parseFloat(match[1]) > globalRatioLimit) {
        continue;
      }
    }

    // 尝试匹配地区
    for (const region of regionDefinitions) {
      if (region.regex.test(name)) {
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
    if (ruleOptions[svc.key]) {
      rules.push(...svc.rules);
      if (svc.provider) {
        ruleProviders[svc.provider.key] = {
          ...ruleProviderCommon,
          behavior: svc.provider.behavior,
          format: svc.provider.format,
          url: svc.provider.url,
          path: svc.provider.path,
        };
      }

      let groupProxies;
      if (svc.reject) {
        groupProxies = ["REJECT", "直连", "默认节点"];
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
        url: svc.url,
        icon: svc.icon,
      });
    }
  });

  // 3.4 添加通用兜底策略组
  rules.push(
    "RULE-SET,gfw,其他外网",
    "RULE-SET,cn,DIRECT",
    "RULE-SET,cn_ip,DIRECT",
    "MATCH,其他外网"
  );

  functionalGroups.push(
    {
      ...groupBaseOption,
      name: "下载软件",
      type: "select",
      proxies: ["直连", "REJECT", "默认节点", "国内网站", ...regionGroupNames],
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png",
    },
    {
      ...groupBaseOption,
      name: "其他外网",
      type: "select",
      proxies: ["默认节点", "国内网站", ...regionGroupNames],
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Streaming!CN.png",
    },
    {
      ...groupBaseOption,
      name: "国内网站",
      type: "select",
      proxies: ["直连", "默认节点", ...regionGroupNames],
      url: "http://wifi.vivo.com.cn/generate_204",
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/StreamingCN.png",
    }
  );

  // 3.5 组装最终结果
  config["proxy-groups"] = [...functionalGroups, ...generatedRegionGroups];

  config["rules"] = rules;
  config["rule-providers"] = ruleProviders;

  return config;
}
