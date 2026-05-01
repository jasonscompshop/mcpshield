import https from 'https';

export async function scanSuspiciousUpdates(packageJson, packageName, version) {
  const findings = [];
  
  try {
    const packageInfo = await getPackageMetadata(packageName);
    const versions = Object.keys(packageInfo.versions || {});
    const currentIndex = versions.indexOf(version);
    
    if (currentIndex > 0) {
      const prevVersion = versions[currentIndex - 1];
      const versionNumbers = version.split('.').map(Number);
      const prevNumbers = prevVersion.split('.').map(Number);
      const majorJump = versionNumbers[0] - prevNumbers[0] > 1;
      const minorJump = versionNumbers[1] - prevNumbers[1] > 5;
      
      if (majorJump || minorJump) {
        findings.push({
          issue: `Version jumped from ${prevVersion} to ${version}`,
          risk: 'HIGH',
          reason: 'Unusual version increment'
        });
      }
    }
  } catch (err) {
    // Skip
  }
  
  return findings;
}

function getPackageMetadata(packageName) {
  return new Promise((resolve) => {
    const options = { hostname: 'registry.npmjs.org', path: `/${packageName}`, method: 'GET' };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve({}); } });
    });
    req.on('error', () => resolve({}));
    req.end();
  });
}