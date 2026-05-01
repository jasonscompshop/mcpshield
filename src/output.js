export function printReport(packageName, version, results, score, duration = '0.0') {
  const totalIssues = Object.values(results).flat().filter(r => r && r.length > 0).length;
  
  console.log('\n' + '═'.repeat(60));
  console.log(`🛡️  MCP SHIELD SECURITY REPORT`);
  console.log('═'.repeat(60));
  console.log(`📦 ${packageName}@${version}`);
  console.log(`⏱️  Scanned in ${duration}s`);
  console.log('═'.repeat(60));
  
  const sections = [
    { name: 'Critical Vulnerabilities', key: 'cve', icon: '🔴', showIfEmpty: true },
    { name: 'Secrets & API Keys', key: 'secrets', icon: '🔑', showIfEmpty: true },
    { name: 'Install Scripts', key: 'installScripts', icon: '⚠️', showIfEmpty: false },
    { name: 'Network Calls', key: 'network', icon: '🌐', showIfEmpty: false },
    { name: 'Child Processes', key: 'childProcess', icon: '⚙️', showIfEmpty: false },
    { name: 'Obfuscated Code', key: 'obfuscation', icon: '🕵️', showIfEmpty: false }
  ];
  
  let hasFindings = false;
  
  for (const section of sections) {
    const findings = results[section.key];
    if (findings && findings.length > 0) {
      hasFindings = true;
      console.log(`\n${section.icon} ${section.name} (${findings.length}):`);
      for (const finding of findings.slice(0, 5)) {
        const line = finding.line ? `:${finding.line}` : '';
        const file = finding.file ? `${finding.file}${line} - ` : '';
        const message = finding.issue || finding.finding || finding.details || finding.value || finding.url || finding.command || finding.risk;
        console.log(`   ${file}${message?.substring(0, 70)}`);
      }
      if (findings.length > 5) {
        console.log(`   ... and ${findings.length - 5} more`);
      }
    }
  }
  
  if (!hasFindings) {
    console.log('\n✅ No security issues detected');
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 SAFETY SCORE: ${score.score}/100`);
  
  if (score.score >= 80) {
    console.log(`✅ STATUS: SAFE - Package appears secure`);
  } else if (score.score >= 50) {
    console.log(`⚠️  STATUS: CAUTION - Review findings before using`);
  } else {
    console.log(`❌ STATUS: DANGEROUS - Do not use this package`);
  }
  
  console.log('═'.repeat(60) + '\n');
}