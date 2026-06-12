// ------- AIsouler自用脚本 -------

/**
 * mihomo配置覆写脚本（精简版）
 * 作者：AIsouler
 * 原仓库：https://github.com/AIsouler/MyClash
 * 脚本链接：https://raw.githubusercontent.com/AIsouler/MyClash/refs/heads/main/Script/Script.js
 * 友情推荐，非常好用、省电且内存占用低的代理软件：https://github.com/appshubcc/Bettbox
 */

// --- 静态配置区域 ---

// 预定义 rules
const rules = [
  // 私有网络直连
  'RULE-SET,private,直连',
  'RULE-SET,private_ip,直连,no-resolve',

  // 国内直连
  'RULE-SET,games_cn,直连',
  'RULE-SET,epicgames,直连',
  'RULE-SET,apple_cn,直连',
  'DOMAIN,fsend.cn,直连',

  // 进程规则
  'RULE-SET,DownloadApps,直连', // 常见磁力下载软件
];

// 定义全局排除节点的正则表达式
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|⚠️|@|Expire|http|com/u;

// 定义地区策略组
const regionDefinitions = [
  {
    name: '香港',
    regex: /🇭🇰|港|HK|[Hh]ong\s*[Kk]ong/,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: '日本',
    regex: /^(🇯🇵|日本|JP|[Jj]apan)(?!.*免费).*$/,
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

// 定义基础 Rule Providers
const baseRuleProviders = {
  DownloadApps: {
    ...ruleProviderCommonClassical,
    ...ruleProviderFormatText,
    url: 'https://fastly.jsdelivr.net/gh/AIsouler/MyClash@main/Rules/DownloadApps.txt',
    path: './ruleset/DownloadApps.txt',
  },
  private: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
    'path-in-bundle': 'geo/geoip/private.mrs',
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
  },
  epicgames: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/epicgames.mrs',
    path: './ruleset/epicgames.mrs',
    'path-in-bundle': 'geo/geosite/epicgames.mrs',
  },
  games_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-games@cn.mrs',
    path: './ruleset/category-games@cn.mrs',
    'path-in-bundle': 'geo/geosite/category-games@cn.mrs',
  },
  apple_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple@cn.mrs',
    path: './ruleset/apple@cn.mrs',
    'path-in-bundle': 'geo/geosite/apple@cn.mrs',
  },
  github: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs',
    path: './ruleset/github.mrs',
    'path-in-bundle': 'geo/geosite/github.mrs',
  },
  youtube: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs',
    path: './ruleset/youtube.mrs',
    'path-in-bundle': 'geo/geosite/youtube.mrs',
  },
  google: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs',
    path: './ruleset/google.mrs',
    'path-in-bundle': 'geo/geosite/google.mrs',
  },
  google_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs',
    path: './ruleset/google_ip.mrs',
    'path-in-bundle': 'geo/geoip/google.mrs',
  },
  gfw: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs',
    path: './ruleset/gfw.mrs',
    'path-in-bundle': 'geo/geosite/gfw.mrs',
  },
  cn_additional: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
    path: './ruleset/cn-additional-list.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/direct.mrs',
    path: './ruleset/cn.mrs',
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
    'path-in-bundle': 'geo/geoip/cn.mrs',
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
  tolerance: 100,
  icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png',
  hidden: true,
};

