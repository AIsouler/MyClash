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
  if (!enable) return config;

  // 排除匹配到的节点
  if (excludeFilterEnable && Array.isArray(config.proxies)) {
    config.proxies = config.proxies.filter(
      (proxy) => !excludeFilter.test(proxy.name),
    );
  }

  // 获取节点列表
  const proxies = config.proxies || [];
  if (!proxies.length) {
    throw new Error('配置文件中未找到任何节点');
  }

  // --- 构建地区组和倍率组 ---

  // 节点分类
  const enabledDefinitions = regionDefinitions.filter(
    (r) => regionDefinitionsEnable[r.name] === true,
  );
  const regionGroups = Object.fromEntries(
    enabledDefinitions.map((r) => [r.name, { ...r, proxies: [] }]),
  );
  const otherProxies = [];

  for (const proxy of proxies) {
    let matched = false;

    for (const region of enabledDefinitions) {
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
  const generatedRegionGroups = enabledDefinitions
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
    directfirst: ['直连', '默认代理', ...groupNamesOfSelect],
    reject: ['REJECT', 'REJECT-DROP', 'PASS'],
  };

  // 生成默认代理策略组
  functionalGroups.push({
    ...selectBaseOption,
    name: '默认代理',
    proxies: [...groupNamesOfSelect],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
  });

  // 构建分流策略组
  for (const svc of serviceConfigs) {
    if (!ruleOptionsEnable[svc.key]) continue;

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

  // --- 覆盖基础配置 ---

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

  // 国内外 DNS 定义
  const chinaDNS = [
    'https://dns.alidns.com/dns-query#DIRECT',
    'https://doh.pub/dns-query#DIRECT',
  ];
  const foreignDNS = [
    'https://1.1.1.1/dns-query#默认代理',
    'https://8.8.8.8/dns-query#默认代理',
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
    'fake-ip-filter': [
      'rule-set:private',
      'rule-set:category_ntp',
      'rule-set:fakeip_filter',
      'rule-set:connectivity_check',
      'rule-set:geolocation_cn',
    ],
    'proxy-server-nameserver': [...chinaDNS],
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [...foreignDNS],
    'nameserver-policy': {
      '*': 'system',
      '+.arpa': 'system',
      'rule-set:private': 'system',
      'rule-set:cn': [...chinaDNS],
    },
    'direct-nameserver': [...chinaDNS],
    'direct-nameserver-follow-policy': true,
  };

  config['hosts'] = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['1.12.12.12', '120.53.53.53'],

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

    // 兜底规则
    'RULE-SET,gfw,默认代理',
    'RULE-SET,cn_additional,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,默认代理',
  ];

  return config;
}
