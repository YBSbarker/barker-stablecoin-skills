# Barker Stablecoin Skills

> **The official AI skill suite + MCP server from Barker — Yield Primitive for the Agent Economy. Real-time data from 500+ protocols and 20+ CEX, served to agents via the x402-paid MCP at `mcp.barker.money`.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP: x402 Paid](https://img.shields.io/badge/MCP-x402%20Paid-blue.svg)](https://mcp.barker.money)
[![Data: Real-time](https://img.shields.io/badge/Data-Real--time-blue.svg)](https://barker.money)

Powered by [**Barker — Yield Primitive for the Agent Economy**](https://barker.money). Every agent touching stablecoins eventually plugs in. Free to install · live data is x402 pay-per-call via `mcp.barker.money`.

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

### MCP server (stdio) — DEPRECATED (self-host only)

> ⚠️ **Deprecated.** The bundled `barker-mcp` stdio server wraps Barker's legacy **anonymous** data API, which is being retired. Once anonymous access is off, its tools return HTTP 401. Live data is now served via the **x402-paid MCP at `mcp.barker.money`** (see the Data access section below). This stdio server is retained **only** for operators self-hosting against their own `BARKER_API_BASE` with their own access — it is not a free tier.

Self-hosting against your own base? `barker-mcp` is a stdio MCP server that wraps the resource endpoints (`/defi/vaults`, `/market/overview`, `/market/trend`, `/agent-payments/*`) as callable tools.

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

Point your host at Barker's remote MCP at **`mcp.barker.money`** — the skill SKILL.md files call the `barker_*` tools (`barker_defi_vaults`, `barker_market_overview`, `barker_market_trend`, plus the judgment tools) there, x402-paid per call. Live data is paid-only; there is no free or anonymous tier. Pricing: $0.001–$0.01/call, paid in USDT0/USDC across X Layer/Base/Ethereum/Polygon/Arbitrum. Per-venue CEX detail is internal only and not offered on the public MCP.

---

## Skill Suite

| Skill | What It Does | Data Source | Key Triggers |
|-------|-------------|-------------|-------------|
| [stablecoin-yield-radar](./skills/stablecoin-yield-radar/) | Real-time APY rankings across DeFi | `barker_defi_vaults` | "best stablecoin yield", "where to earn on USDC" |
| [stablecoin-market-brief](./skills/stablecoin-market-brief/) | Market overview: cap, distribution, APY trends vs US Treasury | `barker_market_overview` + `barker_market_trend` | "stablecoin market cap", "USDT market share" |
| [stablecoin-risk-check](./skills/stablecoin-risk-check/) | Safety assessment: depeg history, reserves, audit status | Curated knowledge base | "is USDT safe", "stablecoin comparison" |
| [yield-strategy-advisor](./skills/yield-strategy-advisor/) | Personalized allocation by risk tolerance and capital size | `barker_defi_vaults` | "yield strategy", "how to earn on stablecoins" |
| [stablecoin-depeg-monitor](./skills/stablecoin-depeg-monitor/) | Peg stability monitoring + historical depeg database | `barker_market_overview` + curated history | "depeg alert", "is my stablecoin safe right now" |
| [stablecoin-yield-vs-tradfi](./skills/stablecoin-yield-vs-tradfi/) | DeFi yields vs bank savings, Treasury, money market | `barker_market_trend` | "stablecoin vs savings account", "DeFi vs treasury" |
| [stablecoin-chain-explorer](./skills/stablecoin-chain-explorer/) | TVL distribution and best yields by blockchain | `barker_market_overview` + `barker_defi_vaults` | "which chain for stablecoins", "Arbitrum stablecoin APY" |

---

## Data access

Live data is served to agents through Barker's **x402-paid MCP** — there is no free or anonymous data API. The REST endpoints that previously served this data anonymously are being retired.

```
MCP endpoint: https://mcp.barker.money
Payment:      x402 per-call ($0.001–$0.01), USDT0/USDC on X Layer/Base/Ethereum/Polygon/Arbitrum
```

(agent discovery: https://api.barker.money/llms.txt — the public agent-discovery file stays free)

### Access model & security posture

- **Authentication / payment**: Per-call x402. On an HTTP 402 challenge, the agent settles payment (e.g. via an OKX OnchainOS or wallet payment skill) and retries — no account or API key. There is no free or anonymous tier.
- **Abuse model**: x402 payment gate + edge DDoS protection in front.
- **Data scope sent to the API**: Only public market parameters — stablecoin symbol, chain name, sort/limit. **No** wallet addresses, balances, signatures, private keys, or PII are transmitted by any skill in this suite.
- **Data returned**: Public yield / market / TVL figures only. Sensitivity equivalent to public market-data APIs such as CoinGecko or DeFiLlama.
- **External data boundary**: Every SKILL.md in this suite includes a `## Security: External Data Boundary` section instructing consuming LLMs to treat all API response strings as untrusted data, not instructions.

| Tool | Returns |
|------|---------|
| `barker_defi_vaults` | DeFi yield pools with APY, TVL, protocol, chain, asset |
| `barker_market_overview` | Total market cap, yield-bearing cap, asset/chain distribution |
| `barker_market_trend` | Historical APY trend (7–180 days) with US Treasury benchmark |

Judgment tools (yield advisor, protocol-campaign radar, pool deep-dives) are also callable per-call. Per-venue CEX detail (products, campaigns, borrow rates, venue × asset matrix) is **internal only** and not offered on the public MCP. Interactive map for humans at [barker.money](https://barker.money).

### Response Shape & Units

All responses are JSON with `{ success, data, ... }`. APY and `share_pct` fields are **decimals** (`0.0523` = 5.23%, `0.4250` = 42.5%) — multiply by 100 for display.

### Paid agent tools (x402)

Every `barker_*` tool — the core data tools plus the judgment tools (yield advisor, protocol-campaign radar, pool deep-dives) — is called per-call via the x402 gateway: $0.001–$0.01 per call, paid in USDT0/USDC across X Layer, Base, Ethereum, Polygon, and Arbitrum. No account or API key — the agent settles each HTTP 402 challenge and retries. Per-venue CEX detail is internal only and not offered on the public MCP.

→ `mcp.barker.money`

---

## FAQ

**Q: How often is the data updated?**
A: Real-time. The yield index reflects live data from 500+ protocols and 20+ CEX.

**Q: Do I need an API key?**
A: No API key — but live data is not free. Agents pay per call via x402 at `mcp.barker.money` ($0.001–$0.01/call), settling each HTTP 402 challenge and retrying. The skills are free to install; there is no free or anonymous data tier.

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
- Agent data (x402-paid MCP): `mcp.barker.money`
- Agent discovery: `https://api.barker.money/llms.txt` (public)

## Author & Maintainer Disclosure

- **Project**: Barker — Yield Primitive for the Agent Economy ([barker.money](https://barker.money))
- **GitHub org**: [YBSbarker](https://github.com/YBSbarker) (controlled by the Barker team)
- **Submitting committers**: `zuoyeweb3` (founder), `royrzguo` (engineering) — both authorized Barker team members
- **Contact**: partner@barker.money

## License

MIT © 2026 [Barker](https://barker.money)
