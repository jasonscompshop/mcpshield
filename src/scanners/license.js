export async function scanLicense(packageJson) {
  const license = packageJson.license;
  if (!license) {
    return [{ issue: 'No license specified', risk: 'MEDIUM' }];
  }
  
  const riskyLicenses = ['GPL', 'AGPL'];
  const risky = riskyLicenses.find(l => typeof license === 'string' && license.includes(l));
  
  if (risky) {
    return [{
      issue: `License: ${license}`,
      risk: 'MEDIUM',
      reason: `${risky} license may have source code restrictions`
    }];
  }
  
  return [];
}