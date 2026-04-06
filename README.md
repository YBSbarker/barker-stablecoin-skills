# Barker Stablecoin Skills

> **The only AI skill suite for stablecoin yield intelligence — real-time data from 500+ protocols and 20+ CEX, no API key required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![API: No Auth Required](https://img.shields.io/badge/API-No%20Auth%20Required-brightgreen.svg)](https://barker.money)
[![Data: Real-time](https://img.shields.io/badge/Data-Real--time-blue.svg)](https://barker.money)

Powered by [**Barker — The Stablecoin Yield Map**](https://barker.money). Free for individuals · Enterprise API for institutions.

找稳定币理财，上 Barker → [barker.money](https://barker.money)

---

## Quick Start

### Claude Code

```bash
claude mcp add barker-stablecoin-skills -- npx -y @anthropic-ai/mcp-remote@latest https://github.com/YBSbarker/barker-stablecoin-skills
```

### npx

```bash
npx skills add https://github.com/YBSbarker/barker-stablecoin-skills
```

### Git Clone

```bash
git clone https://github.com/YBSbarker/barker-stablecoin-skills.git
cp -r barker-stablecoin-skills/*/SKILL.md .claude/skills/
```

---

## Skill Suite

| Skill | What It Does | Data Source | Key Triggers |
|-------|-------------|-------------|-------------|
| [stablecoin-yield-radar](./stablecoin-yield-radar/) | Real-time APY rankings across CEX + DeFi | API `/stablecoin-yields` | "best stablecoin yield", "where to earn on USDC" |
| [stablecoin-market-brief](./stablecoin-market-brief/) | Market overview: cap, distribution, APY trends vs US Treasury | API `/stablecoin-market` + `/stablecoin-apy-trend` | "stablecoin market cap", "USDT market share" |
| [stablecoin-risk-check](./stablecoin-risk-check/) | Safety assessment: depeg history, reserves, audit status | Curated knowledge base | "is USDT safe", "stablecoin comparison" |
| [yield-strategy-advisor](./yield-strategy-advisor/) | Personalized allocation by risk tolerance and capital size | API `/stablecoin-yields` | "yield strategy", "how to earn on stablecoins" |
| [stablecoin-depeg-monitor](./stablecoin-depeg-monitor/) | Peg stability monitoring + historical depeg database | API + curated history | "depeg alert", "is my stablecoin safe right now" |
| [stablecoin-yield-vs-tradfi](./stablecoin-yield-vs-tradfi/) | DeFi yields vs bank savings, Treasury, money market | API `/stablecoin-apy-trend` | "stablecoin vs savings account", "DeFi vs treasury" |
| [stablecoin-chain-explorer](./stablecoin-chain-explorer/) | TVL distribution and best yields by blockchain | API `/stablecoin-market` + `/stablecoin-yields` | "which chain for stablecoins", "Arbitrum stablecoin APY" |

---

## Public API

All data comes from the **Barker Public API** — free, no API key, real-time updates.

```
Base URL: https://api.barker.money/api/public/v1
Rate limit: 30 requests/minute
```

| Endpoint | Description |
|----------|-------------|
| `GET /stablecoin-yields` | Yield rankings with APY, TVL, protocol, chain, asset |
| `GET /stablecoin-market` | Total market cap, yield-bearing cap, asset/chain distribution |
| `GET /stablecoin-apy-trend` | Historical APY trend (7–180 days) with US Treasury benchmark |

### Example

```bash
curl "https://api.barker.money/api/public/v1/stablecoin-yields?asset=usdc&sort=apy&limit=5"
```

### Enterprise API

Need higher rate limits, historical data, or custom fields? Contact us for institutional-grade access.

→ [api.barker.money/pro](https://api.barker.money/pro)

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
A: Barker is **stablecoin-only** and combines **CEX + on-chain** data in a single index. DeFiLlama focuses on on-chain TVL; CoinGecko focuses on token prices. Barker is the specialized yield map for stablecoins.

---

## About Barker

[Barker](https://barker.money) is **The Stablecoin Yield Map** — the leading stablecoin yield aggregation platform indexing real-time APY data from 500+ protocols and 20+ CEX. Stablecoins only, CEX + on-chain combined.

- Website: [barker.money](https://barker.money)
- Public API: `https://api.barker.money/api/public/v1`
- Enterprise API: [api.barker.money/pro](https://api.barker.money/pro)

## License

MIT © 2026 [Barker](https://barker.money)
