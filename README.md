# 🛡️ MCP Shield

security scanner for npm packages and MCP servers

| Scanner | What it detects |
|---------|----------------|
| secrets | Hardcoded keys, tokens, passwords |
| network | Network calls, domain trust scoring |
| filesystem | Sensitive file reads (etc/passwd, .env, etc.) |
| child-process | exec/spawn calls |
| install-scripts | preinstall/postinstall scripts |
| dependency-depth | Number of dependencies |
| base64 | Encoded base64 strings (decodes and scans) |
| obfuscation | Minified/obfuscated code |
| network-chaining | Fetch/request chains |
| dependency-tree | Outdated dependencies |
| suspicious-updates | Version jumps |
| cross-package | Suspicious domains across packages |
| reputation | Downloads/age/maintainer scoring |
| threat-intel | Known malicious packages |
| ast-analysis | eval(), prototype pollution |
| license | License compliance |
| typosquatting | Lookalike package names |
| time-bomb | Date-based malicious conditions |
| environment | Environment variable harvesting |

## 📦 Installation

Download binary
Download from [Releases](https://github.com/jasonscompshop/mcpshield/releases)
