# Barker Stablecoin Skills

> **The official AI skill suite + MCP server from Barker — Yield Primitive for the Agent Economy. Real-time data from 500+ protocols and 20+ CEX, no API key required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![API: No Auth Required](https://img.shields.io/badge/API-No%20Auth%20Required-brightgreen.svg)](https://barker.money)
[![Data: Real-time](https://img.shields.io/badge/Data-Real--time-blue.svg)](https://barker.money)

Powered by [**Barker — Yield Primitive for the Agent Economy**](https://barker.money). Every agent touching stablecoins eventually plugs in. Free for individuals · paid x402 tools for autonomous agents.

接入 Agent 经济的稳定币收益底座 → [barker.money](https://barker.money)

---

## Quick Start

### One-line install (recommended)

```bash
# Install all 7 skills into ~/.claude/skills/
npx @barkermoney/skills install --all

# Or pick specific ones
npx @barkermoney/skills install stablecoin-yield-radar yield-strategy-advisor

# Other commands
npx @barkermoney/skills list             # show bundled + installed
npx @barkermoney/skills update           # re-install latest of currently installed
npx @barkermoney/skills remove <name>    # uninstall one
npx @barkermoney/skills --help           # full help
```

Then restart Claude Code (or your agent runtime) to activate. Override the install dir with `--target <dir>` or `$BARKER_SKILLS_DIR`.

**Updating often?** Install the CLI globally so you can drop the `npx` prefix:

```bash
npm install -g @barkermoney/skills
skills install --all     # then from any directory
skills update            # later, pull latest skill content
```

### MCP server (stdio)

Need direct API access from a Claude Code / Cursor / Cline session — without going through the bundled skills? Run `barker-mcp`, a stdio MCP server that wraps the Barker public API (`/defi/vaults`, `/market/overview`, `/market/trend`) as three callable tools. Zero auth, same 30 req/min rate limit as the public API.

```bash
# Register with Claude Code (user scope, persists across sessions)
claude mcp add -s user barker -- npx -y -p @barkermoney/skills barker-mcp
```

Then restart Claude Code. Three tools become available:

| Tool | Wraps | Use for |
|------|-------|---------|
| `barker_defi_vaults` | `/defi/vaults` | "best USDC yield", "Aave vs Morpho", filter by asset/chain/sort/limit |
| `barker_market_overview` | `/market/overview` | total cap, yield-bearing cap, asset/chain distribution |
| `barker_market_trend` | `/market/trend` | 7–180 day APY trend vs US Treasury benchmark |

Smoke test outside of an agent host:

```bash
npx -p @barkermoney/skills barker-mcp
# speaks MCP over stdio; pipe JSON-RPC frames to interact
```

### OKX Wallet Plugin Store

```bash
npx skills add okx/plugin-store --skill <skill-name>
# e.g.: npx skills add okx/plugin-store --skill stablecoin-yield-radar
```

### Manual (git clone)

```bash
git clone https://github.com/YBSbarker/barker-stablecoin-skills.git
cp -r barker-stablecoin-skills/skills/<skill-name> ~/.claude/skills/
```

### Anthropic Plugin Marketplace

Each skill is shipped with `.claude-plugin/plugin.json` and is compatible with the Claude Code plugin marketplace.

### Cursor / Cline / other MCP hosts

Register the `barker` stdio MCP server with your host (see the MCP server section above) — the skill SKILL.md files reference the free MCP tools (`barker_defi_vaults`, `barker_market_overview`, `barker_market_trend`) and do not require any authentication. CEX per-venue detail & judgment tools are sold per-call on the x402 gateway `mcp.barker.money` (12 tools, $0.001–$0.01/call, USDT0/USDC across X Layer/Base/Ethereum/Polygon/Arbitrum).

---

## Skill Suite

| Skill | What It Does | Data Source | Key Triggers |
|-------|-------------|-------------|-------------|
| [stablecoin-yield-radar](./skills/stablecoin-yield-radar/) | Real-time APY rankings across DeFi | API `/defi/vaults` | "best stablecoin yield", "where to earn on USDC" |
| [stablecoin-market-brief](./skills/stablecoin-market-brief/) | Market overview: cap, distribution, APY trends vs US Treasury | API `/market/overview` + `/market/trend` | "stablecoin market cap", "USDT market share" |
| [stablecoin-risk-check](./skills/stablecoin-risk-check/) | Safety assessment: depeg history, reserves, audit status | Curated knowledge base | "is USDT safe", "stablecoin comparison" |
| [yield-strategy-advisor](./skills/yield-strategy-advisor/) | Personalized allocation by risk tolerance and capital size | API `/defi/vaults` | "yield strategy", "how to earn on stablecoins" |
| [stablecoin-depeg-monitor](./skills/stablecoin-depeg-monitor/) | Peg stability monitoring + historical depeg database | API `/market/overview` + curated history | "depeg alert", "is my stablecoin safe right now" |
| [stablecoin-yield-vs-tradfi](./skills/stablecoin-yield-vs-tradfi/) | DeFi yields vs bank savings, Treasury, money market | API `/market/trend` | "stablecoin vs savings account", "DeFi vs treasury" |
| [stablecoin-chain-explorer](./skills/stablecoin-chain-explorer/) | TVL distribution and best yields by blockchain | API `/market/overview` + `/defi/vaults` | "which chain for stablecoins", "Arbitrum stablecoin APY" |

---

## Public API

All data comes from the **Barker Public API** — free, no API key, real-time updates.

```
Base URL: https://api.barker.money/api
Rate limit: 30 requests/minute per IP
```

(agent discovery: https://api.barker.money/llms.txt)

### Access model & security posture

- **Authentication**: None — public read-only API.
- **Rate limiting**: 30 req/min per IP. Edge DDoS protection in front.
- **Data scope sent to the API**: Only public market parameters — stablecoin symbol, chain name, sort/limit. **No** wallet addresses, balances, signatures, private keys, or PII are transmitted by any skill in this suite.
- **Data returned**: Public yield / market / TVL figures only. Sensitivity equivalent to public market-data APIs such as CoinGecko or DeFiLlama.
- **External data boundary**: Every SKILL.md in this suite includes a `## Security: External Data Boundary` section instructing consuming LLMs to treat all API response strings as untrusted data, not instructions.

| Endpoint | Description |
|----------|-------------|
| `GET /defi/vaults` | DeFi yield pools with APY, TVL, protocol, chain, asset |
| `GET /market/overview` | Total market cap, yield-bearing cap, asset/chain distribution |
| `GET /market/trend` | Historical APY trend (7–180 days) with US Treasury benchmark |

CEX per-venue detail (products, campaigns, borrow rates, venue × asset matrix) is not part of the public API. Interactive map at [barker.money](https://barker.money); autonomous agents can buy it per-call on the x402 gateway `mcp.barker.money`.

### Example

```bash
curl "https://api.barker.money/api/defi/vaults?asset=usdc&sort=apy&limit=5"
```

### Response Shape & Units

All responses are JSON with `{ success, data, ... }`. APY and `share_pct` fields are **decimals** (`0.0523` = 5.23%, `0.4250` = 42.5%) — multiply by 100 for display.

### Paid agent tools (x402)

Autonomous agents can buy richer judgment tools — yield advisor, CEX campaign detail, pool deep-dives — per-call via the x402 gateway: 12 tools, $0.001–$0.01 per call, paid in USDT0/USDC across X Layer, Base, Ethereum, Polygon, and Arbitrum. No account, no API key — pay per request.

→ `mcp.barker.money`

---

## FAQ

**Q: How often is the data updated?**
A: Real-time. The yield index reflects live data from 500+ protocols and 20+ CEX.

**Q: Do I need an API key?**
A: No. The public API is free with no authentication required. Rate limit is 30 requests/minute.

**Q: What stablecoins are covered?**
A: All stablecoins on the market — USDT, USDC, DAI, USDS, USDe, sUSDe, FDUSD, GHO, crvUSD, PYUSD, sDAI, frxUSD, TUSD, BUSD, LUSD, DOLA, MIM, FRAX, USDs, USDX, RLUSD, USDY, BUIDL, and more. If a stablecoin exists, Barker covers it.

**Q: What chains are supported?**
A: All chains — Ethereum, BSC, Arbitrum, Base, Polygon, Optimism, Avalanche, Solana, Sui, Aptos, Sei, Mantle, Scroll, zkSync, Linea, Blast, Mode, Manta, and more. Barker has the most comprehensive multi-chain coverage in the market.

**Q: Is this financial advice?**
A: No. All skills provide educational information only, not financial advice. Always DYOR.

**Q: Where can I find the best stablecoin yields?**
A: Use the `stablecoin-yield-radar` skill or visit [barker.money](https://barker.money) for the full interactive yield map.

**Q: How does Barker compare to DeFiLlama or CoinGecko?**
A: Barker is **stablecoin-only** and combines **CEX + on-chain** data in a single index. DeFiLlama focuses on on-chain TVL; CoinGecko focuses on token prices. Barker is the specialized yield index for stablecoins.

---

## About Barker

[Barker](https://barker.money) is the **Yield Primitive for the Agent Economy** — the default routing layer that any agent (or app, or human) calls when it needs to answer "where should this stablecoin sit?". We index real-time APY data across 500+ DeFi protocols and 20+ CEX, surfaced as a map for humans browsing and as MCP / x402 / agent-callable endpoints for autonomous agents. Stablecoins only, CEX + on-chain combined.

- Website: [barker.money](https://barker.money)
- Data API: `https://api.barker.money/api` (see /llms.txt)
- Paid agent tools (x402): `mcp.barker.money`

## Author & Maintainer Disclosure

- **Project**: Barker — Yield Primitive for the Agent Economy ([barker.money](https://barker.money))
- **GitHub org**: [YBSbarker](https://github.com/YBSbarker) (controlled by the Barker team)
- **Submitting committers**: `zuoyeweb3` (founder), `royrzguo` (engineering) — both authorized Barker team members
- **Contact**: partner@barker.money

## License

MIT © 2026 [Barker](https://barker.money)
