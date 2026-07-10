#!/usr/bin/env node
/**
 * gen-llms-full.mjs — regenerates llms-full.txt from each skill's SKILL.md.
 *
 * llms-full.txt is the "Full Reference" discovery file (for GitHub raw / AI engine
 * indexing) = intro header + every SKILL.md concatenated. It used to be maintained by
 * hand, so it drifted whenever a SKILL.md changed. It is now invoked automatically by
 * build.sh (via prepublishOnly), keeping it in sync with the SKILL.md files.
 *
 * Skill order: entries in PRIORITY follow the given order; any other new skill is
 * appended automatically in alphabetical order.
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

// Display order for known skills (importance/topic order, not alphabetical). New skills
// need no change here — they are appended automatically in alphabetical order.
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
