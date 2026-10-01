## 0. What it is

A purchase from the issuer at a fixed price, not a trade. There is no counterparty, no order, no escrow and no partial fill. One operation does everything or nothing: the contract checks the launch, the sale option, the buyer's KYC tier and the caps; pulls wUSDT from the buyer to the fee and asset treasuries; and, on an `AUTO` launch, delivers the RWA token in the same operation - minted to the buyer (`MINT`) or transferred from the launch treasury (`TRANSFER`).

Two ways in, one code path in the contract:

- **`purchase`** - the buyer's wallet sends the operation and pays the gas in MAV. Works today.
- **`permitAndExecute`** with a `permitPurchase` action - the buyer signs a permit; a relayer sends it and pays the gas. The contract runs the same purchase with the **signer** as the purchaser. Blocked on the backend relay (§6.5).

**Rollout state (2026-09-30).**

- **Contract.** Basenet has the new launchpad `KT1U6KXwy8vduoq86HBjGp9m2Czc8rZM85MN` since 2026-09-28. It carries three `ACTIVE` launches. Each has a single sale option `Starter`, gated to KYC tier `Starter`, with `enableKyc = true`. Each is priced in wUSDT `KT1Pn5Z…` under the payment key `"USDT"`, with a 1% fee, `AUTO` distribution and a one-year window. Direct purchases have been made on all three.
- **Permits.** No permit has ever executed on this launchpad: `permitsCounterLedger` is empty.
- **Backend.** The test API serves the three launch cards. The Gas Station relay has no launchpad support, and its permit parser predates the `deadline` field (§6.5).
- **Mainnet.** Mainnet addresses come with the mainnet deployment; nothing below is mainnet.

## 1. Contracts (basenet)

| Role                                   | Address                                |
| -------------------------------------- | -------------------------------------- |
| Launchpad                              | `KT1U6KXwy8vduoq86HBjGp9m2Czc8rZM85MN` |
| Membership KYC                         | `KT1U6z4YZPswGHcw7xAJsGZn4Wb7CZUKN1HL` |
| Payment token (wUSDT, FA2, id 0, 6 dp) | `KT1Pn5Zpx1bJx5H51btk92pfwvUMCKtp2Q2v` |

| Launch name (`launchLedger` key) | Token                                       | Issuance   | `Starter` price, raw wUSDT per whole token |
| -------------------------------- | ------------------------------------------- | ---------- | ------------------------------------------ |
| `XAUG-issuance-v3`               | XAUG `KT1NbgrAUjxgvm4b72VEYPp7r8KXTLgXNjjP` | `TRANSFER` | `138000000` (138.00)                       |
| `ANTH-issuance-v1`               | ANTH `KT1HR56nVuVDnidsabd2TBB9YvAtKbCbHKpP` | `MINT`     | `725000000` (725.00)                       |
| `KRKN-issuance-v1`               | KRKN `KT19PyrK3NKTiAfjxPJwhswgzkiMeQuawkFc` | `MINT`     | `30000000` (30.00)                         |

The launchpad and KYC addresses are per-environment config: the API does not serve them yet. Launch names, options, tiers, prices and the payment currency are **data**. Read them; the second table is for testing, not for constants.

## 2. Reading a launch

### For rendering: the launch card

```
GET /api/v1/assets/{token_address}/launch        public; fresh 10 s (45 s when empty), stale up to 5 min
```

`{ address, launches: [LaunchCard] }`, snake_case, newest first, active first. The response has no launch → `launches: []`. An asset outside the allowlist → `404`. Use the card for the asset page and the progress bar:

- `name` is the `launchLedger` key - the `launchName` the contract wants.
- `status` is one of `active|inactive|paused|closed`; `active` means purchasable now at launch level.
- Also: `sale_start`, `sale_end`, `total_bought`, `max_amount_cap`, `progress_percent`, and `sale_options[]` with `tiers[]` and `payments[]`.

The asset list already carries `has_active_launch`, `launch_status` and `market_type` for the "Buy" badge. For live progress, subscribe to the notifier channel `launch:<launchpad_address>/<launch_name>` (`LAUNCHPAD_LAUNCH_UPDATED`, `notifier-websocket-integration` §3.2).

