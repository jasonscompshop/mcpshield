export function calculateScore(results) {
  let deductions = 0;
  
  if (results.cve?.length > 0) deductions += results.cve.length * 15;
  if (results.secrets?.length > 0) deductions += results.secrets.length * 20;
  if (results.filesystem?.length > 0) deductions += results.filesystem.length * 5;
  if (results.network?.length > 0) deductions += results.network.length * 3;
  if (results.childProcess?.length > 0) deductions += results.childProcess.length * 5;
  if (results.installScripts?.length > 0) deductions += results.installScripts.length * 25;
  if (results.dependencyDepth?.total > 50) deductions += Math.floor(results.dependencyDepth.total / 10);
  if (results.base64?.length > 0) deductions += results.base64.length * 30;
  if (results.obfuscation?.length > 0) deductions += results.obfuscation.length * 20;
  if (results.networkChaining?.length > 0) deductions += results.networkChaining.length * 15;
  
  let score = Math.max(0, 100 - deductions);
  return { score, deductions };
}