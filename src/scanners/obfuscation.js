import fs from 'fs';

export async function scanObfuscation(files) {
  const obfuscatedFiles = [];
  
  for (const file of files) {
    const content = await fs.promises.readFile(file, 'utf8').catch(() => '');
    const lines = content.split('\n');
    
    if (lines.length < 5) continue;
    
    let singleLetterVars = 0;
    let hasEval = false;
    let hasLongStrings = false;
    let averageLineLength = 0;
    let minifiedScore = 0;
    
    for (const line of lines) {
      if (line.length > 200) minifiedScore++;
      if (line.match(/\b[a-z]\s*=/i)) singleLetterVars++;
      if (line.includes('eval(')) hasEval = true;
      if (line.match(/"[A-Za-z0-9+/]{100,}"/)) hasLongStrings = true;
      averageLineLength += line.length;
    }
    
    averageLineLength = averageLineLength / lines.length;
    if (averageLineLength > 150) minifiedScore++;
    
    const totalVars = lines.join(' ').match(/\bvar\s+[a-z]\b/gi)?.length || 0;
    const suspicious = (singleLetterVars > 20 && totalVars > 10) || hasEval || hasLongStrings || minifiedScore > 2;
    
    if (suspicious) {
      obfuscatedFiles.push({
        file: file,
        indicators: {
          singleLetterVars: singleLetterVars,
          hasEval: hasEval,
          hasLongStrings: hasLongStrings,
          minified: minifiedScore > 2
        }
      });
    }
  }
  
  return obfuscatedFiles;
}