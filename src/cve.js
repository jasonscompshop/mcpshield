import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function scanCVEs(packageJson, packageDir) {
  const vulnerabilities = [];
  
  try {
    // Install deps to check CVEs
    const installResult = execSync('npm install --silent 2>&1', { 
      cwd: packageDir, 
      encoding: 'utf8', 
      timeout: 120000 
    });
    
    // Run npm audit
    const auditResult = execSync('npm audit --json 2>/dev/null', { 
      cwd: packageDir, 
      encoding: 'utf8', 
      timeout: 30000 
    });
    
    const audit = JSON.parse(auditResult || '{}');
    
    if (audit.vulnerabilities) {
      const vulns = audit.vulnerabilities;
      for (const [name, data] of Object.entries(vulns)) {
        if (name !== 'development' && name !== 'devDependencies' && name !== 'dependencies') {
          vulnerabilities.push({
            package: data.name || name,
            severity: data.severity || 'unknown',
            title: name
          });
        }
      }
    }
  } catch (e) {
    // No vulns found or install timed out
  }
  
  return vulnerabilities;
}