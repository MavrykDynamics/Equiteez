# Asset API validation

Verified against the test API on 2026-10-02:

- `GET /api/v1/assets`: USTB omits `finance.value_per_token` and `stats`.
- `GET /api/v1/assets/highlights`: the USTB entry in `newly_added` omits `price`, `quote_price`, and `volume_24h`; `change_24h` is null.

The asset schemas allow these omissions without inventing prices. Supplied prices must still match their schemas; null or malformed prices are rejected. Unknown object fields are tolerated by Zod's existing object schemas. Missing displayed prices use `—`, and reported zero prices remain zero.

The shared `api` helper uses `safeParse` and logs validation issues with the request URL and method, without logging the response body. Invalid responses reject the request instead of returning unchecked data. React Query handles these rejections as query errors and retains previously validated cached data. Without cached data, asset routes use the provider's existing unavailable state and highlights show an unavailable message. Network and JSON decoding failures also remain request errors.

This does not relax unrelated endpoint schemas or change their return contracts.