// 定义分流策略组配置
const serviceConfigs = [
  {
    key: 'ai',
    name: 'AI',
    providers: {
      ai: {
        ...ruleProviderCommonDomain,
        ...ruleProviderFormatMrs,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ai-!cn.mrs',
        path: './ruleset/ai.mrs',
        'path-in-bundle': 'geo/geosite/category-ai-!cn.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    rules: ['RULE-SET,ai,AI'],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    providers: {
      telegram: {
        ...ruleProviderCommonDomain,
        ...ruleProviderFormatMrs,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs',
        path: './ruleset/telegram.mrs',
        'path-in-bundle': 'geo/geosite/telegram.mrs',
      },
      telegram_ip: {
        ...ruleProviderCommonIpcidr,
        ...ruleProviderFormatMrs,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs',
        path: './ruleset/telegram_ip.mrs',
        'path-in-bundle': 'geo/geoip/telegram.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    rules: [
      'RULE-SET,telegram,Telegram',
      'RULE-SET,telegram_ip,Telegram,no-resolve',
    ],
  },
  {
    key: 'steam',
    name: 'Steam',
    providers: {
      steam: {
        ...ruleProviderCommonDomain,
        ...ruleProviderFormatMrs,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam.mrs',
        path: './ruleset/steam.mrs',
        'path-in-bundle': 'geo/geosite/steam.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Steam.png',
    rules: ['RULE-SET,steam,Steam'],
  },
  {
    key: 'adblock',
    name: '广告拦截',
    proxyMode: 'reject',
    providers: {
      adblockmihomolite: {
        ...ruleProviderCommonDomain,
        ...ruleProviderFormatMrs,
        url: 'https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
        path: './ruleset/adblockmihomolite.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png',
    rules: ['RULE-SET,adblockmihomolite,广告拦截'],
  },
];

// 定义创建地区策略组的函数
function createRegionGroup(name, icon, proxies) {
  const autoTestName = `${name}-自动选择`;
  return [
    {
      ...urlTestBaseOption,
      name: autoTestName,
      proxies,
    },
    {
      ...selectBaseOption,
      name,
      icon,
      proxies: [autoTestName, ...proxies],
    },
  ];
}

// --- 主入口 ---

function main(config) {
  // 移除已废弃的属性
  delete config['global-client-fingerprint'];

  // 排除匹配到的节点
  if (Array.isArray(config.proxies)) {
    config.proxies = config.proxies.filter(
      (proxy) => !excludeFilter.test(proxy.name),
    );
  }

  // 获取节点列表
  const proxies = config.proxies || [];

  // 验证节点列表是否存在代理节点
  const allDirectOrReject = proxies.every((p) => {
    const type = p.type?.toLowerCase();
    return type === 'direct' || type === 'reject';
  });

  if (!proxies.length || allDirectOrReject) {
    throw new Error(
      '配置文件中未找到任何代理节点，请使用机场提供的配置文件进行覆写',
    );
  }

  // --- 构建地区组和倍率组 ---

  // 节点分类
  const regionGroups = Object.fromEntries(
    regionDefinitions.map((r) => [r.name, { ...r, proxies: [] }]),
  );
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
    .flatMap((r) =>
      createRegionGroup(r.name, r.icon, regionGroups[r.name].proxies),
    );

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
  const groupNamesOfSelect = generatedRegionGroups
    .filter((g) => g.type === 'select')
    .map((g) => g.name);

  // 定义分流策略组对应的策略组成员
  const proxyModes = {
    default: ['默认代理', ...groupNamesOfSelect],
    direct: ['默认代理', '直连', ...groupNamesOfSelect],
    reject: ['REJECT', 'REJECT-DROP', 'PASS'],
  };

  // 生成代理策略组
  functionalGroups.push({
    ...selectBaseOption,
    name: '默认代理',
    proxies: [...groupNamesOfSelect],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
  });

  // 构建分流策略组
  for (const svc of serviceConfigs) {
    finalRules.push(...svc.rules);

    // 添加分流策略组对应的 Rule Providers
    const providers = svc.providers || {};
    for (const [providerName, providerConfig] of Object.entries(providers)) {
      finalRuleProviders[providerName] = providerConfig;
    }

    functionalGroups.push({
      ...selectBaseOption,
      name: svc.name,
      icon: svc.icon,
      proxies: [...proxyModes[svc.proxyMode || 'default']],
    });
  }

  // 添加其他策略组
  functionalGroups.push({
    ...selectBaseOption,
    name: '直连',
    proxies: ['🇨🇳 直连 | IPv4优先', '🇨🇳 直连 | IPv6优先', '🇨🇳 直连 | 双栈'],
    url: 'https://connectivitycheck.platform.hicloud.com/generate_204',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png',
  });

  // 构建 GLOBAL 全局策略组
  const globalGroup = {
    ...selectBaseOption,
    name: 'GLOBAL',
    proxies: [
      ...functionalGroups.map((g) => g.name),
      ...generatedRegionGroups.map((g) => g.name),
    ],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
  };

  // --- DNS配置 ---

  // 读取订阅中的 DNS 配置，保留订阅中的 proxy-server-nameserver 和 proxy-server-nameserver-policy
  // 用以解决部分机场使用私有 DNS 导致无法解析节点的问题
  const originalDns = config.dns || {};

  // 过滤 proxy-server-nameserver 中常见的公共 DNS
  const commonDnsRegex =
    /(223\.5\.5\.5|223\.6\.6\.6|119\.29\.29\.29|114\.114\.114\.114|180\.76\.76\.76|1\.1\.1\.1|1\.0\.0\.1|8\.8\.8\.8|8\.8\.4\.4|alidns|doh\.pub|dot\.pub|dns\.baidu|dns\.google|cloudflare)/i;

  const originalProxyServerNameserver = (
    originalDns['proxy-server-nameserver'] || []
  ).filter((dns) => !commonDnsRegex.test(String(dns)));

  const originalProxyServerNameserverPolicy =
    originalDns['proxy-server-nameserver-policy'] || {};

  // 国内外 DNS 定义
  const chinaDNS = [
    'https://dns.alidns.com/dns-query#DIRECT',
    'https://doh.pub/dns-query#DIRECT',
  ];
  const foreignDNS = [
    'https://dns.cloudflare.com/dns-query#默认代理',
    'https://dns.google/dns-query#默认代理',
  ];

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
    'fake-ip-filter': ['rule-set:private', 'rule-set:fakeip_filter'],

    // 合并订阅中的 proxy-server-nameserver
    'proxy-server-nameserver': [...chinaDNS, ...originalProxyServerNameserver],

    // 合并订阅中的 proxy-server-nameserver-policy
    'proxy-server-nameserver-policy': {
      ...originalProxyServerNameserverPolicy,
    },

    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [...foreignDNS],
    'nameserver-policy': {
      'rule-set:cn': [...chinaDNS],
    },
    'direct-nameserver': ['system', '223.5.5.5', '119.29.29.29'],
  };

  // --- 覆盖基础配置 ---

  // 添加直连节点
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

  config['proxy-groups'] = [
    globalGroup,
    ...functionalGroups,
    ...generatedRegionGroups,
  ];
  config['rule-providers'] = finalRuleProviders;

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

  config['hosts'] = {
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

  config['ntp'] = {
    enable: true,
    'write-to-system': false,
    server: 'ntp.aliyun.com',
    port: 123,
    interval: 60,
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

  config['rules'] = [
    ...finalRules,

    // 代理规则
    'RULE-SET,github,默认代理',
    'RULE-SET,youtube,默认代理',
    'RULE-SET,google,默认代理',
    'RULE-SET,google_ip,默认代理,no-resolve',

    // 兜底规则
    'RULE-SET,gfw,默认代理',
    'RULE-SET,cn_additional,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,默认代理',
  ];

  return config;
}
