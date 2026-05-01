import { describe, it } from 'node:test';
import assert from 'node:assert';

const trustedDomains = [
  'api.github.com', 'api.npmjs.org', 'registry.npmjs.org',
  'raw.githubusercontent.com', 'cdn.jsdelivr.net', 'unpkg.com',
  'cloudflare.com', 'fastly.net', 'amazonaws.com', 'googleapis.com'
];

const suspiciousTLDs = ['.ru', '.cn', '.top', '.xyz', '.tk', '.ml', '.ga'];

function scoreDomain(domain) {
  let score = 0;
  if (trustedDomains.some(td => domain.includes(td))) return -10;
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) score += 3;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) score += 5;
  return score;
}

describe('Network Scanner', () => {
  it('should trust known domains', () => {
    assert.strictEqual(scoreDomain('api.github.com'), -10);
    assert.strictEqual(scoreDomain('registry.npmjs.org'), -10);
    assert.strictEqual(scoreDomain('cdn.jsdelivr.net'), -10);
  });

  it('should score suspicious TLDs', () => {
    assert.ok(scoreDomain('evil-site.ru') >= 3);
    assert.ok(scoreDomain('malware.top') >= 3);
    assert.ok(scoreDomain('suspicious.xyz') >= 3);
  });

  it('should flag IP addresses', () => {
    assert.strictEqual(scoreDomain('192.168.1.1'), 5);
    assert.strictEqual(scoreDomain('10.0.0.1'), 5);
  });

  it('should allow normal domains', () => {
    assert.ok(scoreDomain('example.com') >= 0);
    assert.ok(scoreDomain('mysite.io') >= 0);
  });
});