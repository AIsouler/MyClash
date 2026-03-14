// --- 1. 静态配置区域 ---

// 定义全局排除节点的正则表达式
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|⚠️|@|Expire|http|com/iu;

// 地区定义
const regionDefinitions = [
  {
    name: '🇭🇰 香港',
    regex: /(?=.*(港|🇭🇰|HK|[Hh]ong\s*[Kk]ong))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: '🇯🇵 日本',
    regex: /^(?!.*免费)(?=.*(日本|🇯🇵|JP|[Jj]apan))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png',
  },
  {
    name: '🇺🇸 美国',
    regex: /(?=.*(美|🇺🇸|US|[Aa]merica|[Uu]nited\s*[Ss]tates))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png',
  },
  {
    name: '🇸🇬 新加坡',
    regex: /(?=.*(新加坡|狮城|🇸🇬|SG|[Ss]ingapore))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png',
  },
  {
    name: '🇹🇼 台湾省',
    regex: /(?=.*(台湾|🇹🇼|TW|[Tt]ai\s*[Ww]an))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Taiwan.png',
  },
  {
    name: '🇰🇷 韩国',
    regex: /(?=.*(韩|🇰🇷|KR|[Kk]orea))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png',
  },
  {
    name: '🇬🇧 英国',
    regex: /(?=.*(英|🇬🇧|UK|[Uu]nited\s*[Kk]ingdom|[Bb]ritain))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png',
  },
  {
    name: '🇩🇪 德国',
    regex: /(?=.*(德国|🇩🇪|DE|[Gg]ermany))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png',
  },
  {
    name: '🇫🇷 法国',
    regex: /(?=.*(法国|🇫🇷|FR|[Ff]rance))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/France.png',
  },
  {
    name: '🇨🇦 加拿大',
    regex: /(?=.*(加拿大|🇨🇦|CA|[Cc]anada))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png',
  },
  {
    name: '🇦🇺 澳大利亚',
    regex: /(?=.*(澳大利亚|🇦🇺|AU|[Aa]ustralia))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png',
  },
  {
    name: '🇷🇺 俄罗斯',
    regex: /(?=.*(俄罗斯|🇷🇺|RU|[Rr]ussia))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Russia.png',
  },
  {
    name: '⛵ 低倍率节点',
    regex: /^(?!.*(?:剩|期|客户端|软件)).*(?:(?<!\d)0\.[0-5]|下载|低倍)/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available_1.png',
  },
  {
    name: '✈️ 高倍率节点',
    regex:
      /(?:[*xX✕✖⨉]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*xX✕✖⨉]))/u,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png',
  },
];

// 策略组通用配置
const groupBaseOption = {
  interval: 600,
  timeout: 3000,
  url: 'https://www.gstatic.com/generate_204',
  lazy: false,
  'max-failed-times': 3,
  hidden: false,
};

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
  AWAvenue_Ads: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash.mrs',
    path: './ruleset/AWAvenue_Ads.mrs',
  },
  DownloadApps: {
    ...ruleProviderCommonClassical,
    ...ruleProviderFormatText,
    url: 'https://raw.githubusercontent.com/AIsouler/MyClash/main/Rules/DownloadApps.txt',
    path: './ruleset/DownloadApps.txt',
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/DustinWin/ruleset_geodata/mihomo-ruleset/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
  },
  epicgames: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/epicgames.mrs',
    path: './ruleset/epicgames.mrs',
  },
  nvidia_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/nvidia@cn.mrs',
    path: './ruleset/nvidia@cn.mrs',
  },
  ai: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/DustinWin/ruleset_geodata/mihomo-ruleset/ai.mrs',
    path: './ruleset/ai.mrs',
  },
  youtube: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs',
    path: './ruleset/youtube.mrs',
  },
  google: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs',
    path: './ruleset/google.mrs',
  },
  google_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.mrs',
    path: './ruleset/google_ip.mrs',
  },
  github: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs',
    path: './ruleset/github.mrs',
  },
  microsoft: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs',
    path: './ruleset/microsoft.mrs',
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft@cn.mrs',
    path: './ruleset/microsoft@cn.mrs',
  },
  telegram: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs',
    path: './ruleset/telegram.mrs',
  },
  telegram_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatText,
    url: 'https://core.telegram.org/resources/cidr.txt',
    path: './ruleset/telegram_ip.txt',
  },
  pixiv: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/pixiv.mrs',
    path: './ruleset/pixiv.mrs',
  },
  steam: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam.mrs',
    path: './ruleset/steam.mrs',
  },
  steam_cn: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/steam@cn.mrs',
    path: './ruleset/steam@cn.mrs',
  },
  twitter: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs',
    path: './ruleset/twitter.mrs',
  },
  twitter_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/twitter.mrs',
    path: './ruleset/twitter_ip.mrs',
  },
  private: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
  },
  gfw: {
    ...ruleProviderCommonDomain,
    ...ruleProviderFormatMrs,
    url: 'https://raw.githubusercontent.com/DustinWin/ruleset_geodata//mihomo-ruleset/gfw.mrs',
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
    url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
  },
};

