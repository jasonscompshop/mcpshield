import fs from 'fs';

export async function scanNetworkChaining(files) {
  const chains = [];
  
  for (const file of files) {
    const content = await fs.promises.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      const fetchMatch = line.match(/fetch\(['"]([^'"]+)['"]\)/);
      const variableMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*await\s+fetch/);
      
      if (variableMatch && fetchMatch) {
        const varName = variableMatch[1];
        const secondFetchPattern = new RegExp(`await\\s+fetch\\([^)]*\\$\\{${varName}\\}`);
        
        if (secondFetchPattern.test(nextLine)) {
          chains.push({
            file: file,
            line: i + 1,
            pattern: `${varName} from fetch used in subsequent fetch`,
            url: fetchMatch[1]
          });
        }
      }
    }
  }
  
  return chains;
}