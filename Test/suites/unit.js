'use strict';

/**
 * 纯函数单元测试，两个脚本共用。
 * 覆盖：matchDomainPattern / getMatchedRegions / normalizeProxyName / fixDialerProxy
 */
function runUnitTests(h, api, meta) {
  h.section('单元测试 · matchDomainPattern（域名规则匹配）');
  const d = new Set(['example.com', 'sub.example.com', 'a.b.example.com', 'other.org']);
  h.test('精确匹配命中', () => h.assert(api.matchDomainPattern('example.com', d)));
  h.test('精确匹配未命中', () => h.assert(!api.matchDomainPattern('nothere.com', d)));
  h.test('精确匹配大小写不敏感', () => h.assert(api.matchDomainPattern('EXAMPLE.COM', new Set(['example.com']))));
  h.test('空集合不匹配', () => h.assert(!api.matchDomainPattern('example.com', new Set())));
  h.test('+.前缀匹配自身及子域', () => h.assert(api.matchDomainPattern('+.example.com', d)));
  h.test('+.前缀未命中', () => h.assert(!api.matchDomainPattern('+.nonexist.com', d)));
  h.test('.前缀匹配子域', () => h.assert(api.matchDomainPattern('.example.com', d)));
  h.test('.前缀不匹配自身', () => h.assert(!api.matchDomainPattern('.other.org', d)));
  h.test('*.通配同层级匹配', () => h.assert(api.matchDomainPattern('*.example.com', d)));
  h.test('*.通配跨层级不匹配', () => h.assert(!api.matchDomainPattern('*.example.com', new Set(['a.b.example.com']))));
  h.test('中间通配符匹配', () => h.assert(api.matchDomainPattern('a.*.com', new Set(['a.b.com', 'a.example.com']))));

  h.section('单元测试 · getMatchedRegions（地区匹配）');
  const matched = (name) => api.getMatchedRegions(name).map((r) => r.name);
  h.test('🇭🇰 香港 01 → 香港', () => h.assert(matched('🇭🇰 香港 01').includes('香港')));
  h.test('HK 02 → 香港', () => h.assert(matched('HK 02').includes('香港')));
  h.test('hongkong-03 → 香港', () => h.assert(matched('hongkong-03').includes('香港')));
  h.test('JAPAN-02 → 日本', () => h.assert(matched('JAPAN-02').includes('日本')));
  h.test('US-LosAngeles-02 → 美国', () => h.assert(matched('US-LosAngeles-02').includes('美国')));
  h.test('SG 01 | 新加坡 → 新加坡', () => h.assert(matched('SG 01 | 新加坡').includes('新加坡')));
  h.test('台湾 01 → 台湾省（仅全量版）', () => {
    if (meta.full) h.assert(matched('台湾 01').includes('台湾省'));
  });
  h.test('日本 0.3x 流量 → 低倍率节点 + 日本', () => {
    const n = matched('日本 0.3x 流量');
    h.assert(n.includes('低倍率节点'));
    h.assert(n.includes('日本'));
  });
  h.test('香港 2x 速率 → 高倍率节点 + 香港', () => {
    const n = matched('香港 2x 速率');
    h.assert(n.includes('高倍率节点'));
    h.assert(n.includes('香港'));
  });
  h.test('无地区关键词 → 空结果', () => h.assertEqual(matched('随便测试名称').length, 0));

  h.section('单元测试 · normalizeProxyName（节点名标准化）');
  h.test('无国旗自动补地区国旗', () => h.assertEqual(api.normalizeProxyName({ name: 'HK 01' }).name, '🇭🇰 HK 01'));
  h.test('已有国旗保持不变', () => h.assertEqual(api.normalizeProxyName({ name: '🇭🇰 香港 01' }).name, '🇭🇰 香港 01'));
  h.test('多余空格被折叠', () => h.assertEqual(api.normalizeProxyName({ name: '日本  大阪' }).name, '🇯🇵 日本 大阪'));
  h.test('无法识别地区保持原名', () => h.assertEqual(api.normalizeProxyName({ name: '随机' }).name, '随机'));

  h.section('单元测试 · buildCustomizeGroups（自定义节点组）');
  const mkCustomProxy = (name) => ({
    name,
    type: 'ss',
    server: 'x.example.com',
    port: 443,
    cipher: 'aes-256-gcm',
    password: 'x',
  });
  const custom = (...names) => names.map(mkCustomProxy);
  h.test('未配置自定义节点 → 不生成自建节点组', () => {
    const r = api.buildCustomizeGroups([mkCustomProxy('🇭🇰 香港 01')], []);
    h.assert(!r.customGroup, '不应生成自建节点组');
    h.assertEqual(r.customProxies.length, 0);
    h.assertEqual(r.customProxyNames.length, 0);
  });
  h.test('自定义节点标准化并构建自建节点组', () => {
    const r = api.buildCustomizeGroups([], custom('香港 自建'));
    h.assertDeep(r.customProxyNames, ['🇭🇰 香港 自建']);
    h.assertEqual(r.customGroup.name, '自建节点');
    h.assertEqual(r.customGroup.type, 'select');
    h.assertDeep(r.customGroup.proxies, ['🇭🇰 香港 自建']);
  });
  h.test('与订阅节点标准化后重名 → 添加自建- 前缀（国旗在前且无多余空格）', () => {
    const r = api.buildCustomizeGroups([mkCustomProxy('🇭🇰 香港 01 | 中转')], custom('香港 01 | 中转'));
    h.assertDeep(r.customProxyNames, ['🇭🇰 自建-香港 01 | 中转']);
  });
  h.test('未与订阅节点重名 → 保持原名', () => {
    const r = api.buildCustomizeGroups([mkCustomProxy('🇭🇰 香港 01')], custom('自建独享'));
    h.assertDeep(r.customProxyNames, ['自建独享']);
  });
  h.test('自定义节点间重名 → 前缀去重', () => {
    const r = api.buildCustomizeGroups([], custom('自建独享', '自建独享'));
    h.assertEqual(r.customProxyNames.length, 2);
    h.assert(r.customProxyNames.includes('自建独享'), '首个节点保留原名');
    h.assert(r.customProxyNames.includes('自建-自建独享'), '重名节点加前缀去重');
  });
  h.test('前缀后仍重名 → 继续加前缀直至唯一（国旗在前且无多余空格）', () => {
    const r = api.buildCustomizeGroups(
      [mkCustomProxy('🇭🇰 香港 01'), mkCustomProxy('🇭🇰 自建-香港 01')],
      custom('香港 01'),
    );
    h.assertDeep(r.customProxyNames, ['🇭🇰 自建-自建-香港 01']);
  });

  h.section('单元测试 · fixDialerProxy（dialer-proxy 引用修复）');
  const renameMap = new Map([['旧名', '新名']]);
  const normalizedProxyNames = new Set(['新名', '存活名']);
  const fixArgs = [renameMap, normalizedProxyNames];
  h.test('目标被重命名 → 引用同步更新', () =>
    h.assertEqual(api.fixDialerProxy({ 'dialer-proxy': '旧名' }, ...fixArgs)['dialer-proxy'], '新名'),
  );
  h.test('目标存活未改名 → 引用不变', () =>
    h.assertEqual(api.fixDialerProxy({ 'dialer-proxy': '存活名' }, ...fixArgs)['dialer-proxy'], '存活名'),
  );
  h.test('目标被过滤 → 移除引用', () =>
    h.assert(!('dialer-proxy' in api.fixDialerProxy({ 'dialer-proxy': '被删名' }, ...fixArgs))),
  );
  h.test('目标从未存在 → 移除引用', () =>
    h.assert(!('dialer-proxy' in api.fixDialerProxy({ 'dialer-proxy': '从未存在' }, ...fixArgs))),
  );
  h.test('无引用字段 → 原样返回', () => h.assertEqual(api.fixDialerProxy({ name: 'x' }, ...fixArgs).name, 'x'));

  h.section('单元测试 · applyHostsToProxies（hosts 映射改写节点 server）');
  // 与 buildDnsAndHostsConfig 调用方式一致
  const apply = (proxies, hosts) => api.applyHostsToProxies(proxies, hosts);
  const mkProxy = (server) => ({ name: 'x', server });
  h.test('精确映射改写为字符串', () => {
    const out = apply([mkProxy('node.example.com')], { 'node.example.com': '1.2.3.4' });
    h.assertEqual(out[0].server, '1.2.3.4');
  });
  h.test('数组映射取首个值', () => {
    const out = apply([mkProxy('node.example.com')], { 'node.example.com': ['1.2.3.4', '1.2.3.5'] });
    h.assertEqual(out[0].server, '1.2.3.4');
  });
  h.test('+.通配映射命中子域', () => {
    const out = apply([mkProxy('a.example.com'), mkProxy('b.other.com')], { '+.example.com': '9.9.9.9' });
    h.assertEqual(out[0].server, '9.9.9.9');
    h.assertEqual(out[1].server, 'b.other.com');
  });
  h.test('精确映射优先于通配映射', () => {
    const out = apply([mkProxy('hk1.example.com')], { '+.example.com': '9.9.9.9', 'hk1.example.com': '1.1.1.1' });
    h.assertEqual(out[0].server, '1.1.1.1');
  });
  h.test('链式映射逐级改写至最终目标', () => {
    const out = apply([mkProxy('a.example.com')], { 'a.example.com': 'b.example.com', 'b.example.com': '1.2.3.4' });
    h.assertEqual(out[0].server, '1.2.3.4');
  });
  h.test('链式映射中继可跨通配条目', () => {
    const out = apply([mkProxy('a.example.com')], { 'a.example.com': 'b.other.com', '+.other.com': '9.9.9.9' });
    h.assertEqual(out[0].server, '9.9.9.9');
  });
  h.test('链式映射中途无后继时仅单层改写', () => {
    const out = apply([mkProxy('a.example.com')], { 'a.example.com': 'b.example.com' });
    h.assertEqual(out[0].server, 'b.example.com');
  });
  h.test('回环映射防御性终止（内核会拒绝此类配置）', () => {
    const out = apply([mkProxy('a.example.com')], {
      'a.example.com': 'b.example.com',
      'b.example.com': 'a.example.com',
    });
    h.assert(['a.example.com', 'b.example.com'].includes(out[0].server), '回环映射不应死循环');
  });
  h.test('无 hosts 时节点原样保留', () => {
    const p = [mkProxy('a.example.com')];
    const out = apply(p, undefined);
    h.assert(out[0] === p[0], '未改写时不应创建新对象');
  });
  h.test('非字符串 server 不处理', () => {
    const p = [{ name: 'x' }];
    h.assert(apply(p, { 'a.example.com': '1.1.1.1' })[0] === p[0], '无 server 字段的节点应原样保留');
  });
  h.test('空 hosts 时节点原样保留', () => {
    const p = [mkProxy('a.example.com')];
    const out = apply(p, {});
    h.assert(out[0] === p[0], '空 hosts 不应改写节点');
  });
  h.test('与节点无关的 hosts 条目不参与改写', () => {
    const out = apply([mkProxy('node.example.com')], { 'cdn.unrelated.com': '1.1.1.1', '+.other.com': '2.2.2.2' });
    h.assertEqual(out[0].server, 'node.example.com');
  });
  h.test('大小写不敏感匹配', () => {
    const out = apply([mkProxy('NODE.Example.COM')], { 'node.example.com': '1.2.3.4' });
    h.assertEqual(out[0].server, '1.2.3.4');
  });
  h.test('无匹配时保留原 server（含大小写）', () => {
    const out = apply([mkProxy('NODE.Example.COM')], { 'cdn.unrelated.com': '1.1.1.1' });
    h.assertEqual(out[0].server, 'NODE.Example.COM');
  });
  h.test('*.通配映射命中同层级子域', () => {
    const out = apply([mkProxy('a.example.com'), mkProxy('a.b.example.com')], { '*.example.com': '9.9.9.9' });
    h.assertEqual(out[0].server, '9.9.9.9');
    h.assertEqual(out[1].server, 'a.b.example.com');
  });

  h.section('单元测试 · stripDnsSuffix（DNS # 策略组后缀处理）');
  h.test('无 # 后缀 → 原样返回', () =>
    h.assertEqual(api.stripDnsSuffix('https://dns.example.com/dns-query'), 'https://dns.example.com/dns-query'),
  );
  h.test('非 direct 开头后缀 → 剥离', () =>
    h.assertEqual(api.stripDnsSuffix('https://dns.example.com/dns-query#proxy'), 'https://dns.example.com/dns-query'),
  );
  h.test('#direct / #DIRECT 后缀 → 保留（忽略大小写）', () => {
    h.assertEqual(
      api.stripDnsSuffix('https://dns.example.com/dns-query#direct'),
      'https://dns.example.com/dns-query#direct',
    );
    h.assertEqual(
      api.stripDnsSuffix('https://dns.example.com/dns-query#DIRECT'),
      'https://dns.example.com/dns-query#DIRECT',
    );
  });
  h.test('#direct&ecs 参数后缀 → 整条保留', () =>
    h.assertEqual(
      api.stripDnsSuffix('https://dns.example.com/dns-query#direct&ecs=2.2.2.2'),
      'https://dns.example.com/dns-query#direct&ecs=2.2.2.2',
    ),
  );
  h.test('#directxxx 后缀 → 剥离（词边界）', () =>
    h.assertEqual(
      api.stripDnsSuffix('https://dns.example.com/dns-query#directxxx'),
      'https://dns.example.com/dns-query',
    ),
  );
}

module.exports = { runUnitTests };
