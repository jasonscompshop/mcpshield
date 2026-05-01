import https from 'https';

export async function scanReputation(packageName, packageJson) {
  let score = 50;
  const factors = [];
  
  try {
    const packageInfo = await getPackageMetadata(packageName);
    
    const downloads = packageInfo.downloads?.lastMonth || 0;
    if (downloads > 1000000) {
      score += 20;
      factors.push('High download count (+20)');
    } else if (downloads > 100000) {
      score += 10;
      factors.push('Good download count (+10)');
    } else if (downloads < 100) {
      score -= 15;
      factors.push('Very low downloads (-15)');
    }
    
    const maintainerCount = packageInfo.maintainers?.length || 0;
    if (maintainerCount >= 3) {
      score += 10;
      factors.push('Multiple maintainers (+10)');
    } else if (maintainerCount === 0) {
      score -= 20;
      factors.push('No maintainers listed (-20)');
    }
    
    const publishDate = new Date(packageInfo.time?.created);
    const ageInDays = (Date.now() - publishDate) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) {
      score += 10;
      factors.push('Established package (+10)');
    } else if (ageInDays < 30 && downloads > 10000) {
      score -= 10;
      factors.push('New but popular (suspicious) (-10)');
    }
    
  } catch (err) {
    // Skip on error
  }
  
  return { score: Math.min(100, Math.max(0, score)), factors };
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