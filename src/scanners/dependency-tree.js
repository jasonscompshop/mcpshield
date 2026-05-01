import https from 'https';
import fs from 'fs/promises';

export async function scanDependencyTree(packageJson) {
  const findings = [];
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const [dep, version] of Object.entries(allDeps)) {
    try {
      const depInfo = await getPackageInfo(dep);
      const cleanVersion = version.replace(/[\^~>=<]/, '');
      
      if (depInfo['dist-tags']?.latest && depInfo['dist-tags'].latest !== cleanVersion) {
        findings.push({
          package: dep,
          currentVersion: cleanVersion,
          latestVersion: depInfo['dist-tags'].latest,
          issue: 'Not using latest version',
          risk: 'MEDIUM'
        });
      }
    } catch (err) {
      // Skip
    }
  }
  
  return findings;
}

function getPackageInfo(packageName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: `/${packageName}`,
      method: 'GET'
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
      });
    });
    req.on('error', () => resolve({}));
    req.end();
  });
}