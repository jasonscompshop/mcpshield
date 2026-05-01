import fs from 'fs/promises';

export async function scanEnvironment(files) {
  const findings = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('NODE_ENV') && (line.includes('production') || line.includes('&&'))) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          pattern: 'Production-only execution',
          risk: 'MEDIUM'
        });
      }
      
      const envMatch = line.match(/process\.env\.([A-Z_]+)/g);
      if (envMatch && envMatch.length > 3) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          pattern: `Multiple env vars (${envMatch.length})`,
          risk: 'MEDIUM'
        });
      }
      
      if (line.includes('os.hostname') || line.includes('.hostname()')) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          pattern: 'Hostname detection',
          risk: 'HIGH'
        });
      }
    }
  }
  
  return findings;
}