The card is **not** enough to buy:

- `payments[].price` is a float in human units (`138`). It is display only; never derive the amount to pay from it.
- `purchase_fee_percent: "100"` is basis points (1%), despite the name.
- Missing: the launchpad address, `enable_kyc`, the raw price, the payment token's `token_id`, and anything per user.

### For buying: the chain, at the confirm step

Read the launch record from the contract when the user opens the purchase form, and again right before signing. The contract checks live values, and an admin can change a price or pause an option on an active launch.

```tsx
const lp = await Mavryk.contract.at(LAUNCHPAD);
const lpStorage: any = await lp.storage();
const launch = await lpStorage.launchLedger.get(launchName); // undefined → no such launch
const option = launch.saleOptions.get(saleOptionName); // MichelsonMap
const pay = option.payments.get("USDT"); // { price, currency: { fa2: { tokenContractAddress, tokenId } } }
```

Launch fields that matter:

- `status`, which is authoritative: `INACTIVE | ACTIVE | PAUSED | CLOSED`.
- `saleStart` and `saleEnd`; `saleEnd` is `null` for no scheduled end.
- `maxAmountCap` and `totalBought`.
- `purchaseFeePercent` (bps) and `enableKyc`.
- `tokenIssuanceType` and `tokenDistributionType`.

Option fields that matter:

- `isPaused`.
- `saleStart` and `saleEnd` (`null` = bounded by the launch).
- `maxAmountCap` (`null` = none) and `totalBought`.
- `allowedMembershipTiers`, a map `tier → { minPurchaseAmount, maxAmountPerWalletTotal }`.
- `payments`, a map `paymentName → { price, currency }`.

`currency` is `{ fa2: {…} }`, `{ fa12: address }` or `{ mav: … }`; every launch today is `fa2`. The same data is in the indexer (`/v1/contracts/{launchpad}/bigmaps/launchLedger/keys/{name}`) one block later.

### Purchasable now

In the order the contract checks it. The first failure is the error the user would get (§8):

1. `launch.status === "ACTIVE"`: ignore `isPaused`, it only mirrors `PAUSED`.
2. `now >= launch.saleStart`, and `launch.saleEnd` is null or `now < saleEnd`.
3. The option exists and `!option.isPaused`.
4. `option.saleStart` is null or `now >= saleStart`, and `option.saleEnd` is null or `now < saleEnd`.
5. The buyer's tier (§3) is a key of `option.allowedMembershipTiers`.
6. The payment key exists in `option.payments`.

The card's `active` covers 1–2 only.

### How much the user can buy

```
max = min( launch.maxAmountCap − launch.totalBought,
           option.maxAmountCap − option.totalBought            (if set),
           tier.maxAmountPerWalletTotal − purchased[option]    (if set) )
min = tier.minPurchaseAmount ?? 1 raw        (equal to the minimum is accepted)
```

`purchased[option]` comes from the buyer's purchase record (§7). The per-wallet limit is **per sale option**, not per launch.

## 3. Who may buy: KYC and tier

What the contract does, per purchase:

- **Verified** means the wallet has a KYC record that is not frozen, not expired and not blacklisted. With `enableKyc = true` an unverified buyer is refused (`ERROR_KYC_REQUIRED_FOR_LAUNCH`). With `false` the buyer is let through as tier `"none"`.
- **Tier** is registrar-scoped. The contract takes the registrar from the buyer's KYC record, then the tier from `memberLedger[(registrar, wallet)]`. Verified without a tier, or unverified, means `"none"`.
- **Discount** is `purchaseFeeDiscount` in bps from `membershipTierDiscountLedger[(registrar, tier)]`. `"none"` gets 0. A real tier with no entry fails the purchase (`ERROR_MEMBERSHIP_TIER_DISCOUNT_NOT_FOUND`), which is a configuration error, not the user's.

The API serves only a boolean: `is_kyc_approved` on `GET /wallets/{w}`, cached 5 min and retired on KYC events. It matches "verified" except for the blacklist. The tier and the discount come from the chain:

