import fs from 'fs/promises';
import path from 'path';

const suspiciousCommands = [
  { pattern: /curl\s+/, risk: 'Downloading remote content', weight: 6 },
  { pattern: /wget\s+/, risk: 'Downloading remote content', weight: 6 },
  { pattern: /bash\s+-c/, risk: 'Shell command execution', weight: 5 },
  { pattern: /sh\s+[^.]/, risk: 'Shell script execution', weight: 5 },
  { pattern: /chmod\s+7/, risk: 'Changing file permissions', weight: 4 },
  { pattern: /chown\s+/, risk: 'Changing file ownership', weight: 4 },
  { pattern: /rm\s+-rf/, risk: 'Deleting files', weight: 5 },
  { pattern: /sudo\s+/, risk: 'Privilege escalation', weight: 8 },
  { pattern: /nc\s+-e/, risk: 'Reverse shell', weight: 10 },
  { pattern: /python\s+-c\s+['"]/, risk: 'Inline Python execution', weight: 6 },
  { pattern: /node\s+-e\s+['"]/, risk: 'Inline Node execution', weight: 6 },
  { pattern: /eval\s*\(/, risk: 'Code evaluation', weight: 7 },
  { pattern: /base64\s+--decode/, risk: 'Decoding content', weight: 5 }
];

function scoreCommand(cmd) {
  let maxWeight = 0;
  let matchedRisk = '';
  for (const { pattern, risk, weight } of suspiciousCommands) {
    if (pattern.test(cmd)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        matchedRisk = risk;
      }
    }
  }
  return { weight: maxWeight, risk: matchedRisk };
}

export async function scanChildProcess(files) {
  const findings = [];
  const execPatterns = [
    /(?:exec|execSync|execFile|execFileSync|spawn|fork)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /child_process\.(exec|execSync|execFile|spawn|fork)\s*\(\s*['"`]([^'"`]+)['"`]/gi
  ];
  
  for (const file of files) {
    let content;
    try { content = await fs.readFile(file, 'utf8'); } catch { continue; }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of execPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const command = match[1] || match[2];
          const { weight, risk } = scoreCommand(command);
          if (weight >= 5) {
            findings.push({
              file: path.basename(file),
              line: i + 1,
              command: command.substring(0, 80),
              risk: risk,
              riskScore: weight
            });
          }
        }
      }
    }
  }
  return findings;
}