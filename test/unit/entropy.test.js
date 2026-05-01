import { describe, it } from 'node:test';
import assert from 'node:assert';

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

describe('Entropy Calculation', () => {
  it('should return 0 for short strings', () => {
    assert.strictEqual(calculateEntropy('abc'), 0);
  });

  it('should return low entropy for repeated characters', () => {
    const entropy = calculateEntropy('aaaaaabbbcc');
    assert.ok(entropy < 2, 'Expected low entropy for repeated chars');
  });

  it('should return high entropy for random strings', () => {
    const entropy = calculateEntropy('sk-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU');
    assert.ok(entropy > 4, 'Expected high entropy for random string');
  });

  it('should return low entropy for dictionary words', () => {
    const entropy = calculateEntropy('development');
    assert.ok(entropy < 3.5, 'Expected low entropy for dictionary word');
  });

  it('should return high entropy for API keys', () => {
    const entropy = calculateEntropy('sk-proj-abcdefghijklmnopqrstuvwxyz0123456789');
    assert.ok(entropy > 4.5, 'Expected high entropy for API key');
  });
});