```tsx
const kyc: any = await(await Mavryk.contract.at(MEMBERSHIP_KYC)).storage();
const rec = await kyc.memberKycLedger.get(wallet); // { kycRegistrar, expireAt, frozen, … } | undefined
const verified = !!rec && !rec.frozen && Date.parse(rec.expireAt) > Date.now();
const tier = verified
  ? ((await kyc.memberLedger.get({ 0: rec.kycRegistrar, 1: wallet })) ?? "none")
  : "none";
const discounts =
  tier === "none"
    ? undefined
    : await kyc.membershipTierDiscountLedger.get({
        0: rec.kycRegistrar,
        1: tier,
      });
const discountBps =
  tier === "none"
    ? 0n
    : BigInt(discounts?.get("purchaseFeeDiscount")?.toFixed() ?? "-1"); // -1n → not purchasable
```

**Choosing the option.** Eligible options are the ones whose `allowedMembershipTiers` has the buyer's tier. The price belongs to the option, not to the tier: "a price per tier" is one option per tier. The contract never picks an option for the user. Show the open, eligible options and default to the cheapest. On basenet today that means: a verified user whose tier is not `Starter` has nothing to buy. Tiers are assigned by the registrar; there is no self-service path.

**`TRANSFER` launches** (XAUG): delivery runs the RWA token's own transfer, which asks the KYC contract whether the launch treasury may send to this buyer (country transfer rules). A verified buyer can still fail with the token's `ERROR_CANNOT_TRANSFER`. `MINT` launches do not run that check.

## 4. Quote: price, fee, `maxTotalPayment`

- `amount` is raw RWA units (6 dp): `1_500_000` = 1.5 tokens.
- `price` is raw payment units per **1 000 000** raw RWA units: per whole token for the 6-dp tokens every launch uses. The divisor is the contract's constant, not `10^decimals`.
- The fee is **inside** the price, not on top of it. The asset treasury gets `totalPrice − fullFee`; the buyer pays that plus the discounted fee. At 0 discount the buyer pays exactly `totalPrice`.

```tsx
const SCALE = 1_000_000n;
const BPS = 10_000n;

function quote(
  price: bigint,
  amount: bigint,
  feeBps: bigint,
  discountBps: bigint
) {
  const totalPrice = (price * amount + SCALE - 1n) / SCALE; // rounded up, per purchase
  const fullFee = (totalPrice * feeBps) / BPS;
  const fee = (totalPrice * feeBps * (BPS - discountBps)) / (BPS * BPS); // rounded down once
  const net = totalPrice - fullFee;
  return { totalPrice, fee, net, totalPayment: net + fee };
}
```

Example, KRKN at `30000000`, buying 1.5 (`1500000`), fee 100 bps:

| discount      | `totalPrice` | `fee`   | `net` (asset treasury) | `totalPayment`               |
| ------------- | ------------ | ------- | ---------------------- | ---------------------------- |
| 0 (`Starter`) | 45 000 000   | 450 000 | 44 550 000             | **45 000 000** (45.00 wUSDT) |
| 5 000 (50%)   | 45 000 000   | 225 000 | 44 550 000             | **44 775 000** (44.775)      |

Rules:

- **`maxTotalPayment` = the quoted `totalPayment`, exactly.** The price is fixed, so there is no market slippage to allow for. The cap exists because the price, the fee or the discount can change between the quote and the block. A move against the user fails with `ERROR_TOTAL_PRICE_EXCEEDS_MAX_PAYMENT`: re-read, re-quote, re-confirm. On the permit path the cap is part of the signed action, so the relayer cannot raise it.
- Check the wUSDT balance ≥ `totalPayment` before the wallet prompt.
- Rounding is per purchase: splitting one purchase into several can cost a unit more each time with a non-round price. Do not split on the user's behalf.
- Amounts are `bigint` or decimal strings end to end; never `Number`.

## 5. Direct purchase (wallet-signed, MAV gas)

The launchpad pulls wUSDT from the buyer with an FA2 `transfer`, so the buyer must list the **launchpad** as an operator on wUSDT once. The grant is persistent. It is a separate grant from the one the orderbook holds.

