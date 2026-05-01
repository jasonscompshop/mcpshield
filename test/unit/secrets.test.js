import { describe, it } from 'node:test';
import assert from 'node:assert';

function isDictionaryWord(str) {
  const commonWords = ['development', 'production', 'localhost', 'password', 'secret', 'token', 'key', 'api', 'auth', 'true', 'false', 'null', 'undefined'];
  const lowerStr = str.toLowerCase();
  if (commonWords.includes(lowerStr)) return true;
  if (/^[a-z]+$/i.test(str) && str.length > 3 && str.length < 12) return true;
  if (/^[a-z_][a-z0-9_]*$/i.test(str) && str.length < 20) return true;
  if (str.includes('(?:') || str.includes('|') || str.includes('\\d') || str.includes('\\w') || str.includes('[') || str.includes('^') || str.includes('$')) return true;
  if (str.startsWith('{') && str.endsWith('}')) return true;
  if (str.startsWith('[') && str.endsWith(']')) return true;
  return false;
}

function calculateEntropy(str) {
  if (str.length < 8) return 0;
  const chars = str.split('');
  const freq = {};
  for (const char of chars) freq[char] = (freq[char] || 0) + 1;
  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / chars.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

describe('Secret Detection', () => {
  it('should filter dictionary words', () => {
    assert.strictEqual(isDictionaryWord('development'), true);
    assert.strictEqual(isDictionaryWord('localhost'), true);
    assert.strictEqual(isDictionaryWord('password'), true);
  });

  it('should allow API key formats', () => {
    assert.strictEqual(isDictionaryWord('sk-proj-abcdefghijklmnopqrstuvwxyz0123456789'), false);
    assert.strictEqual(isDictionaryWord('ghp_abcdefghijklmnopqrstuvwxyz0123456789'), false);
    assert.strictEqual(isDictionaryWord('AKIAIOSFODNN7EXAMPLE'), false);
  });

  it('should filter regex patterns', () => {
    assert.strictEqual(isDictionaryWord('\\d*(?:1st|2nd|3rd)'), true);
    assert.strictEqual(isDictionaryWord('[a-z]+'), true);
    assert.strictEqual(isDictionaryWord('(?:foo|bar)'), true);
  });

  it('should detect high entropy in API keys', () => {
    const entropy = calculateEntropy('sk-proj-abcdefghijklmnopqrstuvwxyz0123456789');
    assert.ok(entropy > 4, 'API key should have high entropy');
  });
});