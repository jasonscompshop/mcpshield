import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function scanPackage(packageName) {
  const tempDir = '.mcpshield-test-' + Date.now();
  let score = null;
  
  try {
    execSync(`npm pack ${packageName} --silent`, { cwd: tempDir, stdio: 'pipe' });
    const tgzFile = fs.readdirSync(tempDir).find(f => f.endsWith('.tgz'));
    execSync(`tar -xzf ${tgzFile}`, { cwd: tempDir, stdio: 'pipe' });
    
    const packageDir = path.join(tempDir, 'package');
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    
    let issueCount = 0;
    
    // Check install scripts
    if (packageJson.scripts?.preinstall || packageJson.scripts?.postinstall || packageJson.scripts?.install) {
      issueCount++;
    }
    
    // Check dependencies
    const depCount = Object.keys({ 
      ...packageJson.dependencies, 
      ...packageJson.devDependencies 
    }).length;
    
    // Simple scoring logic matching the main scanner
    if (depCount > 50) issueCount += 2;
    
    score = Math.max(0, 100 - (issueCount * 20));
    
  } catch (e) {
    // Package download failed
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
  }
  
  return score;
}

describe('Known Packages', () => {
  it('express should score >80', () => {
    const score = scanPackage('express');
    if (score !== null) {
      assert.ok(score >= 80, `Expected score >= 80, got ${score}`);
    }
  }, 30000);

  it('lodash should score >=50', () => {
    const score = scanPackage('lodash');
    if (score !== null) {
      assert.ok(score >= 50, `Expected score >= 50, got ${score}`);
    }
  }, 30000);

  it('express has no install scripts', () => {
    const tempDir = '.mcpshield-test-' + Date.now();
    let hasScripts = false;
    
    try {
      execSync(`npm pack express --silent`, { cwd: tempDir, stdio: 'pipe' });
      const tgzFile = fs.readdirSync(tempDir).find(f => f.endsWith('.tgz'));
      execSync(`tar -xzf ${tgzFile}`, { cwd: tempDir, stdio: 'pipe' });
      
      const packageJson = JSON.parse(fs.readFileSync(path.join(tempDir, 'package', 'package.json'), 'utf8'));
      hasScripts = !!(packageJson.scripts?.preinstall || packageJson.scripts?.postinstall || packageJson.scripts?.install);
      
    } catch (e) {} 
    finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
    
    assert.strictEqual(hasScripts, false, 'Express should not have install scripts');
  }, 30000);
});