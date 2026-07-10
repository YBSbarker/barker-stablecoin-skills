// Barker execution buyer — reference client for the paid execution tools on
// https://mcp.barker.money — settles via x402 (HTTP 402 challenge).
//
// What it does, end to end:
//   1. Pays $0.01  → barker_executable_pools   (discover pools your agent can act on)
//   2. Pays $0.05  → barker_execution_quote    (buy an unsigned, ready-to-sign transaction)
//   3. Verifies the quote locally (see SAFETY below), then signs & broadcasts
//      with YOUR OWN key: ERC-20 approve (exact amount) + vault deposit on Base.
//   4. Confirms vault shares arrived in your wallet.
//
// Barker never broadcasts and never holds funds. You buy a transaction; you sign it.
// Vault shares always go to the signer address — `receiver` is not a parameter.
//
// SAFETY CHECKS THIS CLIENT PERFORMS (copy these into your own agent):
//   - what-you-see-is-what-you-sign: the amount encoded in calldata must equal
//     the amount you asked for (`calldata_amount_base_units`, self adapter)
//   - signer echo: the quote's signer must equal your local wallet
//   - exact approval only: approve the deposit amount, never unlimited
//
// Requirements:
//   node >= 20, `npm i viem`
//   A wallet holding:
//     - USDT0 on X Layer (eip155:196)  ≥ $0.07   — pays the two x402 calls
//     - USDC  on Base    (eip155:8453) ≥ deposit amount (default 1 USDC)
//     - ETH   on Base                  ≈ $0.05   — gas for approve + deposit
//
// Run:
//   read -rs PRIVATE_KEY && export PRIVATE_KEY     # paste 0x-prefixed key, no echo
//   node examples/x402-execution-buyer.mjs
//   unset PRIVATE_KEY
//
// Optional env: POOL_UID (default a Base Morpho USDC vault), AMOUNT_BASE_UNITS
// (default 1000000 = 1 USDC), MCP_BASE_URL, PAY_NETWORK (default eip155:196).

import { createWalletClient, createPublicClient, http, defineChain, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import crypto from "node:crypto";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY?.startsWith("0x")) {
  console.error("Set PRIVATE_KEY (0x-prefixed). Tip: read -rs PRIVATE_KEY && export PRIVATE_KEY");
  process.exit(1);
}

// NOTE: bare host on purpose — this client hits the per-tool x402 REST surface
// (`GET /<tool_name>`), NOT the MCP protocol endpoint (`POST /mcp`). Do not append /mcp.
const MCP = process.env.MCP_BASE_URL ?? "https://mcp.barker.money";
const PAY_NETWORK = process.env.PAY_NETWORK ?? "eip155:196"; // X Layer USDT0 via OKX facilitator
const POOL_UID = process.env.POOL_UID ?? "morpho-vault_base_usdc_0xbeefa7b8";
const AMOUNT = BigInt(process.env.AMOUNT_BASE_UNITS ?? "1000000"); // 1 USDC

const xlayer = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
});
const payChain = PAY_NETWORK === "eip155:196" ? xlayer : base;

const account = privateKeyToAccount(PRIVATE_KEY);
const payClient = createWalletClient({ account, chain: payChain, transport: http() });
const baseWallet = createWalletClient({ account, chain: base, transport: http() });
const basePublic = createPublicClient({ chain: base, transport: http() });

const ERC20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
]);

