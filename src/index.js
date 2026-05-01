#!/usr/bin/env node

/**
 * MCP Shield - Security Scanner for npm Packages
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '1.0.0';

import { scanCVEs } from './cve.js';
import { scanSecrets } from './scanners/secrets.js';
import { scanFilesystem } from './scanners/filesystem.js';
import { scanNetwork } from './scanners/network.js';
import { scanChildProcess } from './scanners/child-process.js';
import { scanInstallScripts } from './scanners/install-scripts.js';
import { scanDependencyDepth } from './scanners/dependency-depth.js';
import { scanBase64 } from './scanners/base64.js';
import { scanObfuscation } from './scanners/obfuscation.js';
import { scanNetworkChaining } from './scanners/network-chaining.js';
import { scanDependencyTree } from './scanners/dependency-tree.js';
import { scanSuspiciousUpdates } from './scanners/suspicious-updates.js';
import { scanCrossPackage } from './scanners/cross-package.js';
import { scanReputation } from './scanners/reputation.js';
import { scanThreatIntel } from './scanners/threat-intel.js';
import { scanAST } from './scanners/ast-analysis.js';
import { scanLicense } from './scanners/license.js';
import { scanTyposquatting } from './scanners/typosquatting.js';
import { scanTimeBomb } from './scanners/time-bomb.js';
import { scanEnvironment } from './scanners/environment.js';
import { calculateScore } from './score.js';
import { printReport } from './output.js';

function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.toLowerCase()); });
  });
}

async function downloadPackage(packageName) {
  const tempDir = path.join(process.cwd(), '.mcpshield-temp');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    execSync(`npm pack ${packageName} --silent`, { cwd: tempDir, stdio: 'pipe' });
    const tgzFile = fs.readdirSync(tempDir).find(f => f.endsWith('.tgz'));
    if (!tgzFile) throw new Error('Failed to download');
    execSync(`tar -xzf ${tgzFile}`, { cwd: tempDir, stdio: 'pipe' });
    return path.join(tempDir, 'package');
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`Failed to download ${packageName}`);
  }
}

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') getAllFiles(fullPath, files);
    } else if (entry.name.match(/\.(js|ts|json|mjs|cjs)$/)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function scanPackage(packageName) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Fetching metadata for ${packageName}...`);
    let metadata;
    try {
      metadata = JSON.parse(execSync(`npm view ${packageName} --json`, { encoding: 'utf8' }));
    } catch { throw new Error(`Package "${packageName}" not found`); }
    
    console.log(`\n📋 Package: ${metadata.name}@${metadata.version}`);
    console.log(`   Published: ${metadata.time?.created?.split('T')[0] || 'unknown'}`);
    console.log(`   Maintainers: ${metadata.maintainers?.length || 0}`);
    
    if (metadata.scripts?.preinstall || metadata.scripts?.postinstall || metadata.scripts?.install) {
      console.log(`\n⚠️  Warning: This package has install scripts`);
    }
    
    const proceed = await askQuestion('\n⚠️  Deep scan downloads the package. Proceed? (y/n): ');
    if (proceed !== 'y' && proceed !== 'yes') {
      console.log('\n❌ Scan cancelled');
      return;
    }
    
    const packageDir = await downloadPackage(packageName);
    const packageJsonPath = path.join(packageDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allFiles = getAllFiles(packageDir);
    
    console.log(`\n🔍 Scanning ${packageName}...\n`);
    
    const results = await Promise.all([
      scanCVEs(packageJson),
      scanSecrets(allFiles),
      scanFilesystem(allFiles),
      scanNetwork(allFiles),
      scanChildProcess(allFiles),
      scanInstallScripts(packageJson),
      scanDependencyDepth(packageDir),
      scanBase64(allFiles),
      scanObfuscation(allFiles),
      scanNetworkChaining(allFiles),
      scanDependencyTree(packageJson),
      scanSuspiciousUpdates(packageJson, packageName, packageJson.version),
      scanCrossPackage(allFiles),
      scanReputation(packageName, packageJson),
      scanThreatIntel(packageName),
      scanAST(allFiles),
      scanLicense(packageJson),
      scanTyposquatting(packageName),
      scanTimeBomb(allFiles),
      scanEnvironment(allFiles)
    ]);
    
    const scored = {
      cve: results[0], secrets: results[1], filesystem: results[2], network: results[3],
      childProcess: results[4], installScripts: results[5], dependencyDepth: results[6],
      base64: results[7], obfuscation: results[8], networkChaining: results[9],
      dependencyTree: results[10], suspiciousUpdates: results[11], crossPackage: results[12],
      reputation: results[13], threatIntel: results[14], ast: results[15],
      license: results[16], typosquatting: results[17], timeBomb: results[18], environment: results[19]
    };
    
    const score = calculateScore(scored);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    printReport(packageName, packageJson.version, scored, score, duration);
    
    fs.rmSync(path.dirname(packageDir), { recursive: true, force: true });
    
  } catch (error) {
    console.error(`❌ ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🛡️  MCP Shield v${VERSION} - Security Scanner for npm Packages

USAGE:
  mcpshield scan <package-name>     Scan an npm package
  mcpshield --help                 Show this help
  mcpshield --version              Show version

EXAMPLES:
  mcpshield scan express
  mcpshield scan @anthropic/mcp-server-sqlite
  mcpshield scan lodash
`);
    process.exit(0);
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    console.log(`v${VERSION}`);
    process.exit(0);
  }
  
  const command = args[0];
  const packageName = args[1];
  
  if (command === 'scan' && packageName) {
    await scanPackage(packageName);
  } else {
    console.log(`MCP Shield v${VERSION}\nUsage: mcpshield scan <package-name>\nRun 'mcpshield --help' for usage`);
  }
}

main();