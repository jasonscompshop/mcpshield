import fs from 'fs';
import path from 'path';

export async function scanDependencyDepth(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return { total: 0, issues: [] };
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };
  
  const depCount = Object.keys(allDeps).length;
  const issues = [];
  
  if (depCount > 50) {
    issues.push(`High dependency count: ${depCount} dependencies (large attack surface)`);
  }
  if (depCount > 100) {
    issues.push(`Critical dependency count: ${depCount} dependencies (extremely large attack surface)`);
  }
  
  return { total: depCount, issues };
}