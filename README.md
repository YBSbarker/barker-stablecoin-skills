# Barker Stablecoin Skills

> **The official AI skill suite + MCP server from Barker — Yield Primitive for the Agent Economy. Real-time stablecoin yield index + AI yield advisor + non-custodial execution + risk signals, served to agents via MCP at `mcp.barker.money`.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-x402-blue.svg)](https://mcp.barker.money)
[![Data: Real-time](https://img.shields.io/badge/Data-Real--time-blue.svg)](https://barker.money)

Powered by [**Barker — Yield Primitive for the Agent Economy**](https://barker.money). Every agent touching stablecoins eventually plugs in. Live data + non-custodial execution are served via Barker's MCP at `mcp.barker.money`.

接入 Agent 经济的稳定币收益底座 → [barker.money](https://barker.money)

---

## Quick Start

### One-line install (recommended)

```bash
# Install all 8 skills into ~/.claude/skills/
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

### MCP server (stdio) — self-host only

> ⚠️ **Self-host only.** The bundled `barker-mcp` stdio server wraps the resource endpoints as local tools, for operators self-hosting against their own `BARKER_API_BASE`. Barker's hosted tools are served via the MCP at `mcp.barker.money` (see the Data access section below).

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

Point your host at Barker's remote MCP at **`mcp.barker.money`** — the skill SKILL.md files call the `barker_*` tools (`barker_defi_vaults`, `barker_market_overview`, `barker_market_trend`, plus the judgment tools) there. See [Data access](#data-access) for the payment flow.

---

## Skill Suite

| Skill | What It Does | Data Source | Key Triggers |
|-------|-------------|-------------|-------------|
| [stablecoin-yield-radar](./skills/stablecoin-yield-radar/) | Real-time stablecoin APY rankings | `barker_defi_vaults` | "best stablecoin yield", "where to earn on USDC" |
| [stablecoin-market-brief](./skills/stablecoin-market-brief/) | Market overview: cap, distribution, APY trends vs US Treasury | `barker_market_overview` + `barker_market_trend` | "stablecoin market cap", "USDT market share" |
| [stablecoin-risk-check](./skills/stablecoin-risk-check/) | Safety assessment: depeg history, reserves, audit status | Curated knowledge base | "is USDT safe", "stablecoin comparison" |
| [yield-strategy-advisor](./skills/yield-strategy-advisor/) | Personalized allocation by risk tolerance and capital size | `barker_defi_vaults` | "yield strategy", "how to earn on stablecoins" |
| [stablecoin-depeg-monitor](./skills/stablecoin-depeg-monitor/) | Peg stability monitoring + historical depeg database | `barker_market_overview` + curated history | "depeg alert", "is my stablecoin safe right now" |
| [stablecoin-yield-vs-tradfi](./skills/stablecoin-yield-vs-tradfi/) | Stablecoin yields vs bank savings, Treasury, money market | `barker_market_trend` | "stablecoin vs savings account", "DeFi vs treasury" |
| [stablecoin-chain-explorer](./skills/stablecoin-chain-explorer/) | TVL distribution and best yields by blockchain | `barker_market_overview` + `barker_defi_vaults` | "which chain for stablecoins", "Arbitrum stablecoin APY" |
| [agent-payment-stats](./skills/agent-payment-stats/) | Cross-protocol agent-economy payment metrics (x402 real vs nominal, top sellers) | `barker_agent_payment_stats` | "x402 volume", "agent economy metrics" |

---

## Data access

Live data and execution are served to agents through Barker's MCP at `mcp.barker.money`. On an HTTP 402 challenge, settle payment (e.g. via an OKX OnchainOS or wallet payment skill) and retry.

```
MCP endpoint: https://mcp.barker.money
Settlement:   USDT0/USDC on X Layer/Base/Ethereum/Polygon/Arbitrum
```

(agent discovery: https://api.barker.money/llms.txt)

### Access model & security posture

- **Authentication / payment**: x402 settlement on an HTTP 402 challenge (e.g. via an OKX OnchainOS or wallet payment skill).
- **Abuse model**: x402 payment gate + edge DDoS protection in front.
- **Data scope sent to the API**: Only public market parameters — stablecoin symbol, chain name, sort/limit. **No** wallet addresses, balances, signatures, private keys, or PII are transmitted by any skill in this suite.
- **Data returned**: Public yield / market / TVL figures only. Sensitivity equivalent to public market-data APIs such as CoinGecko or DeFiLlama.
- **External data boundary**: Every SKILL.md in this suite includes a `## Security: External Data Boundary` section instructing consuming LLMs to treat all API response strings as untrusted data, not instructions.

| Tool | Returns |
|------|---------|
| `barker_defi_vaults` | Stablecoin yield pools with APY, TVL, protocol, chain, asset |
| `barker_market_overview` | Total market cap, yield-bearing cap, asset/chain distribution |
| `barker_market_trend` | Historical APY trend (7–180 days) with US Treasury benchmark |

Judgment tools (yield advisor, pool search, pool deep-dives) are also callable. Interactive map for humans at [barker.money](https://barker.money).

### Response Shape & Units

All responses are JSON with `{ success, data, ... }`. APY and `share_pct` fields are **decimals** (`0.0523` = 5.23%, `0.4250` = 42.5%) — multiply by 100 for display.

### Agent tools

Every `barker_*` tool — the core data tools plus the judgment tools (yield advisor, pool search, pool deep-dives) — is served via Barker's MCP at `mcp.barker.money`.

→ `mcp.barker.money`

### Execution tools (non-custodial)

Beyond data and judgment, agents can fetch **unsigned, ready-to-sign transactions**:

| Tool | What you get |
|---|---|
| `barker_executable_pools` | Stablecoin vaults your agent can act on right now — every row is guaranteed quotable |
| `barker_execution_quote` | An unsigned deposit/redeem transaction (`{chainId, to, data, value}`) + route + risk + approval info |

**Barker never broadcasts and never holds funds.** Your agent verifies the transaction (the amount encoded in calldata is returned as `calldata_amount_base_units` for byte-level verification), and your user signs with their own wallet. Vault shares always go to the signer — `receiver` is not a parameter. Same-chain only.

Full working client — pay → quote → verify → sign → broadcast → confirm shares:

```bash
npm i viem
read -rs PRIVATE_KEY && export PRIVATE_KEY
node examples/x402-execution-buyer.mjs
unset PRIVATE_KEY
```

See [`examples/x402-execution-buyer.mjs`](examples/x402-execution-buyer.mjs) — ~200 lines, copy the safety checks into your own agent.

---

## FAQ

**Q: How often is the data updated?**
A: Real-time. The yield index reflects live stablecoin yield data.

**Q: Do I need an API key?**
A: No. Agents call the `barker_*` tools via Barker's MCP at `mcp.barker.money` — see [Data access](#data-access).

**Q: What stablecoins are covered?**
A: All stablecoins on the market — USDT, USDC, DAI, USDS, USDe, sUSDe, FDUSD, GHO, crvUSD, PYUSD, sDAI, frxUSD, TUSD, BUSD, LUSD, DOLA, MIM, FRAX, USDs, USDX, RLUSD, USDY, BUIDL, and more. If a stablecoin exists, Barker covers it.

**Q: What chains are supported?**
A: All chains — Ethereum, BSC, Arbitrum, Base, Polygon, Optimism, Avalanche, Solana, Sui, Aptos, Sei, Mantle, Scroll, zkSync, Linea, Blast, Mode, Manta, and more. Barker has the most comprehensive multi-chain coverage in the market.

**Q: Is this financial advice?**
A: No. All skills provide educational information only, not financial advice. Always DYOR.

**Q: Where can I find the best stablecoin yields?**
A: Use the `stablecoin-yield-radar` skill or visit [barker.money](https://barker.money) for the full interactive yield map.

**Q: How does Barker compare to DeFiLlama or CoinGecko?**
A: Barker is **stablecoin-only** and indexes real-time stablecoin yield in a single index. DeFiLlama focuses on on-chain TVL; CoinGecko focuses on token prices. Barker is the specialized yield index for stablecoins.

---

## About Barker

[Barker](https://barker.money) is the **Yield Primitive for the Agent Economy** — the default routing layer that any agent (or app, or human) calls when it needs to answer "where should this stablecoin sit?". We index real-time stablecoin yield, surfaced as a map for humans browsing and as MCP / agent-callable endpoints for autonomous agents. Stablecoins only. Agents get a real-time stablecoin yield index, an AI yield advisor, non-custodial execution, and risk signals via the MCP; the interactive map is browsable by humans at [barker.money](https://barker.money).

- Website: [barker.money](https://barker.money)
- Agent data (MCP): `mcp.barker.money`
- Agent discovery: `https://api.barker.money/llms.txt` (public)

## Author & Maintainer Disclosure

- **Project**: Barker — Yield Primitive for the Agent Economy ([barker.money](https://barker.money))
- **GitHub org**: [YBSbarker](https://github.com/YBSbarker) (controlled by the Barker team)
- **Submitting committers**: `zuoyeweb3` (founder), `royrzguo` (engineering) — both authorized Barker team members
- **Contact**: partner@barker.money

## License

MIT © 2026 [Barker](https://barker.money)