```tsx
const usdt = await Mavryk.contract.at(pay.currency.fa2.tokenContractAddress);
const tokenId = pay.currency.fa2.tokenId;
const granted =
  await((await usdt.storage()) as any).operators.get({
    0: wallet,
    1: LAUNCHPAD,
    2: tokenId,
  }) !== undefined;

let batch = Mavryk.contract.batch();
if (!granted) {
  batch = batch.withContractCall(
    usdt.methodsObject.update_operators([
      {
        add_operator: { owner: wallet, operator: LAUNCHPAD, token_id: tokenId },
      },
    ])
  );
}
batch = batch.withContractCall(
  lp.methodsObject.purchase({
    launchName,
    amount: amount.toString(),
    saleOption: saleOptionName,
    payment: "USDT",
    maxTotalPayment: q.totalPayment.toString(),
  })
);
const op = await batch.send(); // one wallet prompt for both
await op.confirmation(1);
```

- Attach **0 MAV**. A token-priced purchase with MAV attached fails (`ERROR_ENTRYPOINT_SHOULD_NOT_RECEIVE_MAV`). An option priced in `mav` (none today) needs exactly `totalPayment` mumav attached and cannot go through a permit.
- wUSDT also has the `is_operator` view; the `operators` big map (key `(owner, operator, token_id)`) is the same fact without a view call.
- Contract errors surface at estimation, before the wallet prompt. Decode the `failwith` string from the error as on the trading path (§8).

## 6. Permit purchase (gasless target)

This follows the same TZIP-17 scheme as the trading permits (`gasless-trading-integration.md` §3), with one addition: every contract of this generation signs a **deadline**. That covers this launchpad, wUSDT `KT1Pn5Z…` and the new RWA tokens. The deadline changes both the signed payload and the submitted item. A signing routine written for the older 3-field item produces `ERROR_PERMIT_MISSIGNED` here.

### 6.1 What is signed

| Piece       | Value                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| action      | `{ permitPurchase: { launchName, amount, saleOption, payment, maxTotalPayment } }`                                     |
| permit hash | `blake2b-256(pack(action))`, with the `%action` type taken from the **live** script                                    |
| counter     | `permitsCounterLedger[wallet]` on **this** contract (absent = `0`; view `getPermitCounter`), read right before signing |
| deadline    | a UTC timestamp, whole seconds; the permit is refused once block time ≥ deadline                                       |
| payload     | `pack( pair( pair(chain_id, launchpad), pair(counter, pair(permitHash, deadline)) ) )`, starting with `05`             |

The contract derives the signer from the public key, so the signer is the purchaser. The relayer's address never appears in the purchase.

### 6.2 Building and signing

```tsx
import {
  packDataBytes,
  MichelsonType,
} from "@mavrykdynamics/webmavryk-michel-codec";
import { Schema } from "@mavrykdynamics/webmavryk-michelson-encoder";
import { buf2hex, hex2buf } from "@mavrykdynamics/webmavryk-utils";
import { hash } from "@stablelib/blake2b";

const blake2bHex = (hex: string, len: number) =>
  buf2hex(hash(hex2buf(hex), len));

const PAYLOAD_TYPE: MichelsonType = {
  prim: "pair",
  args: [
    { prim: "pair", args: [{ prim: "chain_id" }, { prim: "address" }] },
    {
      prim: "pair",
      args: [
        { prim: "nat" },
        { prim: "pair", args: [{ prim: "bytes" }, { prim: "timestamp" }] },
      ],
    },
  ],
};

const findEntrypoint = (node: any, name: string): any =>
  node?.annots?.includes(`%${name}`)
    ? node
    : (node?.args ?? []).map((a: any) => findEntrypoint(a, name)).find(Boolean);

async function signPermit(
  contractAddress: string,
  action: object,
  ttlSeconds = 900
) {
  const contract = await Mavryk.contract.at(contractAddress);

  // hash of the action, encoded against the live %action type
  const script = await Mavryk.rpc.getScript(contractAddress);
  const itemType = findEntrypoint(
    script.code.find((s: any) => s.prim === "parameter").args[0],
    "executePermit"
  ).args[0];
  const i = itemType.args.findIndex((a: any) => a.annots?.includes("%action"));
  const actionValue = contract.methodsObject
    .executePermit([{ signer: wallet, action }])
    .toTransferParams().parameter!.value[0].args[i];
  const permitHash = blake2bHex(
    packDataBytes(actionValue, itemType.args[i]).bytes,
    32
  );

  const counter =
    (
      await ((await contract.storage()) as any).permitsCounterLedger.get(wallet)
    )?.toNumber() ?? 0;
  const chainId = await Mavryk.rpc.getChainId();
  const deadline = new Date(
    (Math.floor(Date.now() / 1000) + ttlSeconds) * 1000
  ).toISOString();

  const payload = packDataBytes(
    new Schema(PAYLOAD_TYPE).Encode([
      chainId,
      contractAddress,
      counter,
      permitHash,
      deadline,
    ]),
    PAYLOAD_TYPE
  ).bytes; // "05…"
  const { sig } = await signer.sign(payload); // the App's wallet signer, as for trading permits
  return {
    userPublicKey: await signer.publicKey(),
    userSignature: sig,
    action,
    deadline,
  };
}

const permit = await signPermit(LAUNCHPAD, {
  permitPurchase: {
    launchName,
    amount: amount.toString(),
    saleOption: saleOptionName,
    payment: "USDT",
    maxTotalPayment: q.totalPayment.toString(),
  },
});
const operation = lp.methodsObject
  .permitAndExecute([permit])
  .toTransferParams(); // amount 0 → the relay (§6.5)
```

