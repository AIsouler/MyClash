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
  h.test('节点过滤与标准化：剔除无效节点、保留有效节点并补国旗', () => {
    const out = api.main(fx.typicalSubscription());
    const n = proxyNames(out.proxies);
    for (const bad of ['DIRECT', 'REJECT', 'REMATCH', '官方网站', '剩余流量', '节点到期 2026-08-01']) {
      h.assert(!n.includes(bad), `不应包含节点 ${bad}`);
    }
    h.assert(n.includes('🇭🇰 HK 02 - 香港'));
    h.assert(n.includes('🇯🇵 JAPAN-02'));
    h.assert(n.includes('🇸🇬 SG 01 | 新加坡'));
  });
  h.test('dialer-proxy 引用修复：重命名同步 / 存活保留 / 被过滤移除', () => {
    const out = api.main(fx.typicalSubscription());
    // 指向被重命名节点 → 引用同步更新
    const renamed = out.proxies.find((x) => x.name === '🇯🇵 东京');
    h.assert(renamed, '节点 🇯🇵 东京 应存在');
    h.assertEqual(renamed['dialer-proxy'], '🇯🇵 日本大阪');
    // 指向存活未改名节点 → 引用保留
    const alive = out.proxies.find((x) => x.name === '🇭🇰 香港 04');
    h.assertEqual(alive['dialer-proxy'], '🇭🇰 香港 01 | 中转');
    // 指向被过滤节点 → 移除引用
    const filtered = out.proxies.find((x) => x.name === '测试节点A');
    h.assert(filtered, '节点 测试节点A 应存在');
    h.assert(!('dialer-proxy' in filtered), '应移除指向已过滤节点的引用');
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
  h.test('proxy-server-nameserver 固定使用公共 DoH；无专属策略时私有 DNS 合并写入节点域名 policy', () => {
    const cfg = fx.typicalSubscription();
    // 移除 listen 触发条件与节点专属 DNS 策略，验证私有 DNS 经 policy 生效
    delete cfg.dns.listen;
    delete cfg.dns['proxy-server-nameserver-policy'];
    cfg.dns['nameserver'] = ['8.8.8.8', 'https://private.example-dns.com/dns-query#proxy'];
    cfg.dns['proxy-server-nameserver'] = ['223.5.5.5', 'https://private-proxy.example-dns.com/dns-query#proxy'];
    const out = api.main(cfg);
    h.assertEqual(out.dns.enable, true);
    h.assertEqual(out.dns['enhanced-mode'], 'fake-ip');
    // proxy-server-nameserver 固定使用公共 DoH，不再承载私有 DNS
    h.assertDeep(out.dns['proxy-server-nameserver'], api.chinaDohDNS);
    // 两个来源的私有 DNS 合并去重、剥离 # 后缀，统一写入节点域名 policy
    const policy = out.dns['proxy-server-nameserver-policy'];
    h.assertDeep(policy['hk1.example.com'], [
      'https://private.example-dns.com/dns-query',
      'https://private-proxy.example-dns.com/dns-query',
    ]);
    h.assert('jp1.example.com' in policy, '其他节点域名也应映射到私有 DNS');
    // 公共 DNS 不进入 policy；私有 DNS 不应含 # 后缀
    const policyText = JSON.stringify(policy);
    h.assert(!policyText.includes('8.8.8.8'), 'nameserver 公共 DNS 应被过滤');
    h.assert(!policyText.includes('223.5.5.5'), 'proxy-server-nameserver 公共 DNS 应被过滤');
    h.assert(!policyText.includes('#'), '私有 DNS 不应含 # 后缀');
  });
  h.test('私有 DNS 后缀处理：非 direct 剥离、direct 整条保留（含参数、忽略大小写）', () => {
    // 无节点专属 DNS 策略时，私有 DNS 经 policy 生效，后缀规则随之生效
    const cfg = fx.typicalSubscription();
    delete cfg.dns['proxy-server-nameserver-policy'];
    cfg.dns['nameserver'] = [
      'https://private.example-dns.com/dns-query#direct',
      'https://private.example-dns.com/dns-query#direct&ecs=2.2.2.2',
      'https://private-proxy.example-dns.com/dns-query#PROXY',
    ];
    const out = api.main(cfg);
    const policy = out.dns['proxy-server-nameserver-policy'];
    // hk3.example.com 为未被 hosts 改写的域名节点，仍进入 policy
    const privateDNS = policy['hk3.example.com'];
    h.assert(privateDNS.includes('https://private.example-dns.com/dns-query#direct'), '应保留 #direct 后缀');
    h.assert(
      privateDNS.includes('https://private.example-dns.com/dns-query#direct&ecs=2.2.2.2'),
      '应整条保留 #direct 及附加参数',
    );
    h.assert(
      privateDNS.includes('https://private-proxy.example-dns.com/dns-query'),
      '非 direct 后缀（#PROXY）应被剥离',
    );
    // hk1.example.com 被 hosts 映射为 IP（10.0.0.1），IP 类型的 server 不进入 policy
    h.assert(!('hk1.example.com' in policy), '映射为 IP 的节点域名不应进入 policy');
  });
  h.test('节点域名对应 nameserver-policy 与 proxy-server-nameserver-policy 被保留', () => {
    const cfg = fx.typicalSubscription();
    // 补充 nameserver-policy 来源，验证其与 proxy-server-nameserver-policy 合并后一起保留
    cfg.dns['nameserver-policy'] = {
      'jp1.example.com': 'https://private-ns.example-dns.com/dns-query#PROXY',
      'unrelated-ns.com': 'https://foo-ns.com/dns-query',
    };
    const out = api.main(cfg);
    // 存在节点专属 DNS 策略时优先保留（# 后缀被剥离），不生成私有 DNS 兜底；
    // hk1.example.com 被 hosts 映射为 IP（10.0.0.1）后不再匹配节点域名 → 被排除
    h.assertDeep(out.dns['proxy-server-nameserver-policy'], {
      // 来自 proxy-server-nameserver-policy（hk1.example.com 映射为 IP 被排除）
      '+.example.com': ['https://other-dns.com/dns-query'],
      // 来自 nameserver-policy（#PROXY 后缀被剥离）
      'jp1.example.com': 'https://private-ns.example-dns.com/dns-query',
    });
  });
  h.test('节点 hosts 映射改写为 server，不再复制 hosts', () => {
    const out = api.main(fx.typicalSubscription());
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, '10.0.0.1', 'hosts 映射的节点 server 应被改写');
    h.assert(!('hk1.example.com' in out.hosts), '映射后的节点 hosts 不应复制到新配置');
    h.assert(!('www.unrelated.com' in out.hosts), '无关 hosts 应被过滤');
  });
  h.test('fake-ip-filter 保留匹配条目并过滤无关条目', () => {
    // 节点域名（精确/后缀/通配）保留，无关条目与 rule-set 被过滤，默认条目置于头部
    const out = api.main(fx.typicalSubscription());
    const f = out.dns['fake-ip-filter'];
    h.assert(f.includes('+.example.com'), '后缀匹配的节点域名应保留');
    h.assert(f.includes('*.example.com'), '通配匹配的节点域名应保留');
    // hk1.example.com 被 hosts 映射为 IP（10.0.0.1），IP 类型的 server 被排除
    h.assert(!f.includes('hk1.example.com'), '映射为 IP 的节点域名应被排除');
    h.assert(!f.includes('www.unrelated.com'), '无关条目应被过滤');
    h.assert(!f.includes('rule-set:unrelated'), 'rule-set 条目应被过滤');
    h.assertEqual(f[0], 'rule-set:private');
    h.assertEqual(f[1], 'rule-set:fakeip_filter');
    // hosts 映射目标域名场景：保留目标域名对应的条目
    const f2 = api.main(fx.hostsMappedSubscription()).dns['fake-ip-filter'];
    h.assert(f2.includes('+.example-apt.com'), '节点 hosts 映射目标域名对应的条目应保留');
    h.assert(!f2.includes('+.unrelated-filter.com'), '与节点无关的条目应被过滤');
  });
  h.test('hosts 改写触发条件不满足时跳过改写', () => {
    const find = (cfg) => api.main(cfg).proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    // proxy-server-nameserver 长度不为 1（含多个 DNS，其中一个包含 listen 端口）→ 不触发
    let cfg = fx.typicalSubscription();
    cfg.dns['proxy-server-nameserver'] = ['8.8.8.8', '198.18.0.1:53'];
    h.assertEqual(find(cfg).server, 'hk1.example.com', 'proxy-server-nameserver 长度不为 1 时不应改写');
    // 长度为 1 但不含 listen 端口（:端口）→ 不触发
    cfg = fx.typicalSubscription();
    cfg.dns['proxy-server-nameserver'] = ['8.8.8.8'];
    h.assertEqual(find(cfg).server, 'hk1.example.com', '未命中触发条件时不应改写');
    // 新写法：proxy-server-nameserver 不含 127.0.0.1 → 不触发
    cfg = fx.typicalSubscription();
    cfg.dns.listen = '0.0.0.0:7874';
    cfg.dns['proxy-server-nameserver'] = ['udp://1.2.3.4:7874'];
    h.assertEqual(find(cfg).server, 'hk1.example.com', 'proxy-server-nameserver 不含 127.0.0.1 时不应改写');
    // 新写法：listen 不含 0.0.0.0 → 不触发
    cfg = fx.typicalSubscription();
    cfg.dns['proxy-server-nameserver'] = ['udp://127.0.0.1:7874'];
    h.assertEqual(find(cfg).server, 'hk1.example.com', 'listen 不含 0.0.0.0 时不应改写');
    // listen 缺失或为空字符串 → 不触发，且空串不当作私有 DNS 保留
    for (const listen of [undefined, '']) {
      cfg = fx.typicalSubscription();
      if (listen === undefined) delete cfg.dns.listen;
      else cfg.dns.listen = listen;
      const out = api.main(cfg);
      h.assertEqual(find(cfg).server, 'hk1.example.com', 'listen 缺失/为空时不应改写');
      // 空串不会被当作私有 DNS 写入 policy
      h.assert(
        Object.values(out.dns['proxy-server-nameserver-policy']).every((v) => v !== ''),
        '不应将空串当作私有 DNS 保留',
      );
    }
  });
  h.test('新写法 proxy-server-nameserver 含 127.0.0.1 且 listen 含 0.0.0.0 时触发 hosts 改写', () => {
    const cfg = fx.typicalSubscription();
    // 新写法：listen 为 0.0.0.0:7874，proxy-server-nameserver 为 udp://127.0.0.1:7874，
    // 仅判断两串含 127.0.0.1 与 0.0.0.0（不比较端口）→ 应触发 hosts 改写
    cfg.dns.listen = '0.0.0.0:7874';
    cfg.dns['proxy-server-nameserver'] = ['udp://127.0.0.1:7874'];
    const out = api.main(cfg);
    const p = out.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p.server, '10.0.0.1', '含 127.0.0.1 与 0.0.0.0 时应触发 hosts 改写');
    // 端口不同也触发（不再比较端口）
    cfg.dns['proxy-server-nameserver'] = ['udp://127.0.0.1:5353'];
    const out2 = api.main(cfg);
    const p2 = out2.proxies.find((x) => x.name === '🇭🇰 香港 01 | 中转');
    h.assertEqual(p2.server, '10.0.0.1', '端口不同时仍应触发 hosts 改写');
    // 无节点专属 DNS 策略时，私有 DNS 经 policy 生效：
    // listen 对应的本地监听 DNS 在提取时被置空，nameserver 中的私有 DNS 保留
    delete cfg.dns['proxy-server-nameserver-policy'];
    const out3 = api.main(cfg);
    const privateDNS = out3.dns['proxy-server-nameserver-policy']['hk3.example.com'];
    h.assert(!privateDNS.some((d) => d.includes('udp://127.0.0.1')), 'listen 对应的本地 DNS 不应被误留为私有 DNS');
    h.assert(privateDNS.includes('https://private.example-dns.com/dns-query'), 'nameserver 中的私有 DNS 仍应保留');
    h.assertDeep(out3.dns['proxy-server-nameserver'], api.chinaDohDNS);
  });
  h.test('无 dns/hosts 输入时生成默认配置', () => {
    const cfg = fx.typicalSubscription();
    delete cfg.dns;
    delete cfg.hosts;
    const out = api.main(cfg);
    h.assertEqual(out.dns.enable, true);
    // 默认 proxy-server-nameserver 使用公共 DoH；无私有 DNS 时不生成 policy
    h.assertDeep(out.dns['proxy-server-nameserver'], api.chinaDohDNS);
    h.assert(!('proxy-server-nameserver-policy' in out.dns), '无私有 DNS 时不应生成 policy');
    // 默认 hosts 仍生成（不再包含已移除的 dns.alidns.com/dns.google 等条目）
    h.assertDeep(out.hosts['services.googleapis.cn'], 'services.googleapis.com');
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
  h.test('屏蔽国外QUIC 开关：true 生成 / false 移除 QUIC 规则与 cn_additional', () => {
    // true（默认）→ 生成 cn_additional 规则集
    h.assert(api.main(fx.minimalSubscription())['rule-providers'].cn_additional, 'cn_additional 规则集应生成');
    // false → 移除 QUIC 规则与 cn_additional，cn 规则集保留
    withOptions(api, { 屏蔽国外QUIC: false }, () => {
      const out = api.main(fx.minimalSubscription());
      h.assert(!out.rules.some((r) => r.includes('DST-PORT,443') && r.includes('REJECT')), '不应含 QUIC 规则');
      h.assert(!out['rule-providers'].cn_additional, 'cn_additional 规则集不应生成');
      h.assert(out['rule-providers'].cn, 'cn 规则集仍应生成（供 nameserver-policy 使用）');
    });
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

  // ---------------- 代理 IP 版本优先 ----------------
  h.section('集成测试 · 代理IP版本优先');
  const nonDirectProxies = (out) => out.proxies.filter((p) => p.type !== 'direct');
  h.test('代理IPV4优先=true → 订阅节点统一为 ipv4-prefer，自定义/直连节点不受影响', () => {
    // 注入带 ip-version 的自定义节点，验证其不参与改写
    const customApi = loadScript(scriptFile, (code) =>
      code.replace(
        'const customizeProxies = [];',
        `const customizeProxies = [{
          name: '自建独享', type: 'ss', server: 'custom2.example.com', port: 443,
          cipher: 'aes-256-gcm', password: 'x', 'ip-version': 'ipv6-prefer',
        }];`,
      ),
    );
    withOptions(customApi, { 代理IPV4优先: true, 代理IPV6优先: false }, () => {
      const out = customApi.main(fx.typicalSubscription());
      const subs = nonDirectProxies(out);
      h.assert(subs.length > 1, '前置：应存在订阅节点');
      for (const p of subs) {
        if (p.name === '自建独享') {
          h.assertEqual(p['ip-version'], 'ipv6-prefer', '自定义节点不应被改写');
        } else {
          h.assertEqual(p['ip-version'], 'ipv4-prefer', `订阅节点 ${p.name} 应为 ipv4-prefer`);
        }
      }
      h.assertEqual(
        out.proxies.find((p) => p.name === '🇨🇳 直连 | IPv6优先')['ip-version'],
        'ipv6-prefer',
        '直连节点不应被改写',
      );
    });
  });
  h.test('代理IPV6优先=true → 订阅节点统一为 ipv6-prefer', () =>
    withOptions(api, { 代理IPV4优先: false, 代理IPV6优先: true }, () => {
      const out = api.main(fx.typicalSubscription());
      for (const p of nonDirectProxies(out)) {
        h.assertEqual(p['ip-version'], 'ipv6-prefer', `订阅节点 ${p.name} 应为 ipv6-prefer`);
      }
    }),
  );
  h.test('两开关默认(false) → 订阅节点 ip-version 保持原样（不新增、不覆盖）', () => {
    const cfg = fx.minimalSubscription();
    cfg.proxies[1]['ip-version'] = 'ipv6-prefer'; // 日本 B 自带 ip-version
    const out = api.main(cfg);
    for (const p of nonDirectProxies(out)) {
      if (p.name === '🇯🇵 日本 B') {
        h.assertEqual(p['ip-version'], 'ipv6-prefer', '已有 ip-version 应保持原样');
      } else {
        h.assert(!('ip-version' in p), `订阅节点 ${p.name} 不应被新增 ip-version`);
      }
    }
  });
  h.test('两开关同时开启 → 保持不变：开关保持开启、不应用任何偏好', () =>
    withOptions(api, { 代理IPV4优先: true, 代理IPV6优先: true }, () => {
      const out = api.main(fx.typicalSubscription());
      // 同时开启时开关保持不变（不被自动关闭）
      h.assertEqual(api.ruleOptionsEnable.代理IPV4优先, true, 'IPv4 应保持不变');
      h.assertEqual(api.ruleOptionsEnable.代理IPV6优先, true, 'IPv6 应保持不变');
      // 不应用任何 IP 版本偏好：订阅节点保持原样（不新增 ip-version）
      for (const p of nonDirectProxies(out)) {
        h.assert(!('ip-version' in p), `订阅节点 ${p.name} 不应被新增 ip-version`);
      }
    }),
  );

  // ---------------- 自定义节点 ----------------
  h.section('集成测试 · 自定义节点');
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

      // “链式落地”策略组（链式代理启用时的自定义节点组）存在并含自定义节点
      const customGroup = groupByName(out['proxy-groups'], '链式落地');
      h.assert(customGroup, '链式落地组应存在');
      h.assert(!groupByName(out['proxy-groups'], '自建节点'), '链式代理启用时不应存在“自建节点”组');
      h.assert(customGroup.proxies.includes('🇭🇰 自建-香港 01 | 中转'), '链式落地组应含自定义节点');

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

      // GLOBAL 聚合所有策略组（含链式中转与链式落地）
      for (const g of out['proxy-groups']) {
        if (g.name !== 'GLOBAL') {
          h.assert(global.proxies.includes(g.name), `GLOBAL 应包含策略组 ${g.name}`);
        }
      }

      // 自定义节点仍参与其他策略组（默认代理/手动选择）；链式中转只放订阅节点，不再形成回环
      h.assert(groupByName(out['proxy-groups'], '默认代理').proxies.includes('链式落地'), '默认代理应含链式落地组');
      h.assert(
        groupByName(out['proxy-groups'], '手动选择').proxies.includes('🇭🇰 自建-香港 01 | 中转'),
        '手动选择应含自建节点',
      );
      h.assert(global.proxies.includes('链式落地'), 'GLOBAL 应含链式落地组');
    });
  });

  // ---------------- 异常场景 ----------------
  h.section('集成测试 · 异常场景');
  h.test('无有效节点（空列表 / 全部可过滤）→ 抛错', () => {
    h.assertThrows(() => api.main(fx.emptySubscription()), /未找到任何代理节点/);
    h.assertThrows(() => api.main(fx.allFilteredSubscription()), /未找到任何代理节点/);
  });
}

module.exports = { runIntegrationTests };
