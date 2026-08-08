'use strict';

// 使用工厂函数返回全新的配置对象，避免测试之间互相污染。

/** 典型机场订阅：包含多种地区节点、倍率节点、信息节点、内置类型节点与 dialer-proxy 引用 */
function typicalSubscription() {
  return {
    'mixed-port': 7890,
    'allow-lan': true,
    mode: 'rule',
    dns: {
      enable: true,
      // 设置 dns.listen 且 proxy-server-nameserver 仅含一个 DNS 且包含该值，用于触发 hosts 映射改写
      listen: '198.18.0.1:53',
      nameserver: ['223.5.5.5', '8.8.8.8', 'https://private.example-dns.com/dns-query'],
      'proxy-server-nameserver': ['198.18.0.1:53'],
      'proxy-server-nameserver-policy': {
        'hk1.example.com': 'https://private.example-dns.com/dns-query',
        '+.example.com': ['https://other-dns.com/dns-query'],
        'unrelated.com': 'https://foo-dns.com/dns-query',
      },
      'fake-ip-filter': [
        'hk1.example.com',
        '+.example.com',
        '*.example.com',
        'www.unrelated.com',
        'rule-set:unrelated',
      ],
    },
    hosts: {
      // 仅精确映射 hk1.example.com；保留其他 example.com 节点域名用于验证 DNS policy/fake-ip-filter 的保留
      'hk1.example.com': ['10.0.0.1'],
      'www.unrelated.com': ['10.0.0.3'],
    },
    proxies: [
      // --- 香港 ---
      { name: '🇭🇰 香港 01 | 中转', type: 'vmess', server: 'hk1.example.com', port: 443, uuid: 'x', alterId: 0 },
      { name: 'HK 02 - 香港', type: 'trojan', server: '1.2.3.4', port: 443, password: 'x' },
      { name: 'hongkong-03', type: 'ss', server: 'hk3.example.com', port: 8388, cipher: 'aes-256-gcm', password: 'x' },
      // --- 日本 ---
      {
        name: '🇯🇵 日本 01 | 优化线路',
        type: 'ss',
        server: 'jp1.example.com',
        port: 443,
        cipher: 'aes-128-gcm',
        password: 'x',
      },
      { name: 'JAPAN-02', type: 'vmess', server: '1.2.3.5', port: 443, uuid: 'y', alterId: 0 },
      // --- 美国 ---
      {
        name: '🇺🇸 美国 01 | 解锁',
        type: 'ss',
        server: 'us1.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
      },
      { name: 'US-LosAngeles-02', type: 'trojan', server: '1.2.3.6', port: 443, password: 'x' },
      // --- 新加坡 ---
      {
        name: 'SG 01 | 新加坡',
        type: 'ss',
        server: 'sg1.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
      },
      // --- 台湾省（全量版地区）---
      { name: '🇹🇼 台湾 01', type: 'vmess', server: 'tw1.example.com', port: 443, uuid: 'z', alterId: 0 },
      // --- 低倍率节点 ---
      { name: '日本 0.3x 流量', type: 'ss', server: '1.2.3.7', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '0.5倍 香港', type: 'ss', server: '1.2.3.8', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      // --- 高倍率节点 ---
      { name: '香港 2x 速率', type: 'ss', server: '1.2.3.9', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: 'US*3 高倍率', type: 'ss', server: '1.2.3.10', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      // --- 非地区 / 信息节点（应被过滤）---
      { name: '官方网站', type: 'ss', server: '2.2.2.1', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '剩余流量', type: 'ss', server: '2.2.2.2', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '节点到期 2026-08-01', type: 'ss', server: '2.2.2.3', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      // --- 内核内置类型（应被过滤）---
      { name: 'DIRECT', type: 'direct' },
      { name: 'REJECT', type: 'reject' },
      // --- rematch 类型（非内置类型，脚本显式过滤）---
      { name: 'REMATCH', type: 'rematch' },
      // --- dialer-proxy 引用：目标未改名 ---
      {
        name: '🇭🇰 香港 04',
        type: 'ss',
        server: 'hk4.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
        'dialer-proxy': '🇭🇰 香港 01 | 中转',
      },
      {
        name: '🇺🇸 美国 03',
        type: 'ss',
        server: 'us3.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
        'dialer-proxy': '🇺🇸 美国 01 | 解锁',
      },
      // --- dialer-proxy 引用：目标被重命名 ---
      { name: '日本大阪', type: 'ss', server: 'jp2.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      {
        name: '🇯🇵 东京',
        type: 'ss',
        server: 'jp3.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
        'dialer-proxy': '日本大阪',
      },
      // --- dialer-proxy 引用：目标被过滤移除 ---
      {
        name: '测试节点A',
        type: 'ss',
        server: '1.2.3.11',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
        'dialer-proxy': '剩余流量',
      },
    ],
  };
}

/** 精简订阅：用于配置选项开关测试 */
function minimalSubscription() {
  return {
    proxies: [
      { name: '🇭🇰 香港 A', type: 'ss', server: 'a.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '日本 B', type: 'ss', server: 'b.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '美国 C', type: 'vmess', server: 'c.example.com', port: 443, uuid: 'x', alterId: 0 },
      { name: '日本 2x 高倍率', type: 'ss', server: 'd.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '官网公告', type: 'ss', server: 'e.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
    ],
  };
}

/** 空节点列表 */
function emptySubscription() {
  return { proxies: [] };
}

/** 仅包含会被脚本按 type 过滤的节点（direct / reject / rematch） */
function filteredByTypeSubscription() {
  return {
    proxies: [
      { name: 'DIRECT', type: 'direct' },
      { name: 'REJECT', type: 'reject' },
      { name: 'REJECT-DROP', type: 'reject' },
      { name: 'REMATCH', type: 'rematch' },
    ],
  };
}

/** 全部为会被过滤的节点（信息节点 + rematch 类型），开启过滤时会全部被剔除 */
function allFilteredSubscription() {
  return {
    proxies: [
      { name: '官方网站', type: 'ss', server: '2.2.2.1', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '剩余流量', type: 'ss', server: '2.2.2.2', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: 'REMATCH', type: 'rematch' },
    ],
  };
}

/** 机场 hosts 映射场景：节点域名在 hosts 中映射到实际域名，fake-ip-filter 按实际域名书写 */
function hostsMappedSubscription() {
  return {
    dns: {
      listen: '198.18.0.1:53',
      'proxy-server-nameserver': ['198.18.0.1:53'],
      'fake-ip-filter': ['+.example-apt.com', '+.unrelated-filter.com'],
    },
    hosts: {
      'node-a1b2c3.example-node.biz': 'node-a1b2c3.example-apt.com',
      'www.unrelated.com': '10.0.0.9',
    },
    proxies: [
      { name: '🇭🇰 香港 A', type: 'ss', server: 'hk1.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      {
        name: '🇺🇸 美国 B',
        type: 'vmess',
        server: 'node-a1b2c3.example-node.biz',
        port: 443,
        uuid: 'x',
        alterId: 0,
      },
    ],
  };
}

/** hosts 通配/多值映射场景：精确条目优先于通配条目，数组取值取首个元素 */
function hostsWildcardSubscription() {
  return {
    dns: {
      listen: '198.18.0.1:53',
      'proxy-server-nameserver': ['198.18.0.1:53'],
    },
    hosts: {
      '+.premium.example.com': ['9.9.9.9', '9.9.9.8'],
      'hk1.premium.example.com': '1.1.1.1',
      'www.unrelated.com': '10.0.0.9',
    },
    proxies: [
      {
        name: '🇭🇰 香港 A',
        type: 'ss',
        server: 'hk1.premium.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
      },
      {
        name: '🇯🇵 日本 B',
        type: 'ss',
        server: 'jp2.premium.example.com',
        port: 443,
        cipher: 'aes-256-gcm',
        password: 'x',
      },
      { name: '🇺🇸 美国 C', type: 'ss', server: 'us1.other.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
    ],
  };
}

/** hosts 链式映射场景：节点域名 a → b → 最终 IP，中继条目应逐级解析生效 */
function hostsChainSubscription() {
  return {
    dns: {
      listen: '198.18.0.1:53',
      'proxy-server-nameserver': ['198.18.0.1:53'],
    },
    hosts: {
      'node-a1b2c3.example-node.biz': 'node-b1b2c3.example-apt.com',
      'node-b1b2c3.example-apt.com': '10.0.0.88',
      'www.unrelated.com': '10.0.0.9',
    },
    proxies: [
      { name: '🇭🇰 香港 A', type: 'ss', server: 'hk1.example.com', port: 443, cipher: 'aes-256-gcm', password: 'x' },
      { name: '🇺🇸 美国 B', type: 'vmess', server: 'node-a1b2c3.example-node.biz', port: 443, uuid: 'x', alterId: 0 },
    ],
  };
}

module.exports = {
  typicalSubscription,
  minimalSubscription,
  emptySubscription,
  filteredByTypeSubscription,
  allFilteredSubscription,
  hostsMappedSubscription,
  hostsWildcardSubscription,
  hostsChainSubscription,
};
