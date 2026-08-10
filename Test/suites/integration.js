'use strict';

const groupByName = (groups, name) => groups.find((g) => g.name === name);
const proxyNames = (proxies) => proxies.map((p) => p.name);

/** 临时修改 ruleOptionsEnable 的若干选项，执行完成后恢复，避免污染后续用例 */
function withOptions(api, patch, fn) {
  const saved = {};
  for (const key of Object.keys(patch)) {
    saved[key] = api.ruleOptionsEnable[key];
    api.ruleOptionsEnable[key] = patch[key];
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(patch)) api.ruleOptionsEnable[key] = saved[key];
  }
}

/**
 * 集成测试：直接调用 main() 对模拟订阅进行覆写并断言输出。
 * meta: { full, regions }
 */
function runIntegrationTests(h, api, meta, fx, loadScript, scriptFile) {
  // ---------------- 节点过滤与标准化 ----------------
  h.section('集成测试 · 节点过滤与标准化');
  h.test('过滤 DIRECT/REJECT/REMATCH 与信息节点', () => {
    const out = api.main(fx.typicalSubscription());
    const n = proxyNames(out.proxies);
    for (const bad of ['DIRECT', 'REJECT', 'REMATCH', '官方网站', '剩余流量', '节点到期 2026-08-01']) {
      h.assert(!n.includes(bad), `不应包含节点 ${bad}`);
    }
  });
  h.test('保留有效节点并自动补地区国旗', () => {
    const out = api.main(fx.typicalSubscription());
    const n = proxyNames(out.proxies);
    h.assert(n.includes('🇭🇰 HK 02 - 香港'));
    h.assert(n.includes('🇯🇵 JAPAN-02'));
    h.assert(n.includes('🇸🇬 SG 01 | 新加坡'));
  });
  h.test('dialer-proxy 指向被重命名节点 → 引用同步更新', () => {
    const out = api.main(fx.typicalSubscription());
    const p = out.proxies.find((x) => x.name === '🇯🇵 东京');
    h.assert(p, '节点 🇯🇵 东京 应存在');
    h.assertEqual(p['dialer-proxy'], '🇯🇵 日本大阪');
  });
  h.test('dialer-proxy 指向被过滤节点 → 移除引用', () => {
    const out = api.main(fx.typicalSubscription());
    const p = out.proxies.find((x) => x.name === '测试节点A');
    h.assert(p, '节点 测试节点A 应存在');
    h.assert(!('dialer-proxy' in p), '应移除指向已过滤节点的引用');
  });
  h.test('dialer-proxy 指向存活未改名节点 → 引用保留', () => {
    const out = api.main(fx.typicalSubscription());
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 04');
    h.assertEqual(p['dialer-proxy'], '🇭🇰 香港 01 | 中转');
  });
  h.test('标准化后重名节点去重，保留首个且地区组不重复', () => {
    const cfg = fx.minimalSubscription();
    // 与既有 '🇭🇰 香港 A' 归一化后同名的节点（'香港 A' → '🇭🇰 香港 A'）
    cfg.proxies.push({
      name: '香港 A',
      type: 'ss',
      server: 'dup.example.com',
      port: 443,
      cipher: 'aes-256-gcm',
      password: 'x',
    });
    const out = api.main(cfg);
    const n = proxyNames(out.proxies);
    h.assertEqual(n.filter((x) => x === '🇭🇰 香港 A').length, 1, '同名节点应只保留一个');
    h.assertEqual(out.proxies.find((p) => p.name === '🇭🇰 香港 A').server, 'a.example.com', '应保留首个出现的节点');
    const hkGroup = groupByName(out['proxy-groups'], '香港');
    h.assertEqual(hkGroup.proxies.filter((x) => x === '🇭🇰 香港 A').length, 1, '地区组内不应出现重复节点');
  });

  // ---------------- GLOBAL 策略组 ----------------
  h.section('集成测试 · GLOBAL 策略组');
  h.test('GLOBAL 聚合所有策略组', () => {
    const out = api.main(fx.typicalSubscription());
    const global = groupByName(out['proxy-groups'], 'GLOBAL');
    h.assert(global, '缺少 GLOBAL 组');
    for (const g of out['proxy-groups']) {
      if (g.name !== 'GLOBAL') {
        h.assert(global.proxies.includes(g.name), `GLOBAL 缺少策略组 ${g.name}`);
      }
    }
  });

  // ---------------- DNS 与 hosts ----------------
  h.section('集成测试 · DNS 与 hosts');
  h.test('合并提取 nameserver 与 proxy-server-nameserver 中的私有 DNS', () => {
    const cfg = fx.typicalSubscription();
    // 移除 listen 触发条件，避免 listen 地址被当作公共 DNS 过滤干扰本用例
    delete cfg.dns.listen;
    cfg.dns['nameserver'] = ['8.8.8.8', 'https://private.example-dns.com/dns-query#proxy'];
    cfg.dns['proxy-server-nameserver'] = ['223.5.5.5', 'https://private-proxy.example-dns.com/dns-query#proxy'];
    const out = api.main(cfg);
    h.assertEqual(out.dns.enable, true);
    h.assertEqual(out.dns['enhanced-mode'], 'fake-ip');
    // 两个来源的私有 DNS 被合并保留（# 策略组后缀被剥离）
    h.assert(
      out.dns['proxy-server-nameserver'].includes('https://private.example-dns.com/dns-query'),
      '应保留 nameserver 中的私有 DNS',
    );
    h.assert(
      out.dns['proxy-server-nameserver'].includes('https://private-proxy.example-dns.com/dns-query'),
      '应保留 proxy-server-nameserver 中的私有 DNS',
    );
    // 两个来源的公共 DNS 均被过滤
    h.assert(!out.dns['proxy-server-nameserver'].includes('8.8.8.8'), 'nameserver 公共 DNS 应被过滤');
    h.assert(!out.dns['proxy-server-nameserver'].includes('223.5.5.5'), 'proxy-server-nameserver 公共 DNS 应被过滤');
    h.assert(!out.dns['proxy-server-nameserver'].some((d) => d.includes('#')), '私有 DNS 不应含 # 后缀');
  });
  h.test('私有 DNS 的 # 策略组后缀被剥离', () => {
    const cfg = fx.typicalSubscription();
    cfg.dns['proxy-server-nameserver-policy']['hk1.example.com'] = ['https://private.example-dns.com/dns-query#proxy'];
    const out = api.main(cfg);
    h.assertDeep(out.dns['proxy-server-nameserver-policy']['hk1.example.com'], [
      'https://private.example-dns.com/dns-query',
    ]);
  });
  h.test('私有 DNS 的 #direct 后缀被保留（忽略大小写）', () => {
    const cfg = fx.typicalSubscription();
    cfg.dns['nameserver'] = ['https://private.example-dns.com/dns-query#direct'];
    cfg.dns['proxy-server-nameserver-policy']['hk1.example.com'] = ['https://private.example-dns.com/dns-query#DIRECT'];
    const out = api.main(cfg);
    h.assert(
      out.dns['proxy-server-nameserver'].includes('https://private.example-dns.com/dns-query#direct'),
      '应保留 #direct 后缀',
    );
    h.assertDeep(out.dns['proxy-server-nameserver-policy']['hk1.example.com'], [
      'https://private.example-dns.com/dns-query#DIRECT',
    ]);
  });
  h.test('私有 DNS 的 #direct&参数 后缀被整条保留', () => {
    const cfg = fx.typicalSubscription();
    cfg.dns['nameserver'] = ['https://private.example-dns.com/dns-query#direct&ecs=2.2.2.2'];
    const out = api.main(cfg);
    h.assert(
      out.dns['proxy-server-nameserver'].includes('https://private.example-dns.com/dns-query#direct&ecs=2.2.2.2'),
      '应整条保留 #direct 及附加参数',
    );
  });
  h.test('节点域名对应 nameserver-policy 与 proxy-server-nameserver-policy 被保留', () => {
    const cfg = fx.typicalSubscription();
    // 补充 nameserver-policy 来源，验证其与 proxy-server-nameserver-policy 合并后一起保留
    cfg.dns['nameserver-policy'] = {
      'jp1.example.com': 'https://private-ns.example-dns.com/dns-query',
      'unrelated-ns.com': 'https://foo-ns.com/dns-query',
    };
    const out = api.main(cfg);
    h.assertDeep(out.dns['proxy-server-nameserver-policy'], {
      // 来自 proxy-server-nameserver-policy
      'hk1.example.com': 'https://private.example-dns.com/dns-query',
      '+.example.com': ['https://other-dns.com/dns-query'],
      // 来自 nameserver-policy
      'jp1.example.com': 'https://private-ns.example-dns.com/dns-query',
    });
  });
  h.test('节点 hosts 映射改写为 server，不再复制 hosts', () => {
    const out = api.main(fx.typicalSubscription());
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, '10.0.0.1', 'hosts 映射的节点 server 应被改写');
    h.assert(!('hk1.example.com' in out.hosts), '映射后的节点 hosts 不应复制到新配置');
    h.assert(!('www.unrelated.com' in out.hosts), '无关 hosts 应被过滤');
    h.assertDeep(out.hosts['dns.google'], ['8.8.8.8', '8.8.4.4']);
  });
  h.test('fake-ip-filter 中匹配节点域名的条目被保留', () => {
    const out = api.main(fx.typicalSubscription());
    const f = out.dns['fake-ip-filter'];
    h.assert(f.includes('hk1.example.com'), '精确匹配的节点域名应保留');
    h.assert(f.includes('+.example.com'), '后缀匹配的节点域名应保留');
    h.assert(f.includes('*.example.com'), '通配匹配的节点域名应保留');
    h.assert(!f.includes('www.unrelated.com'), '无关条目应被过滤');
    h.assert(!f.includes('rule-set:unrelated'), 'rule-set 条目应被过滤');
    h.assertEqual(f[0], 'rule-set:private');
    h.assertEqual(f[1], 'rule-set:fakeip_filter');
  });
  h.test('原配置无 fake-ip-filter → 仅保留默认条目', () => {
    const cfg = fx.typicalSubscription();
    delete cfg.dns['fake-ip-filter'];
    const out = api.main(cfg);
    h.assertDeep(out.dns['fake-ip-filter'], ['rule-set:private', 'rule-set:fakeip_filter']);
  });
  h.test('fake-ip-filter 保留 hosts 映射目标域名条目', () => {
    const out = api.main(fx.hostsMappedSubscription());
    const f = out.dns['fake-ip-filter'];
    h.assert(f.includes('+.example-apt.com'), '节点 hosts 映射目标域名对应的条目应保留');
    h.assert(!f.includes('+.unrelated-filter.com'), '与节点无关的条目应被过滤');
  });
  h.test('hosts 域名映射改写为节点 server，不再复制 hosts', () => {
    const out = api.main(fx.hostsMappedSubscription());
    const p = out.proxies.find((x) => x.name === '🇺🇸 美国 B');
    h.assertEqual(p.server, 'node-a1b2c3.example-apt.com', '节点 server 应改写为 hosts 映射的目标域名');
    h.assert(!('node-a1b2c3.example-node.biz' in out.hosts), '映射后的节点 hosts 不应复制到新配置');
  });
  h.test('hosts 链式映射改写为最终目标', () => {
    const out = api.main(fx.hostsChainSubscription());
    const p = out.proxies.find((x) => x.name === '🇺🇸 美国 B');
    h.assertEqual(p.server, '10.0.0.88', '链式映射应逐级解析到最终目标');
    h.assert(!('node-a1b2c3.example-node.biz' in out.hosts), '映射后的节点 hosts 不应复制到新配置');
    h.assert(!('node-b1b2c3.example-apt.com' in out.hosts), '中继 hosts 不应复制到新配置');
  });
  h.test('hosts 精确映射优先于通配映射', () => {
    const out = api.main(fx.hostsWildcardSubscription());
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 A');
    h.assertEqual(p.server, '1.1.1.1', '精确映射应优先于 +. 通配映射');
  });
  h.test('hosts 通配映射数组取首个值', () => {
    const out = api.main(fx.hostsWildcardSubscription());
    const p = out.proxies.find((x) => x.name === '🇯🇵 日本 B');
    h.assertEqual(p.server, '9.9.9.9', '通配映射数组应取首个值');
  });
  h.test('无 hosts 映射的节点 server 保持不变', () => {
    const out = api.main(fx.hostsWildcardSubscription());
    const p = out.proxies.find((x) => x.name === '🇺🇸 美国 C');
    h.assertEqual(p.server, 'us1.other.com');
  });
  h.test('通配映射与无关 hosts 均不复制到新配置', () => {
    const out = api.main(fx.hostsWildcardSubscription());
    h.assert(!('hk1.premium.example.com' in out.hosts), '映射条目不应出现在 hosts');
    h.assert(!('+.premium.example.com' in out.hosts), '通配映射条目不应出现在 hosts');
    h.assert(!('www.unrelated.com' in out.hosts), '无关 hosts 应被过滤');
  });
  h.test('proxy-server-nameserver 长度不为 1 时跳过 hosts 改写', () => {
    const cfg = fx.typicalSubscription();
    // 长度不为 1（含多个 DNS，其中一个包含 listen 值）→ 不触发改写
    cfg.dns['proxy-server-nameserver'] = ['8.8.8.8', '198.18.0.1:53'];
    const out = api.main(cfg);
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, 'hk1.example.com', 'proxy-server-nameserver 长度不为 1 时节点 server 不应被改写');
  });
  h.test('proxy-server-nameserver 未包含 dns.listen 时跳过 hosts 改写', () => {
    const cfg = fx.typicalSubscription();
    // 长度为 1 但不包含 listen 值 → 不触发改写
    cfg.dns['proxy-server-nameserver'] = ['8.8.8.8'];
    const out = api.main(cfg);
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, 'hk1.example.com', '未命中触发条件时节点 server 不应被改写');
  });
  h.test('未设置 dns.listen 时跳过 hosts 改写', () => {
    const cfg = fx.typicalSubscription();
    delete cfg.dns.listen;
    const out = api.main(cfg);
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, 'hk1.example.com', '未设置 dns.listen 时节点 server 不应被改写');
  });
  h.test('dns.listen 为空字符串时跳过 hosts 改写', () => {
    const cfg = fx.typicalSubscription();
    cfg.dns.listen = '';
    const out = api.main(cfg);
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, 'hk1.example.com', 'listen 为空字符串时节点 server 不应被改写');
    h.assert(!out.dns['proxy-server-nameserver'].includes(''), '不应将空串当作私有 DNS 保留');
  });
  h.test('无 dns/hosts 输入时生成默认配置', () => {
    const cfg = fx.typicalSubscription();
    delete cfg.dns;
    delete cfg.hosts;
    const out = api.main(cfg);
    h.assertEqual(out.dns.enable, true);
    h.assertDeep(out.hosts['dns.google'], ['8.8.8.8', '8.8.4.4']);
  });

  // ---------------- 配置选项切换 ----------------
  h.section('集成测试 · 配置选项切换');
  h.test('过滤高倍率节点=true → 移除高倍率节点及组', () =>
    withOptions(api, { 过滤高倍率节点: true }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!proxyNames(out.proxies).includes('日本 2x 高倍率'), '高倍率节点应被过滤');
      h.assert(!groupByName(out['proxy-groups'], '高倍率节点'), '不应生成高倍率组');
      h.assert(groupByName(out['proxy-groups'], '日本'), '日本组仍应存在');
    }),
  );
  h.test('生成倍率组=false → 不生成倍率组，节点按地区归类', () =>
    withOptions(api, { 生成倍率组: false }, () => {
      const out = api.main(fx.typicalSubscription());
      h.assert(!groupByName(out['proxy-groups'], '低倍率节点'), '不应生成低倍率组');
      h.assert(!groupByName(out['proxy-groups'], '高倍率节点'), '不应生成高倍率组');
      h.assert(
        proxyNames(out.proxies).some((n) => n.includes('0.3x')),
        '低倍率节点仍应保留',
      );
      h.assert(
        proxyNames(out.proxies).some((n) => n.includes('2x 速率')),
        '高倍率节点仍应保留',
      );
      h.assert(
        groupByName(out['proxy-groups'], '香港').proxies.some((n) => n.includes('0.5倍')),
        '倍率节点应按地区归类',
      );
      h.assert(
        groupByName(out['proxy-groups'], '日本').proxies.some((n) => n.includes('0.3x')),
        '倍率节点应按地区归类',
      );
    }),
  );
  h.test('生成地区自动选择组=false → 无自动选择组', () =>
    withOptions(api, { 生成地区自动选择组: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!out['proxy-groups'].some((g) => g.name.endsWith('-自动选择')), '不应有自动选择组');
      h.assert(groupByName(out['proxy-groups'], '香港'), '香港组仍应存在');
    }),
  );
  h.test('隐藏地区手动选择组=true → 地区组 hidden', () =>
    withOptions(api, { 隐藏地区手动选择组: true }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assertEqual(groupByName(out['proxy-groups'], '香港').hidden, true);
    }),
  );
  h.test('分流组添加所有节点=true → 分流组含全部节点', () =>
    withOptions(api, { 分流组添加所有节点: true }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(groupByName(out['proxy-groups'], 'AI').proxies.includes('🇭🇰 香港 A'), 'AI 组应含全部节点');
    }),
  );
  h.test('屏蔽国外QUIC=false → 移除 QUIC 规则', () =>
    withOptions(api, { 屏蔽国外QUIC: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!out.rules.some((r) => r.includes('DST-PORT,443') && r.includes('REJECT')), '不应含 QUIC 规则');
    }),
  );
  h.test('屏蔽国外QUIC=false → 不生成 cn_additional 规则集', () =>
    withOptions(api, { 屏蔽国外QUIC: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!out['rule-providers'].cn_additional, 'cn_additional 规则集不应生成');
      h.assert(out['rule-providers'].cn, 'cn 规则集仍应生成（供 nameserver-policy 使用）');
    }),
  );
  h.test('屏蔽国外QUIC=true → 生成 cn_additional 规则集', () => {
    const out = api.main(fx.minimalSubscription());
    h.assert(out['rule-providers'].cn_additional, 'cn_additional 规则集应生成');
  });
  h.test('关闭 AI 分流组 → 移除组/规则/规则集', () =>
    withOptions(api, { AI: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!groupByName(out['proxy-groups'], 'AI'), 'AI 组应被移除');
      h.assert(!out.rules.includes('RULE-SET,ai,AI'), 'AI 规则应被移除');
      h.assert(!out['rule-providers'].ai, 'ai 规则集应被移除');
    }),
  );
  h.test('关闭手动选择基础组 → 默认代理不含手动选择', () =>
    withOptions(api, { 手动选择: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!groupByName(out['proxy-groups'], '手动选择'), '手动选择组应被移除');
      h.assert(!groupByName(out['proxy-groups'], '默认代理').proxies.includes('手动选择'), '默认代理不应含手动选择');
    }),
  );
  h.test('过滤非地区节点=false → 保留信息节点', () =>
    withOptions(api, { 过滤非地区节点: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(proxyNames(out.proxies).includes('官网公告'), '信息节点应被保留');
    }),
  );

  // ---------------- 自定义节点 ----------------
  h.section('集成测试 · 自定义节点');
  h.test('未配置自定义节点 → 不生成自建节点组', () => {
    const out = api.main(fx.typicalSubscription());
    h.assert(!groupByName(out['proxy-groups'], '自建节点'), '不应生成自建节点组');
    h.assert(!proxyNames(out.proxies).some((n) => n.startsWith('自建-')), '不应出现自建前缀节点');
  });
  h.test('配置自定义节点 → 自建节点组/重名前缀/不参与 hosts 改写', () => {
    // 重新加载脚本并注入自定义节点（与订阅节点“香港 01 | 中转”标准化后重名）
    const customApi = loadScript(scriptFile, (code) =>
      code.replace(
        'const customizeProxies = [];',
        `const customizeProxies = [
          { name: '香港 01 | 中转', type: 'ss', server: 'custom1.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
          { name: '自建独享', type: 'vmess', server: 'custom2.example.com', port: 443, uuid: 'x', alterId: 0 },
        ];`,
      ),
    );
    const cfg = fx.typicalSubscription();
    // 为自定义节点域名添加 hosts 映射，验证自定义节点不参与 hosts 改写
    cfg.hosts['custom1.example.com'] = '9.9.9.9';
    const out = customApi.main(cfg);
    const n = proxyNames(out.proxies);

    // 标准化后与订阅节点重名 → 添加“自建-”前缀（国旗在前且无多余空格）；未重名 → 保持原名
    h.assert(n.includes('🇭🇰 自建-香港 01 | 中转'), '与订阅节点重名的自定义节点应加自建- 前缀');
    h.assert(n.includes('自建独享'), '未重名的自定义节点保持原名');
    h.assertEqual(n.filter((x) => x === '🇭🇰 香港 01 | 中转').length, 1, '订阅节点仍应唯一保留');

    // 自定义节点不参与 hosts 改写（server 保持原域名）
    const cp = out.proxies.find((x) => x.name === '🇭🇰 自建-香港 01 | 中转');
    h.assertEqual(cp.server, 'custom1.example.com', '自定义节点不应被 hosts 改写');

    // 自建节点策略组
    const g = groupByName(out['proxy-groups'], '自建节点');
    h.assert(g, '应生成自建节点组');
    h.assertEqual(g.type, 'select');
    h.assert(g.proxies.includes('🇭🇰 自建-香港 01 | 中转'), '自建节点组应含重名自定义节点');
    h.assert(g.proxies.includes('自建独享'), '自建节点组应含未重名自定义节点');

    // 默认代理 / GLOBAL 应含自建节点组
    h.assert(groupByName(out['proxy-groups'], '默认代理').proxies.includes('自建节点'), '默认代理应含自建节点组');
    h.assert(groupByName(out['proxy-groups'], 'GLOBAL').proxies.includes('自建节点'), 'GLOBAL 应含自建节点组');

    // 手动选择（includeAll 基础组）应含自定义节点
    h.assert(
      groupByName(out['proxy-groups'], '手动选择').proxies.includes('🇭🇰 自建-香港 01 | 中转'),
      '手动选择应含自定义节点',
    );

    // 自定义节点域名不应进入 fake-ip-filter（不参与 DNS 域名处理）
    h.assert(!out.dns['fake-ip-filter'].includes('custom1.example.com'), '自定义节点域名不应进入 fake-ip-filter');
  });

  // ---------------- 链式代理 ----------------
  h.section('集成测试 · 链式代理');
  // 注入自定义节点（首个节点自带 dialer-proxy，用于验证覆盖行为；与订阅节点“香港 01 | 中转”标准化后重名）
  const chainCustomInjection = `const customizeProxies = [
    { name: '香港 01 | 中转', type: 'ss', server: 'custom1.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x', 'dialer-proxy': '旧中转' },
    { name: '自建独享', type: 'vmess', server: 'custom2.example.com', port: 443, uuid: 'x', alterId: 0 },
    { name: '自建-日本-01', type: 'trojan', server: 'custom3.example.com', port: 443, password: 'x' },
  ];`;

  h.test('未启用链式代理：自定义节点保持自建- 前缀且 dialer-proxy 不被修改', () => {
    const customApi = loadScript(scriptFile, (code) =>
      code.replace('const customizeProxies = [];', chainCustomInjection),
    );
    const out = customApi.main(fx.typicalSubscription());
    const n = proxyNames(out.proxies);
    h.assert(n.includes('🇭🇰 自建-香港 01 | 中转'), '重名自定义节点应加自建- 前缀');
    h.assert(n.includes('🇯🇵 自建-日本-01'), '自定义节点名称保持不变');
    h.assertEqual(
      out.proxies.find((x) => x.name === '🇭🇰 自建-香港 01 | 中转')['dialer-proxy'],
      '旧中转',
      '未启用链式代理时 dialer-proxy 应保持不变',
    );
    h.assert(!groupByName(out['proxy-groups'], '链式中转'), '不应生成链式中转组');
  });

  h.test('启用链式代理：生成链式中转组、自建- 前缀、强制 dialer-proxy', () => {
    const customApi = loadScript(scriptFile, (code) =>
      code.replace('const customizeProxies = [];', chainCustomInjection),
    );
    withOptions(customApi, { 链式代理: true }, () => {
      const out = customApi.main(fx.typicalSubscription());
      const n = proxyNames(out.proxies);

      // 重名自定义节点使用“自建-”前缀；未重名节点名称保持不变
      h.assert(n.includes('🇭🇰 自建-香港 01 | 中转'), '重名自定义节点应加自建- 前缀');
      h.assert(n.includes('🇯🇵 自建-日本-01'), '未重名自定义节点名称保持不变');
      h.assert(n.includes('自建独享'), '未重名自定义节点保持原名');
      h.assertEqual(n.filter((x) => x === '🇭🇰 香港 01 | 中转').length, 1, '订阅节点仍应唯一保留');

      // 强制 dialer-proxy（覆盖已有值）
      h.assertEqual(
        out.proxies.find((x) => x.name === '🇭🇰 自建-香港 01 | 中转')['dialer-proxy'],
        '链式中转',
        '已有 dialer-proxy 应被覆盖',
      );
      h.assertEqual(
        out.proxies.find((x) => x.name === '自建独享')['dialer-proxy'],
        '链式中转',
        '应为自定义节点添加 dialer-proxy',
      );

      // “自建节点”策略组存在并含自定义节点
      const customGroup = groupByName(out['proxy-groups'], '自建节点');
      h.assert(customGroup, '自建节点组应存在');
      h.assert(!groupByName(out['proxy-groups'], '落地节点'), '不应存在“落地节点”组');
      h.assert(customGroup.proxies.includes('🇭🇰 自建-香港 01 | 中转'), '自建节点组应含自定义节点');

      // 链式中转组存在且为 select
      const chain = groupByName(out['proxy-groups'], '链式中转');
      h.assert(chain, '应生成链式中转组');
      h.assertEqual(chain.type, 'select');

      // 链式中转直接放入所有订阅节点（不含自定义节点与直连节点），不放入任何策略组
      const customNodeNames = new Set(customGroup.proxies);
      const subscriptionNodes = out.proxies
        .filter((p) => p.type !== 'direct' && !customNodeNames.has(p.name))
        .map((p) => p.name);
      h.assert(subscriptionNodes.length > 0, '前置：应存在订阅节点');
      h.assertEqual(chain.proxies.length, subscriptionNodes.length, '链式中转应仅包含订阅节点');
      for (const name of subscriptionNodes) {
        h.assert(chain.proxies.includes(name), `链式中转应包含节点 ${name}`);
      }
      const allGroupNames = new Set(out['proxy-groups'].map((g) => g.name));
      for (const x of chain.proxies) {
        h.assert(!allGroupNames.has(x), `链式中转不应放入策略组 ${x}`);
      }

      // 链式中转仅嵌套进 GLOBAL，不嵌套进其他任何策略组
      const global = groupByName(out['proxy-groups'], 'GLOBAL');
      for (const g of out['proxy-groups']) {
        if (g.name !== '链式中转') {
          if (g.name === 'GLOBAL') {
            h.assert(g.proxies.includes('链式中转'), 'GLOBAL 应包含链式中转');
          } else {
            h.assert(!g.proxies.includes('链式中转'), `策略组 ${g.name} 不应包含链式中转`);
          }
        }
      }

      // GLOBAL 聚合所有策略组（含链式中转与自建节点）
      for (const g of out['proxy-groups']) {
        if (g.name !== 'GLOBAL') {
          h.assert(global.proxies.includes(g.name), `GLOBAL 应包含策略组 ${g.name}`);
        }
      }

      // 自定义节点仍参与其他策略组（默认代理/手动选择）；链式中转只放订阅节点，不再形成回环
      h.assert(groupByName(out['proxy-groups'], '默认代理').proxies.includes('自建节点'), '默认代理应含自建节点组');
      h.assert(
        groupByName(out['proxy-groups'], '手动选择').proxies.includes('🇭🇰 自建-香港 01 | 中转'),
        '手动选择应含自建节点',
      );
      h.assert(global.proxies.includes('自建节点'), 'GLOBAL 应含自建节点组');
    });
  });

  h.test('启用链式代理但未配置自定义节点 → 抛错', () => {
    withOptions(api, { 链式代理: true }, () => {
      h.assertThrows(() => api.main(fx.typicalSubscription()), /启用失败，请在脚本中添加自定义节点后尝试/);
    });
  });

  // ---------------- 异常场景 ----------------
  h.section('集成测试 · 异常场景');
  h.test('空节点列表 → 抛错', () => h.assertThrows(() => api.main(fx.emptySubscription()), /未找到任何代理节点/));
  h.test('仅 DIRECT/REJECT/rematch 类型 → 抛错', () =>
    h.assertThrows(() => api.main(fx.filteredByTypeSubscription()), /未找到任何代理节点/),
  );
  h.test('全部为可过滤节点（信息节点/rematch）且开启过滤 → 抛错', () =>
    h.assertThrows(() => api.main(fx.allFilteredSubscription()), /未找到任何代理节点/),
  );
}

module.exports = { runIntegrationTests };