- Pass the **same** `action` object to the hash and to `permitAndExecute`. The contract re-hashes what it receives; a field rendered differently (a number where the hash used a string) is a different permit.
- Verify the signature locally before posting, and show your own readable confirmation of the action: launch, option, amount, and **the cap** in wUSDT. The wallet prompt shows opaque bytes. Both rules come from the trading guide.
- `deadline`: 15 minutes is a sane default. Shorter is safer, since the price cap is signed. The contract's `permitDefaultExpiryDuration` (86 400 s) and `permitMaxExpiryDuration` (259 200 s) govern only the two-step `permit` + `executePermit` flow, which the App does not use.

### 6.3 The operator grant, as a permit

The launchpad still needs to be a wUSDT operator for the buyer. Gasless, that is a `permitUpdateOperators` permit on **wUSDT**: its own counter, its own deadline, the same routine with `contractAddress = wUSDT`.

```tsx
signPermit(WUSDT, {
  permitUpdateOperators: [
    { add_operator: { owner: wallet, operator: LAUNCHPAD, token_id: 0 } },
  ],
});
```

A fresh wallet signs twice (grant, then purchase); a returning one signs once. Skip the grant whenever the operator is already there (§5).

### 6.4 Sequencing

- Counters are per `(contract, signer)`. Two permits signed on the same contract before the first lands share a counter, and the second fails `ERROR_PERMIT_MISSIGNED`. Sign the next purchase only after the previous one is final.
- The grant (wUSDT) and the purchase (launchpad) are on different contracts, but the purchase needs the grant applied. Wait for the grant to be final before relaying the purchase.
- Re-signing is always safe. An unused signature dies at its deadline or when the counter moves; nothing needs revoking.

### 6.5 Where to send it - not shipped

The relay (`POST /wallets/{w}/relay/operations`, trading guide §2) refuses this operation today. The App can build and sign the permits now; submission waits for these backend changes:

1. **The permit parser reads the 4-field item.** On `develop` the parser accepts only `Pair(userPublicKey, userSignature, action)`. It classifies any contract whose item carries `deadline` as `old_generation`, which means `CONTRACT_NOT_RELAYABLE`. The same parser serves the trading permits, so wUSDT `KT1Pn5Z…` and the new RWA tokens are affected too.
2. **A `launchpad` contract kind and a purchase intent** (`permitPurchase`). The relay directory must include the launchpad, and the launchpad must be registered with the Gas Station. Today the directory excludes launchpads by design, because they had no permits when it was written.
3. **`update_operators` may name the launchpad as operator** on the payment token. Today only the token's own orderbook is accepted, and the address-literal guard rejects the launchpad address.

The intent's name and fields will be pinned in `docs/openapi.yaml` when this ships; do not hardcode a guess. Do not submit `permitAndExecute` from the user's own wallet as a stopgap: the user pays the gas anyway and burns a counter for nothing.

