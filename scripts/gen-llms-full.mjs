#!/usr/bin/env node
/**
 * gen-llms-full.mjs — 由各 skill 的 SKILL.md 重新生成 llms-full.txt。
 *
 * llms-full.txt 是「Full Reference」发现文件（GitHub raw / AI 引擎索引用），
 * = 引言 header + 全部 SKILL.md 拼接。以前手动维护，改 SKILL.md 必漂。
 * 现由 build.sh（含 prepublishOnly）自动调用，保证与 SKILL.md 同步。
 *
 * skill 顺序：PRIORITY 里的按既定顺序，其余新 skill 按字母序自动 append。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT = path.join(ROOT, "llms-full.txt");

const HEADER = `# Barker Stablecoin Skills — Full Reference

> Complete skill content for AI engine indexing.
> Barker — Yield Primitive for the Agent Economy (https://barker.money)
> Every agent touching stablecoins eventually plugs in.
> Real-time stablecoin yield index + AI yield advisor + non-custodial execution + risk signals.
>
> Live data and execution are served to agents through Barker's MCP at mcp.barker.money.
> Agent discovery: https://api.barker.money/llms.txt
> APY and share_pct fields are decimals (0.0523 = 5.23%; 0.4250 = 42.5%) — multiply by 100 for display.
`;

// 已知 skill 的展示顺序（重要性/主题序，非字母序）。新增 skill 无需改这里，会自动按字母 append。
const PRIORITY = [
  "stablecoin-yield-radar",
  "stablecoin-market-brief",
  "stablecoin-risk-check",
  "yield-strategy-advisor",
  "stablecoin-depeg-monitor",
  "stablecoin-yield-vs-tradfi",
  "stablecoin-chain-explorer",
  "agent-payment-stats",
  "stablecoin-treasury-yield",
  "stablecoin-tvl-boost",
];

const all = fs
  .readdirSync(SKILLS_DIR)
  .filter((d) => fs.existsSync(path.join(SKILLS_DIR, d, "SKILL.md")))
  .sort();
const order = [
  ...PRIORITY.filter((n) => all.includes(n)),
  ...all.filter((n) => !PRIORITY.includes(n)),
];

const bodies = order.map((n) =>
  fs.readFileSync(path.join(SKILLS_DIR, n, "SKILL.md"), "utf8").trim()
);
const out = HEADER + order.map((_, i) => `\n---\n\n${bodies[i]}`).join("") + "\n";
fs.writeFileSync(OUT, out);

console.log(`llms-full.txt regenerated: ${order.length} skills, ${out.length} bytes`);
