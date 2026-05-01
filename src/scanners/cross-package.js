import fs from 'fs/promises';

export async function scanCrossPackage(files) {
  const findings = [];
  const allDomains = new Set();
  const domainRegex = /https?:\/\/([^\/\s"']+)/gi;
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8').catch(() => '');
    let match;
    while ((match = domainRegex.exec(content)) !== null) {
      allDomains.add(match[1]);
    }
  }
  
  const suspiciousDomains = Array.from(allDomains).filter(domain => 
    domain.includes('evil') || domain.includes('.ru') || domain.includes('.top') || domain.includes('.xyz')
  );
  
  if (suspiciousDomains.length > 0) {
    findings.push({
      issue: `Found ${suspiciousDomains.length} suspicious domains`,
      domains: suspiciousDomains.slice(0, 5),
      risk: 'HIGH'
    });
  }
  
  return findings;
}