## 7. After the purchase

**On chain.** Once the operation is applied, the purchase record is final:

```tsx
const rec = await lpStorage.purchaseLedger.get({ 0: launchName, 1: wallet });
// { purchased: MichelsonMap<option, nat>, totalPurchased, totalDistributed } | undefined
```

- `AUTO` (every launch today): `totalDistributed === totalPurchased` right after, and the tokens are in the wallet.
- `MANUAL`: the purchase records the allocation only. Render `totalPurchased − totalDistributed` as "allocated, pending distribution". An admin's `distributeTokens` delivers it later, and the inbox then says `launch_tokens_distributed`.
- An admin can also record an off-chain purchase (`setPurchaseRecord`). That grows the same record with no payment on chain. The inbox shows it as `launch_purchase_recorded`, and the App must not render it as the user's own transaction.

**In the App.** Nothing in the backend reacts to a purchase: it has no handler for `LAUNCHPAD_PURCHASE`. Whether a token-transfer event happens to retire the wallet caches depends on the treasury addresses. Refresh explicitly on either of two triggers:

- the operation confirms, on the direct path;
- a `LAUNCHPAD_PURCHASE` frame arrives on the wallet channel, whichever path.

Then:

- Refetch `/transactions?fresh=1` and `/activity/summary?fresh=1`.
- Refetch `/portfolio` after its 20 s TTL; it has no `fresh=1`. Balances already arrive live over TzKT SignalR.
- Refetch the launch card, or let `LAUNCHPAD_LAUNCH_UPDATED` move the progress bar.

What the user sees there today:

- The purchase appears in `/transactions` as its plain FA2 legs: a `withdrawal` of wUSDT (two, when the fee is non-zero) and a `deposit` of the RWA token. The feed has no "purchase" type yet.
- The holding has no cost basis, so PnL is blank for primary-market buys.
- The inbox rows exist: `launch_purchase`, `launch_purchase_recorded` and `launch_tokens_distributed` (`notification-center-integration`).

## 8. Errors

The contract fails with a string. Branch on it; the first check that fails wins, in the order of §2 "Purchasable now".

