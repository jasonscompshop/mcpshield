import fs from 'fs/promises';
import path from 'path';

const sensitivePatterns = [
  { pattern: /~\/\.ssh\//, risk: 'SSH keys', weight: 10 },
  { pattern: /~\/\.aws\//, risk: 'AWS credentials', weight: 10 },
  { pattern: /~\/\.config\/gcloud/, risk: 'GCloud credentials', weight: 9 },
  { pattern: /\/etc\/passwd/, risk: 'System passwords', weight: 10 },
  { pattern: /\/etc\/shadow/, risk: 'System passwords', weight: 10 },
  { pattern: /\.env/, risk: 'Environment variables', weight: 8 },
  { pattern: /~\/\.npmrc/, risk: 'NPM credentials', weight: 7 },
  { pattern: /~\/\.claude\//, risk: 'Claude config', weight: 6 },
  { pattern: /~\/\.cursor\//, risk: 'Cursor config', weight: 6 },
  { pattern: /\/\.git\/config/, risk: 'Git config with secrets', weight: 8 },
  { pattern: /id_rsa|id_dsa|id_ecdsa|id_ed25519/, risk: 'Private SSH key', weight: 10 },
  { pattern: /\.pem$/, risk: 'Private key file', weight: 9 },
  { pattern: /\.key$/, risk: 'Key file', weight: 8 }
];

function scorePath(filepath, line) {
  let maxWeight = 0;
  let matchedRisk = '';
  for (const { pattern, risk, weight } of sensitivePatterns) {
    if (pattern.test(filepath) || pattern.test(line)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        matchedRisk = risk;
      }
    }
  }
  if (line.includes('HOME') || line.includes('USERPROFILE') || line.includes('process.env')) {
    if (line.includes('ssh') || line.includes('aws') || line.includes('.env')) {
      maxWeight = Math.max(maxWeight, 7);
      matchedRisk = matchedRisk || 'Dynamic sensitive path construction';
    }
  }
  return { weight: maxWeight, risk: matchedRisk };
}

export async function scanFilesystem(files) {
  const findings = [];
  for (const file of files) {
    let content;
    try { content = await fs.readFile(file, 'utf8'); } catch { continue; }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const readMatches = line.match(/(?:readFile|readFileSync|createReadStream|open)\s*\(\s*['"`]([^'"`]+)['"`]/gi);
      if (readMatches) {
        const { weight, risk } = scorePath('', line);
        if (weight >= 7) {
          findings.push({
            file: path.basename(file),
            line: i + 1,
            match: line.trim().substring(0, 100),
            risk: risk,
            riskScore: weight
          });
        }
      }
    }
  }
  return findings;
}