/** x402 GET: probe 402 → sign EIP-3009 → retry with PAYMENT-SIGNATURE. */
async function paidGet(tool, params) {
  const url = `${MCP}/${tool}?${new URLSearchParams(params)}`;
  const probe = await fetch(url);
  if (probe.status !== 402) throw new Error(`${tool}: expected 402, got ${probe.status}`);
  const pr = JSON.parse(Buffer.from(probe.headers.get("payment-required"), "base64").toString());

  const accept = pr.accepts.find((a) => a.scheme === "exact" && a.network === PAY_NETWORK);
  if (!accept?.extra?.name) throw new Error(`${tool}: no exact/${PAY_NETWORK} accept entry`);

  const value = BigInt(accept.maxAmountRequired ?? accept.amount ?? "0");
  const validBefore = Math.floor(Date.now() / 1000) + (accept.maxTimeoutSeconds ?? 300);
  const nonce = "0x" + crypto.randomBytes(32).toString("hex");
  const signature = await payClient.signTypedData({
    domain: {
      name: accept.extra.name,
      version: accept.extra.version,
      chainId: payChain.id,
      verifyingContract: accept.asset,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: { from: account.address, to: accept.payTo, value, validAfter: 0n, validBefore: BigInt(validBefore), nonce },
  });

  const header = Buffer.from(JSON.stringify({
    x402Version: pr.x402Version,
    accepted: accept, // echo the server's entry verbatim — deep-equal matched server-side
    payload: {
      signature,
      authorization: {
        from: account.address, to: accept.payTo, value: value.toString(),
        validAfter: "0", validBefore: String(validBefore), nonce,
      },
    },
  })).toString("base64");

  const res = await fetch(url, { headers: { "PAYMENT-SIGNATURE": header } });
  const body = await res.text();
  if (res.status !== 200) throw new Error(`${tool}: paid call got ${res.status} — ${body.slice(0, 200)}`);
  return JSON.parse(body);
}

console.log(`buyer/signer: ${account.address}`);
console.log(`paying on ${PAY_NETWORK} → ${MCP}\n`);

// 1) Discover — every row returned here is guaranteed quotable.
console.log("① barker_executable_pools ($0.01)");
const pools = await paidGet("barker_executable_pools", { asset: "usdc", chain: "base", action: "deposit", limit: "20" });
const row = pools.data.find((r) => r.pool_uid === POOL_UID);
if (!row) throw new Error(`${POOL_UID} not in the quotable list — pick one of: ${pools.data.slice(0, 5).map((r) => r.pool_uid).join(", ")}`);
console.log(`   ✓ target pool listed (adapters=${JSON.stringify(row.adapters)}, is_full=${row.is_full})\n`);

// 2) Buy the unsigned transaction. adapter=self → decodable ERC4626 calldata.
console.log("② barker_execution_quote ($0.05)");
const { quote } = await paidGet("barker_execution_quote", {
  pool_uid: POOL_UID, action: "deposit", adapter: "self",
  amount_base_units: AMOUNT.toString(), signer_address: account.address,
});
const tx = quote.transaction_request;
if (!tx?.to || !tx?.data) throw new Error("quote missing transaction_request");
console.log(`   ✓ adapter=${quote.adapter}, to=${tx.to}, calldata ${tx.data.length} chars`);

// 3) Verify before signing — never skip these two checks.
if (quote.adapter === "self" && quote.calldata_amount_base_units !== AMOUNT.toString()) {
  throw new Error(`calldata encodes ${quote.calldata_amount_base_units}, you asked ${AMOUNT} — refuse to sign`);
}
if (quote.signer?.address?.toLowerCase() !== account.address.toLowerCase()) {
  throw new Error("quote signer != local wallet — refuse to sign");
}
console.log("   ✓ what-you-see-is-what-you-sign checks passed\n");

// 4) Preflight balances on Base.
const [usdc, eth, sharesBefore] = await Promise.all([
  basePublic.readContract({ address: quote.from_token_address, abi: ERC20, functionName: "balanceOf", args: [account.address] }),
  basePublic.getBalance({ address: account.address }),
  basePublic.readContract({ address: quote.to_token_address, abi: ERC20, functionName: "balanceOf", args: [account.address] }),
]);
console.log(`③ preflight: USDC=${Number(usdc) / 1e6}, ETH=${Number(eth) / 1e18}`);
if (usdc < AMOUNT) throw new Error(`insufficient USDC on Base: need ${Number(AMOUNT) / 1e6}, have ${Number(usdc) / 1e6}`);
if (eth < 50_000_000_000_000n) throw new Error("insufficient ETH for gas on Base");

// 5) Exact approve (never unlimited) + broadcast the purchased transaction.
if (quote.approval_required) {
  const allowance = await basePublic.readContract({
    address: quote.from_token_address, abi: ERC20, functionName: "allowance",
    args: [account.address, quote.approval_spender],
  });
  if (allowance < AMOUNT) {
    console.log(`④ approve exact ${Number(AMOUNT) / 1e6} USDC → ${quote.approval_spender}`);
    const approveTx = await baseWallet.writeContract({
      address: quote.from_token_address, abi: ERC20, functionName: "approve",
      args: [quote.approval_spender, AMOUNT],
    });
    const rc = await basePublic.waitForTransactionReceipt({ hash: approveTx });
    console.log(`   ✓ approve ${rc.status}: https://basescan.org/tx/${approveTx}`);
  }
}

console.log("⑤ broadcasting deposit");
const depositTx = await baseWallet.sendTransaction({ to: tx.to, data: tx.data, value: BigInt(tx.value ?? 0) });
const receipt = await basePublic.waitForTransactionReceipt({ hash: depositTx });
console.log(`   ✓ deposit ${receipt.status}: https://basescan.org/tx/${depositTx}`);

// 6) Confirm shares arrived (retry: public RPC replicas can lag the receipt).
let sharesAfter = sharesBefore;
for (let i = 0; i < 6 && sharesAfter <= sharesBefore; i++) {
  sharesAfter = await basePublic.readContract({
    address: quote.to_token_address, abi: ERC20, functionName: "balanceOf", args: [account.address],
  });
  if (sharesAfter <= sharesBefore) await new Promise((r) => setTimeout(r, 3000));
}
if (sharesAfter <= sharesBefore) throw new Error("no share increase — inspect the deposit tx");
console.log(`\n✓ done: +${sharesAfter - sharesBefore} vault shares. Question → decision → capital deployed, in three calls.`);