| Error                                                                                                                                                                                                                                          | Meaning                                                                                                            | UI                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `ERROR_KYC_REQUIRED_FOR_LAUNCH`                                                                                                                                                                                                                | not verified: no record, frozen, expired or blacklisted                                                            | send to KYC                                                   |
| `ERROR_MEMBERSHIP_TIER_NOT_FOUND_FOR_SALE_OPTION`                                                                                                                                                                                              | the buyer's tier (or `"none"`) is not allowed in this option                                                       | hide the option; explain the tier requirement                 |
| `ERROR_LAUNCH_IS_NOT_ACTIVE` · `ERROR_SALE_HAS_NOT_STARTED` · `ERROR_LAUNCH_HAS_ENDED` · `ERROR_SALE_OPTION_IS_PAUSED` · `ERROR_TOKEN_SALE_OPTION_HAS_NOT_STARTED` · `ERROR_TOKEN_SALE_OPTION_HAS_ENDED` · `ERROR_PURCHASE_ENTRYPOINT_PAUSED`  | the sale changed state since you read it                                                                           | re-read the launch; re-render                                 |
| `ERROR_AMOUNT_BOUGHT_MUST_EXCEED_MIN_PURCHASE_AMOUNT`                                                                                                                                                                                          | below the tier minimum (equal passes)                                                                              | clamp to `min`                                                |
| `ERROR_MAX_AMOUNT_PER_WALLET_FOR_SALE_OPTION_TOTAL_EXCEEDED` · `ERROR_MAX_AMOUNT_CAP_FOR_SALE_OPTION_EXCEEDED` · `ERROR_MAX_AMOUNT_CAP_FOR_LAUNCH_EXCEEDED`                                                                                    | over a cap, often someone else bought first                                                                        | re-read; clamp to `max`; sold out at 0                        |
| `ERROR_TOTAL_PRICE_EXCEEDS_MAX_PAYMENT`                                                                                                                                                                                                        | price, fee or discount moved against the quote                                                                     | re-quote; re-confirm (and re-sign on the permit path)         |
| `FA2_NOT_OPERATOR` (from wUSDT)                                                                                                                                                                                                                | the launchpad is not the buyer's operator                                                                          | run the grant (§5 / §6.3)                                     |
| insufficient balance (from wUSDT)                                                                                                                                                                                                              | not enough wUSDT                                                                                                   | pre-check the balance; offer a top-up                         |
| `ERROR_CANNOT_TRANSFER` (from the RWA token)                                                                                                                                                                                                   | `TRANSFER` launch: a KYC transfer rule blocks delivery to this buyer                                               | "cannot be delivered to your jurisdiction"; route to support  |
| `ERROR_PERMIT_MISSIGNED`                                                                                                                                                                                                                       | the payload rebuilt on chain does not match: a stale counter, a differently encoded action, or the 3-field routine | re-read the counter; re-sign                                  |
| `ERROR_PERMIT_DEADLINE_EXPIRED`                                                                                                                                                                                                                | block time reached the deadline                                                                                    | re-sign with a new deadline                                   |
| `ERROR_PURCHASE_AMOUNT_MUST_BE_GREATER_THAN_ZERO` · `ERROR_LAUNCH_RECORD_NOT_FOUND` · `ERROR_SALE_OPTION_NOT_FOUND` · `ERROR_PAYMENT_OPTION_NOT_FOUND` · `ERROR_ENTRYPOINT_SHOULD_NOT_RECEIVE_MAV` · `ERROR_INCORRECT_MAV_PAYMENT_AMOUNT`      | client bug or stale names                                                                                          | log; never show raw                                           |
| `ERROR_MEMBERSHIP_TIER_DISCOUNT_NOT_FOUND` · `ERROR_TREASURY_ADDRESS_NOT_FOUND` · `ERROR_MINT_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND` · `ERROR_VIEW_*_NOT_FOUND` · `ERROR_LAMBDA_NOT_FOUND` · an admin-check failure from the RWA token's `mint` | the launch is misconfigured on the admin side                                                                      | "temporarily unavailable"; report it - not the user's problem |

## 9. Numbers to pin in the client

| What                              | Value                                                                   |
| --------------------------------- | ----------------------------------------------------------------------- |
| price divisor                     | `1_000_000` (contract constant)                                         |
| basis points                      | `10_000` = 100%; `purchaseFeePercent` and `purchaseFeeDiscount` are bps |
| fee on basenet launches           | `100` bps (1%), inside the price                                        |
| payment key                       | `"USDT"` - a map key; the token behind it is wUSDT `KT1Pn5Z…`           |
| tier with no KYC or no assignment | `"none"`, discount 0                                                    |
| permit deadline                   | client choice; 15 min suggested                                         |
| permit counter                    | per `(contract, signer)`; absent = 0                                    |
| launch card cache                 | 10 s fresh (45 s empty), stale up to 5 min (`X-Cache: STALE`)           |
| portfolio / transactions cache    | 20 s / 5 min (`?fresh=1` on transactions)                               |
| amounts                           | raw integers as `bigint` or decimal strings                             |

## 10. Things that are not bugs

- `isPaused` is `false` on a `CLOSED` launch. `status` is the lifecycle; `isPaused` only mirrors `PAUSED`.
- The payment is called `"USDT"` and the card says `symbol: "USDT"`, but the token is wUSDT `KT1Pn5Z…`. The key predates the switch of the currency behind it.
- The card's `price` is `138` while the chain says `138000000`: human versus raw.
- At 0 discount the buyer pays exactly the list price. The 1% fee is carved out of it, not added on top.
- A purchase with a fee makes two wUSDT transfers (fee treasury, asset treasury); with a zero fee there is one. On basenet both treasuries are the deployer's address.
- A verified user can be refused an option: the option admits tiers, and "verified without a tier" is `"none"`.
- Two small purchases can cost one unit more than one large purchase: rounding is per purchase.
- The per-wallet limit counts one sale option, not the whole launch.
- A fresh wallet's permit counter reads as absent; it is `0`.
- An option's `saleEnd: null` does not mean "open forever": the launch's `saleEnd` still applies.
