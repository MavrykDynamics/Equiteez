# Permit deployment evidence

`manifest.json` pins API/RPC, chain ID, block, contract addresses and SHA-256 hashes. Script files contain complete RPC script/storage JSON, compactly reserialized. `relay-config.json` is a live HTTP 200 response, not a permanent production allowlist. Runtime always checks current config and executable generation separately.

The orderbook stores executable lambdas in big map 3834. `lambdaPermitAndExecute.json` and `lambdaPlaceSellOrder.json` are exact RPC bytes values at the manifest block. Their keys are the script expressions of the packed strings `lambdaPermitAndExecute` and `lambdaPlaceSellOrder`. The latter pushes token ID 0 for the RWA transfer; sell signing checks this lambda fingerprint and the selected ID. Do not silently admit changed generations.

## Signature evidence

`signature-vectors.json` and `orderbook-signature-vectors.json` contain six public vectors with ephemeral, unfunded test identities. Private keys were discarded and are not stored. Key generation/signing used installed stablelib Ed25519 and elliptic secp256k1/P-256 implementations; these are fixture creation tools, not runtime signing dependencies. Each file records this provenance. These are generated test vectors with **live RPC interpreter acceptance**, not captured user-wallet signatures or relay acceptance.

The quote vectors grant an operator for token ID 0 on the captured quote token. Orderbook vectors use an empty cancellation list to isolate signature handling. Empty cancellations are deliberately rejected by the application and HTTP adapter; they are not relay acceptance examples.

Every vector records action, raw packed action, blake2b-256 action hash, packed domain, public key/address, signature and expected transfer parameters. The signed domain is `pair(pair(chain_id, contract), pair(counter, pair(actionHash, deadline)))`. Both complete contracts accepted all three curves with RPC `run_code` HTTP 200. The orderbook simulation executes the captured permit lambda from the pinned big map.

The SDK's timestamp packing requires care: a numeric timestamp **string** was packed differently from the node and initially caused `ERROR_PERMIT_MISSIGNED`. Convert whole-second deadlines to RFC3339 for both packing and transfer construction. The final saved vectors use that correction; tests pin the bytes. Do not hash the packed envelope before passing it to Beacon or the local verifier: Taquito's verifier performs the single signing hash internally.

To reproduce each read-only simulation, POST to `{rpc}/chains/main/blocks/{block}/helpers/scripts/run_code` with:

- `script` and `storage` from that contract's captured script JSON;
- `input` from the vector's `operation.parameter.value`;
- `entrypoint: "permitAndExecute"`, `self: vector.contract`, `chain_id: vector.chainId`;
- `source` and `payer`: `vector.wallet`;
- `amount: "0"`, `gas: "1040000"`, `now: vector.rpcVerification.now`.

This is simulation only; do not inject these authorizations. The block and explicit simulation time keep the tests reproducible after their deadlines expire. No API authentication is required for the public RPC simulation.

## Limits

No wallet extension integration or successful authenticated relay mutation was tested. The supplied authentication signatures are not permit vectors and are not stored here. The latest authenticated reads returned HTTP 401; earlier Cloudflare denials remain historical evidence in the other fixture bundle.

The top-up HTTP route still omits the signed deadline. Its reconstruction rule has not been specified or verified. The builder can construct/review a transfer from live fee config, but signing is blocked rather than guessing a deadline the backend cannot reproduce. Top-up idempotency/recovery and product Credit denomination are separate unresolved questions.
