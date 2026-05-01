import fs from 'fs';

export async function scanInstallScripts(packageJson) {
  const issues = [];
  const scripts = packageJson.scripts || {};
  
  const dangerousScripts = ['preinstall', 'install', 'postinstall'];
  const dangerousPatterns = [
    /curl/, /wget/, /bash/, /sh /, /eval/, /base64/, 
    /node\s+-e/, /node\s+.*\.mjs/, /node\s+.*\.js/,
    /chmod/, /chown/, /rm -rf/, /sudo/, /python/
  ];
  
  for (const script of dangerousScripts) {
    if (scripts[script]) {
      const content = scripts[script];
      const matches = [];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          matches.push(pattern.toString());
        }
      }
      if (matches.length > 0) {
        issues.push({
          script: script,
          content: content.substring(0, 200),
          suspiciousPatterns: matches
        });
      }
    }
  }
  
  return issues;
}