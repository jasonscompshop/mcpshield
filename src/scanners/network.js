import fs from 'fs/promises';
import path from 'path';

const trustedDomains = [
  'api.github.com', 'api.npmjs.org', 'registry.npmjs.org',
  'raw.githubusercontent.com', 'cdn.jsdelivr.net', 'unpkg.com',
  'cloudflare.com', 'fastly.net', 'amazonaws.com', 'googleapis.com',
  'microsoft.com', 'docker.com', 'nodejs.org', 'npmjs.com'
];

const suspiciousTLDs = ['.ru', '.cn', '.top', '.xyz', '.tk', '.ml', '.ga', '.cf', '.su', '.by'];

function scoreDomain(domain) {
  let score = 0;
  if (trustedDomains.some(td => domain.includes(td))) return -10;
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) score += 3;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) score += 5;
  const subdomain = domain.split('.')[0];
  if (subdomain && subdomain.length > 10) {
    const entropy = calculateEntropy(subdomain);
    if (entropy > 4.0) score += 3;
  }
  if (domain.length > 40) score += 2;
  return score;
}

function calculateEntropy(str) {
  if (str.length < 3) return 0;
  const freq = {};
  for (const char of str) freq[char] = (freq[char] || 0) + 1;
  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export async function scanNetwork(files) {
  const findings = [];
  const networkPatterns = [
    /fetch\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /axios\.(get|post|put|delete|patch)\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /\.get\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /\.post\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /http\.(get|request)\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /new URL\(\s*['"`](https?:\/\/[^'"`]+)['"`]/gi,
    /WebSocket\(\s*['"`](wss?:\/\/[^'"`]+)['"`]/gi
  ];
  
  for (const file of files) {
    let content;
    try { content = await fs.readFile(file, 'utf8'); } catch { continue; }
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of networkPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const url = match[1];
          let domain;
          try { domain = new URL(url).hostname; } catch { domain = url; }
          const score = scoreDomain(domain);
          if (score >= 3) {
            findings.push({
              file: path.basename(file),
              line: i + 1,
              url: url.substring(0, 80),
              domain: domain,
              riskScore: score,
              reason: score >= 5 ? 'IP address or very suspicious' : 'Suspicious domain pattern'
            });
          }
        }
      }
    }
  }
  return findings;
}