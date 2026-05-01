import fs from 'fs/promises';
import path from 'path';

function calculateEntropy(str) {
  if (str.length < 8) return 0;
  const chars = str.split('');
  const freq = {};
  for (const char of chars) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / chars.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isDictionaryWord(str) {
  const commonWords = ['development', 'production', 'localhost', 'password', 'secret', 'token', 'key', 'api', 'auth', 'true', 'false', 'null', 'undefined'];
  const lowerStr = str.toLowerCase();
  if (commonWords.includes(lowerStr)) return true;
  if (/^[a-z]+$/i.test(str) && str.length > 3 && str.length < 12) return true;
  if (/^[a-z_][a-z0-9_]*$/i.test(str) && str.length < 20) return true;
  if (str.includes('(?:') || str.includes('|') || str.includes('\\d') || str.includes('\\w') || str.includes('[') || str.includes('^') || str.includes('$')) return true;
  if (str.startsWith('{') && str.endsWith('}')) return true;
  if (str.startsWith('[') && str.endsWith(']')) return true;
  return false;
}

function isRegexPattern(str) {
  const regexIndicators = [
    /\\d|\\w|\\s/,
    /\(\?:/,
    /\[[a-z0-9]+\]/i,
    /[|()\[\]{}+*?]{3,}/,
    /\?[:=!]/
  ];
  let indicatorCount = 0;
  for (const indicator of regexIndicators) {
    if (indicator.test(str)) indicatorCount++;
  }
  if (indicatorCount >= 2) return true;
  if (str.match(/function.*return.*if\(/s)) return true;
  return false;
}

function tryDecode(value) {
  const results = [];
  if (value.length >= 16) {
    results.push({ name: 'plain', content: value });
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      if (decoded && decoded !== value && decoded.length > 0) {
        results.push({ name: 'base64', content: decoded });
      }
    } catch (e) {}
    try {
      const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
      const decoded2 = Buffer.from(base64, 'base64').toString('utf8');
      if (decoded2 && decoded2 !== value && decoded2.length > 0) {
        results.push({ name: 'base64url', content: decoded2 });
      }
    } catch (e) {}
    try {
      if (/^[0-9a-f]{16,}$/i.test(value)) {
        const decoded3 = Buffer.from(value, 'hex').toString('utf8');
        if (decoded3 && decoded3.length > 0) {
          results.push({ name: 'hex', content: decoded3 });
        }
      }
    } catch (e) {}
  }
  return results;
}

export async function scanSecrets(files) {
  const findings = [];
  
  for (const file of files) {
    let content;
    try {
      content = await fs.readFile(file, 'utf8');
    } catch (err) {
      continue;
    }
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//') || line.includes('console.log')) continue;
      
      const potentialSecrets = [];
      
      const assignmentMatches = line.matchAll(/(?:key|secret|token|api|auth|password|apikey|api_key|secret_key|access_token|private_key|webhook)\s*[=:]\s*["']([^"']+)["']/gi);
      for (const match of assignmentMatches) {
        potentialSecrets.push({ value: match[1], line: i + 1, context: 'assignment' });
      }
      
      const quotedMatches = line.matchAll(/["']([^"']{16,})["']/g);
      for (const match of quotedMatches) {
        potentialSecrets.push({ value: match[1], line: i + 1, context: 'quoted' });
      }
      
      const longTokenMatches = line.matchAll(/\b([A-Za-z0-9+/_-]{20,})\b/g);
      for (const match of longTokenMatches) {
        if (!/^[0-9]+$/.test(match[1]) && !/^[0-9a-f]{6}$/i.test(match[1])) {
          potentialSecrets.push({ value: match[1], line: i + 1, context: 'token' });
        }
      }
      
      for (const potential of potentialSecrets) {
        const value = potential.value;
        
        if (isDictionaryWord(value)) continue;
        if (isRegexPattern(value)) continue;
        const codeSymbols = (value.match(/[{}[\]();=<>]/g) || []).length;
        if (codeSymbols > 5) continue;
        if (value.length < 16) continue;
        if (value.includes(' ') || value.includes('\n')) continue;
        
        const entropy = calculateEntropy(value);
        const hasMixedCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecial = /[+/_-]/.test(value);
        
        let score = 0;
        if (entropy > 4.5) score += 4;
        else if (entropy > 3.5) score += 2;
        if (hasMixedCase && hasNumbers) score += 2;
        if (hasSpecial) score += 1;
        if (value.length > 30) score += 1;
        if (potential.context === 'assignment') score += 2;
        
        if (score >= 8) {
          const decodings = tryDecode(value);
          const decodedInfo = decodings.length > 1 ? ` (decoded from ${decodings[1].name}: ${decodings[1].content.substring(0, 50)})` : '';
          
          findings.push({
            file: path.basename(file),
            line: potential.line,
            value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
            entropy: entropy.toFixed(2),
            score: score,
            confidence: Math.min(100, Math.floor(score * 10)),
            decoded: decodedInfo
          });
        }
      }
    }
  }
  
  const uniqueFindings = [];
  const seen = new Set();
  for (const finding of findings) {
    const key = `${finding.file}:${finding.line}:${finding.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFindings.push(finding);
    }
  }
  
  return uniqueFindings;
}