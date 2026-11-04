'use strict';

const { withOptions } = require('../lib/options');

/**
 * 纯函数单元测试，两个脚本共用。
 * 覆盖：matchDomainPattern / getMatchedRegions / toMatchableName / normalizeProxyName /
 *      buildCustomizeGroups / fixDialerProxy / applyHostsToProxies / stripDnsSuffix / simplifyDomainPolicy
 */
function runUnitTests(h, api) {
  h.section('单元测试 · matchDomainPattern（域名规则匹配）');
  const d = new Set(['example.com', 'sub.example.com', 'a.b.example.com', 'other.org']);
  h.test('精确匹配命中', () => h.assert(api.matchDomainPattern('example.com', d)));
  h.test('精确匹配未命中', () => h.assert(!api.matchDomainPattern('nothere.com', d)));
  h.test('精确匹配大小写不敏感', () => h.assert(api.matchDomainPattern('EXAMPLE.COM', new Set(['example.com']))));
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
  h.test('hongkong-03 → 香港', () => h.assert(matched('hongkong-03').includes('香港')));
  h.test('JAPAN-02 → 日本', () => h.assert(matched('JAPAN-02').includes('日本')));
  h.test('US-LosAngeles-02 → 美国', () => h.assert(matched('US-LosAngeles-02').includes('美国')));
  h.test('SG 01 | 新加坡 → 新加坡', () => h.assert(matched('SG 01 | 新加坡').includes('新加坡')));
  h.test('🇹🇼 台湾 01 → 台湾', () => h.assert(matched('🇹🇼 台湾 01').includes('台湾')));
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
  h.test('夹零宽字符不影响倍率匹配', () => {
    const n = matched('\u200B日本\u200B 0.3\u200Bx 流量');
    h.assert(n.includes('低倍率节点'), '应识别为低倍率节点');
    h.assert(n.includes('日本'));
  });
  h.test('家宽/住宅/原生IP/家庭宽带/ISP/RES → 家宽节点', () => {
    for (const name of ['家宽 01', '住宅 IP', '原生IP 香港', '家庭宽带', '美国 ISP', 'HK-RES']) {
      h.assert(matched(name).includes('家宽节点'), `${name} 应识别为家宽节点`);
    }
  });
  h.test('家宽 + 地区 → 同时命中地区与家宽节点', () => {
    h.assert(matched('🇭🇰 香港 家宽').includes('香港'));
    h.assert(matched('🇭🇰 香港 家宽').includes('家宽节点'));
  });
  h.test('非家宽名称不误判', () => {
    h.assert(!matched('美国 01').includes('家宽节点'));
    h.assert(!matched('🇸🇬 新加坡 06').includes('家宽节点'));
  });

  h.section('单元测试 · toMatchableName（仅供匹配的不可见字符剥离）');
  h.test('剥离零宽/不可见字符', () => h.assertEqual(api.toMatchableName('H\u200BK\u200B \u200B0\u200B1'), 'HK 01'));
  h.test('剥离双向控制符 / 隐形运算符 / 隔离符', () =>
    h.assertEqual(api.toMatchableName('H\u202AK\u2060\u2063\u2066J\u2069P\u00AD \u180E01'), 'HKJP 01'),
  );
  h.test('剥离谚文填充符与 BOM', () =>
    h.assertEqual(api.toMatchableName('\uFEFF\u3164HK\uFFA0 \u115F0\u11601'), 'HK 01'),
  );
  h.test('保留 ZWJ / ZWNJ（emoji 组合与连字语义）', () =>
    h.assertEqual(api.toMatchableName('H\u200CK\u200DJ'), 'H\u200CK\u200DJ'),
  );
  h.test('保留变体选择符（emoji 呈现语义）', () => h.assertEqual(api.toMatchableName('❤\uFE0F HK'), '❤\uFE0F HK'));
  h.test('正常名称与中文国旗保持不变', () => {
    h.assertEqual(api.toMatchableName('🇭🇰 香港 01'), '🇭🇰 香港 01');
    h.assertEqual(api.toMatchableName('HK 01'), 'HK 01');
  });

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
  h.test('未与订阅节点重名 → 保持原名', () => {
    const r = api.buildCustomizeGroups([mkCustomProxy('🇭🇰 香港 01')], custom('自建独享'));
    h.assertDeep(r.customProxyNames, ['自建独享']);
  });
  h.test('前缀后仍重名 → 继续加前缀直至唯一（国旗在前且无多余空格）', () => {
    const r = api.buildCustomizeGroups(
      [mkCustomProxy('🇭🇰 香港 01'), mkCustomProxy('🇭🇰 自建-香港 01')],
      custom('香港 01'),
    );
    h.assertDeep(r.customProxyNames, ['🇭🇰 自建-自建-香港 01']);
  });
  h.test('未启用链式代理：不添加 dialer-proxy', () => {
    const r = api.buildCustomizeGroups([], custom('自建独享'));
    h.assert(!('dialer-proxy' in r.customProxies[0]), '未启用链式代理时不应添加 dialer-proxy');
  });
  h.test('链式代理启用但未配置自定义节点 → 抛错', () =>
    withOptions(api, { 链式代理: true }, () =>
      h.assertThrows(() => api.buildCustomizeGroups([], []), /启用失败，请在脚本中添加自定义节点后尝试/),
    ),
  );

  h.section('单元测试 · fixDialerProxy（dialer-proxy 引用修复）');
  const renameMap = new Map([['旧名', '新名']]);
  const normalizedProxyNames = new Set(['新名', '存活名']);
  const fixArgs = [renameMap, normalizedProxyNames];
  h.test('目标从未存在 → 移除引用', () =>
    h.assert(!('dialer-proxy' in api.fixDialerProxy({ 'dialer-proxy': '从未存在' }, ...fixArgs))),
  );
  h.test('无引用字段 → 原样返回', () => h.assertEqual(api.fixDialerProxy({ name: 'x' }, ...fixArgs).name, 'x'));

  h.section('单元测试 · applyHostsToProxies（hosts 映射改写节点 server）');
  // 与 buildDnsAndHostsConfig 调用方式一致
  const apply = (proxies, hosts) => api.applyHostsToProxies(proxies, hosts);
  const mkProxy = (server) => ({ name: 'x', server });
  h.test('精确映射改写：字符串直接替换、数组取首个值', () => {
    h.assertEqual(apply([mkProxy('node.example.com')], { 'node.example.com': '1.2.3.4' })[0].server, '1.2.3.4');
    h.assertEqual(
      apply([mkProxy('node.example.com')], { 'node.example.com': ['1.2.3.4', '1.2.3.5'] })[0].server,
      '1.2.3.4',
    );
  });
  h.test('精确映射优先于通配映射', () => {
    const out = apply([mkProxy('hk1.example.com')], { '+.example.com': '9.9.9.9', 'hk1.example.com': '1.1.1.1' });
    h.assertEqual(out[0].server, '1.1.1.1');
  });
  h.test('链式映射逐级改写至最终目标', () => {
    const out = apply([mkProxy('a.example.com')], { 'a.example.com': 'b.example.com', 'b.example.com': '1.2.3.4' });
    h.assertEqual(out[0].server, '1.2.3.4');
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
  h.test('与节点无关的 hosts 条目不参与改写', () => {
    const out = apply([mkProxy('node.example.com')], { 'cdn.unrelated.com': '1.1.1.1', '+.other.com': '2.2.2.2' });
    h.assertEqual(out[0].server, 'node.example.com');
  });

  h.section('单元测试 · stripDnsSuffix（DNS # 策略组后缀处理）');
  h.test('无 # 后缀 → 原样返回', () =>
    h.assertEqual(api.stripDnsSuffix('https://dns.example.com/dns-query'), 'https://dns.example.com/dns-query'),
  );
  h.test('非 direct 开头后缀 → 剥离', () =>
    h.assertEqual(api.stripDnsSuffix('https://dns.example.com/dns-query#proxy'), 'https://dns.example.com/dns-query'),
  );
  h.test('#direct/直连 后缀 → 规范化为 #DIRECT（忽略大小写、含附加参数）', () => {
    for (const url of [
      'https://dns.example.com/dns-query#direct',
      'https://dns.example.com/dns-query#DIRECT',
      'https://dns.example.com/dns-query#direct&ecs=2.2.2.2',
      'https://dns.example.com/dns-query#直连',
    ]) {
      h.assertEqual(api.stripDnsSuffix(url), 'https://dns.example.com/dns-query#DIRECT');
    }
  });

  h.section('单元测试 · simplifyDomainPolicy（节点域名 DNS 策略压缩）');
  h.test('相同 DNS 的同一后缀子域 → 合并为 +. 后缀规则', () =>
    h.assertDeep(
      api.simplifyDomainPolicy({
        'a.example.com': ['https://dns.example/dns-query'],
        'b.example.com': ['https://dns.example/dns-query'],
      }),
      { '+.example.com': ['https://dns.example/dns-query'] },
    ),
  );
  h.test('DNS 不同或只有一个子域 → 保留精确规则', () =>
    h.assertDeep(
      api.simplifyDomainPolicy({
        'a.example.com': 'https://dns-a.example/dns-query',
        'b.example.com': 'https://dns-b.example/dns-query',
        'only.other.com': 'https://dns.example/dns-query',
      }),
      {
        'a.example.com': 'https://dns-a.example/dns-query',
        'b.example.com': 'https://dns-b.example/dns-query',
        'only.other.com': 'https://dns.example/dns-query',
      },
    ),
  );
  h.test('两段域名策略 → 原样保留，不能在压缩时丢失', () =>
    h.assertDeep(
      api.simplifyDomainPolicy({
        'example.com': 'https://dns.example/dns-query',
      }),
      { 'example.com': 'https://dns.example/dns-query' },
    ),
  );
}

module.exports = { runUnitTests };
