markdown
# 🛡️ MCP Shield

Security scanner for MCP servers - detects vulnerabilities, secrets, and malicious code before you add them to Claude.

## Quick Start

```bash
git clone https://github.com/jasonscompshop/mcpshield.git
cd mcpshield
node src/index.js scan express
Usage
bash
node src/index.js scan express
node src/index.js scan @anthropic/mcp-server-sqlite
node src/index.js scan .
node src/index.js --help
Make it a command
bash
echo 'alias mcpshield="node ~/mcpshield/src/index.js"' >> ~/.zshrc
source ~/.zshrc
mcpshield scan express
Example Output
text
🛡️ MCP SHIELD SECURITY REPORT
═══════════════════════════════════════════
📦 express@4.18.1
✅ No security issues detected
📊 SAFETY SCORE: 100/100
✅ STATUS: SAFE
What It Detects
🔑 Hardcoded API keys | 🌐 Suspicious network calls | 📁 Sensitive file access | ⚙️ Dangerous child processes | 📦 Known vulnerabilities | 🕵️ Obfuscated code | 🎭 Typosquatting

Requirements
Node.js 18+

License
MIT

text

That's it. One block. Copy. Paste. Commit.
