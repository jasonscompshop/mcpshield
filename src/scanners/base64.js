import fs from 'fs';

export async function scanBase64(files) {
  const encodedPayloads = [];
  
  const base64Pattern = /[A-Za-z0-9+/]{50,}={0,2}/g;
  const suspiciousKeywords = ['curl', 'wget', 'bash', 'sh', 'eval', 'exec', 'base64', 'decod', 'chmod', 'chown', 'rm -rf', 'sudo', 'cat ', '> ', '| ', ';\s', '&\s'];
  
  for (const file of files) {
    const content = await fs.promises.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      while ((match = base64Pattern.exec(line)) !== null) {
        const base64String = match[0];
        try {
          const decoded = Buffer.from(base64String, 'base64').toString('utf8');
          const hasSuspicious = suspiciousKeywords.some(keyword => 
            decoded.toLowerCase().includes(keyword)
          );
          if (hasSuspicious && decoded.length > 20) {
            encodedPayloads.push({
              file: file,
              line: i + 1,
              encoded: base64String.substring(0, 50) + '...',
              decoded: decoded.substring(0, 100)
            });
          }
        } catch (e) {
          // Not valid base64
        }
      }
    }
  }
  
  return encodedPayloads;
}