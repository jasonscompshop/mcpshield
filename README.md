# 🛡️ MCP Shield

[![npm version](https://img.shields.io/npm/v/mcpshield.svg)](https://www.npmjs.com/package/mcpshield)
[![npm downloads](https://img.shields.io/npm/dm/mcpshield.svg)](https://www.npmjs.com/package/mcpshield)
[![license](https://img.shields.io/npm/l/mcpshield.svg)](https://github.com/mcpshield/mcpshield/blob/main/LICENSE)
[![tests](https://github.com/mcpshield/mcpshield/actions/workflows/test.yml/badge.svg)](https://github.com/mcpshield/mcpshield/actions)

**Security scanner for npm packages and MCP servers - catches vulnerabilities, secrets, and malicious code before you install.**

## ✨ Features

- 🔍 **20+ security detectors** - CVEs, secrets, malware patterns, supply chain attacks
- 🎯 **Zero configuration** - One command, instant results  
- 🛡️ **Safe by design** - Metadata first, asks before downloading
- 📊 **Risk scoring** - 0-100 safety score with clear status
- 🚀 **Fast** - Scans complete in seconds
- 🔒 **Zero API keys** - Fully self-contained

## 📦 Installation

```bash
npm install -g mcpshield
```

## 🚀 Usage

```bash
# Scan an npm package
mcpshield scan express

# Scan an MCP server
mcpshield scan mcp-proxy

# Show help
mcpshield --help

# Show version
mcpshield --version
```

## Example Output

```
🛡️  MCP SHIELD SECURITY REPORT
════════════════════════════════════════════════════════════
📦 express@4.18.1
⏱️  Scanned in 2.3s
════════════════════════════════════════════════════════════

✅ No security issues detected

════════════════════════════════════════════════════════════
📊 SAFETY SCORE: 100/100
✅ STATUS: SAFE - Package appears secure
════════════════════════════════════════════════════════════
```

## Security Detectors

| Detector | Description |
|----------|------------|
| CVEs | Known vulnerabilities in dependencies |
| Secrets | Entropy-based API key detection |
| Network | Domain trust scoring |
| Filesystem | Sensitive file access |
| Child Process | Dangerous command execution |
| Install Scripts | Auto-run hooks |
| Obfuscation | Minified/hidden code |
| Typosquatting | Lookalike package names |
| Threat Intel | Known malicious packages |
| Supply Chain | Version attacks |

## For MCP Servers

MCP Shield is purpose-built for the MCP ecosystem:

- ✅ Scans MCP server packages
- ✅ Detects hardcoded API tokens
- ✅ Flags suspicious network calls
- ✅ Checks for malicious code

```bash
# Official Anthropic MCP servers
mcpshield scan @anthropic/mcp-server-sqlite

# Third-party MCP servers  
mcpshield scan mcp-proxy
```

## Development

```bash
# Run tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
```

## License

MIT © 2024

## Credits

Built for the MCP community 🛡️