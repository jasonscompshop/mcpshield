import fs from 'fs/promises';

export async function scanTimeBomb(files) {
  const findings = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('Date.now()') || line.includes('new Date()')) {
        if (line.includes('>') || line.includes('<') || line.includes('===')) {
          findings.push({
            file: file.split('/').pop(),
            line: i + 1,
            pattern: 'Date-based condition',
            risk: 'MEDIUM'
          });
        }
      }
      
      const timeoutMatch = line.match(/set(Timeout|Interval)\(.*?,\s*(\d+)\s*\)/);
      if (timeoutMatch && parseInt(timeoutMatch[1]) > 10000) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          pattern: `Long delay: ${timeoutMatch[1]}ms`,
          risk: 'MEDIUM'
        });
      }
    }
  }
  
  return findings;
}