// --- 2. 服务规则数据结构 ---
const serviceConfigs = [
  {
    key: 'ai',
    name: '国外AI',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png',
  },
  {
    key: 'google',
    name: '谷歌服务',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png',
  },
  {
    key: 'github',
    name: 'GitHub',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/GitHub.png',
  },
  {
    key: 'microsoft',
    name: '微软服务',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png',
  },
  {
    key: 'pixiv',
    name: 'Pixiv',
    icon: 'https://play-lh.googleusercontent.com/Ls9opXo6-wfEWmbBU8heJaFS8HwWydssWE1J3vexIGvkF-UJDqcW7ZMD8w6dQABfygONd4z3Yt4TfRDZAPYq=w480-h960-rw',
  },
  {
    key: 'steam',
    name: 'Steam',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png',
  },
  {
    key: 'twitter',
    name: 'Twitter',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Twitter.png',
  },
  {
    key: 'adblock',
    name: '广告拦截',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png',
    reject: true,
  },
];

// --- 3. 主入口 ---

function main(config) {
  // 排除匹配到的节点
  if (config.proxies && Array.isArray(config.proxies)) {
    config.proxies = config.proxies.filter(
      (proxy) => !excludeFilter.test(proxy.name),
    );
  }

  // 为生成后的配置加上过滤字段（如果 proxy-providers 存在）
  if (config['proxy-providers']) {
    Object.keys(config['proxy-providers']).forEach((key) => {
      config['proxy-providers'][key]['exclude-filter'] = excludeFilter.source;
    });
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

  // 先匹配倍率，后匹配地区
  const lowGroup = regionGroups['⛵ 低倍率节点'];
  const highGroup = regionGroups['✈️ 高倍率节点'];

  const otherProxies = [];
  const remainProxies = [];

  // 倍率分类
  for (const proxy of proxies) {
    const name = proxy.name;

    if (
      regionDefinitions.find((r) => r.name === '⛵ 低倍率节点').regex.test(name)
    ) {
      lowGroup.proxies.push(name);
      continue;
    }

    if (
      regionDefinitions.find((r) => r.name === '✈️ 高倍率节点').regex.test(name)
    ) {
      highGroup.proxies.push(name);
      continue;
    }

    remainProxies.push(name);
  }

  // 地区分类
  for (const name of remainProxies) {
    let matched = false;

    for (const region of regionDefinitions) {
      if (region.name === '⛵ 低倍率节点' || region.name === '✈️ 高倍率节点')
        continue;

      if (region.regex.test(name)) {
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
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: r.name,
        type: 'url-test',
        tolerance: 100,
        icon: r.icon,
        proxies: groupData.proxies,
      });
    }
  });

  const regionGroupNames = generatedRegionGroups.map((g) => g.name);

  if (otherProxies.length > 0) {
    generatedRegionGroups.push({
      ...groupBaseOption,
      name: '其他节点',
      type: 'select',
      proxies: otherProxies,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png',
    });
  }

  // 构建功能策略组
  const functionalGroups = [];

  functionalGroups.push({
    ...groupBaseOption,
    name: '默认节点',
    type: 'select',
    proxies: [...regionGroupNames, '其他节点'].filter(
      (n) => n !== '其他节点' || otherProxies.length > 0,
    ),
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png',
  });

  serviceConfigs.forEach((svc) => {
    let groupProxies;
    if (svc.reject) {
      groupProxies = ['REJECT', 'REJECT-DROP', 'PASS', '直连'];
    } else {
      groupProxies = ['默认节点', ...regionGroupNames];
    }

    functionalGroups.push({
      ...groupBaseOption,
      name: svc.name,
      type: 'select',
      proxies: groupProxies,
      icon: svc.icon,
    });
  });

  // 添加其他策略组
  functionalGroups.push(
    {
      ...groupBaseOption,
      name: '下载专用',
      type: 'select',
      proxies: ['直连', '默认节点'],
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png',
    },
    {
      ...groupBaseOption,
      name: '直连',
      type: 'select',
      proxies: [
        '🇨🇳 直连（IPv4优先）',
        '🇨🇳 直连（IPv6优先）',
        '🇨🇳 直连（双栈）',
      ],
      url: 'https://connectivitycheck.platform.hicloud.com/generate_204',
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png',
    },
  );

  // --- 4. 覆盖基础配置 ---

  config.proxies.push(
    {
      name: '🇨🇳 直连（IPv4优先）',
      type: 'direct',
      'ip-version': 'ipv4-prefer',
    },
    {
      name: '🇨🇳 直连（IPv6优先）',
      type: 'direct',
      'ip-version': 'ipv6-prefer',
    },
    {
      name: '🇨🇳 直连（双栈）',
      type: 'direct',
    },
  );

  // 组装最终结果
  config['proxy-groups'] = [...functionalGroups, ...generatedRegionGroups];
  config['rule-providers'] = ruleProviders;

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
    'fake-ip-range6': 'fc00::/18',
    'fake-ip-filter': ['rule-set:fakeip_filter'],
    nameserver: ['https://dns.alidns.com/dns-query'],
    'direct-nameserver': ['system'],
    'proxy-server-nameserver': ['https://doh.pub/dns-query'],
    'nameserver-policy': {
      '*': 'system',
      '+.arpa': 'system',
      'rule-set:gfw': 'https://dns.google/dns-query#默认节点',
    },
  };

  // hosts 配置
  config['hosts'] = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['1.12.12.21', '120.53.53.53'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],
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
    'skip-domain': ['Mijia Cloud', '+.oray.com', '+.push.apple.com'],
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
    'auto-redirect': true,
    'auto-detect-interface': true,
    'dns-hijack': ['udp://any:53', 'tcp://any:53'],
  };

  config['rules'] = [
    // 阻断 YouTube UDP 流量
    'AND,((NETWORK,UDP),(DST-PORT,443),(RULE-SET,youtube)),REJECT',

    // 私有网络直连
    'RULE-SET,private,直连',
    'RULE-SET,private_ip,直连,no-resolve',

    // 进程规则
    'PROCESS-NAME,com.perol.pixez,Pixiv', // Pixez
    'PROCESS-NAME,com.perol.play.pixez,Pixiv', // Pixez Google Play 版
    'RULE-SET,DownloadApps,下载专用', // 常见磁力下载软件

    // 国内直连
    'RULE-SET,steam_cn,直连',
    'RULE-SET,epicgames,直连',
    'RULE-SET,nvidia_cn,直连',
    'RULE-SET,microsoft_cn,直连',

    // 广告拦截
    'RULE-SET,AWAvenue_Ads,广告拦截',

    // 代理规则（域名）
    'RULE-SET,ai,国外AI',
    'RULE-SET,youtube,YouTube',
    'RULE-SET,google,谷歌服务',
    'RULE-SET,github,GitHub',
    'RULE-SET,microsoft,微软服务',
    'RULE-SET,telegram,Telegram',
    'RULE-SET,pixiv,Pixiv',
    'RULE-SET,steam,Steam',
    'RULE-SET,twitter,Twitter',

    // 代理规则（IP）
    'RULE-SET,google_ip,谷歌服务,no-resolve',
    'RULE-SET,telegram_ip,Telegram,no-resolve',
    'RULE-SET,twitter_ip,Twitter,no-resolve',

    // 兜底规则
    'RULE-SET,gfw,默认节点',
    'RULE-SET,cn,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,默认节点',
  ];

  return config;
}
