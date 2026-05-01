export async function scanThreatIntel(packageName) {
  const findings = [];
  
  const knownMalicious = [
    'event-stream', 'flatmap-stream', 'ua-parser-js', 'nodejs-utils',
    'es5-ext', 'purescript', 'coa', 'electron-notarize'
  ];
  
  if (knownMalicious.includes(packageName)) {
    findings.push({
      issue: 'Package has known malicious past',
      risk: 'CRITICAL',
      reason: 'Has been compromised in supply chain attacks'
    });
  }
  
  return findings;
}