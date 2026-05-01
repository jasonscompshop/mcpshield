import fs from 'fs/promises';

export async function scanAST(files) {
  const findings = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('eval(') || line.includes('new Function(')) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          finding: 'Dynamic code execution',
          risk: 'HIGH'
        });
      }
      
      if (line.match(/Object\.(prototype|__proto__)/) && line.includes('=')) {
        findings.push({
          file: file.split('/').pop(),
          line: i + 1,
          finding: 'Prototype pollution',
          risk: 'HIGH'
        });
      }
    }
  }
  
  return findings;
}