# zk-Oracle

An Express backend for ID-Mask. It fetches identity and third-party data and **signs it with a Mina key** so the ZkPrograms can trust it. It also brokers passkeys, proof-ownership sessions, Google/Apple Wallet passes, and IPFS uploads. It's deployed to Google Cloud Run via Docker. See `../CLAUDE.md` for the cross-repo picture. `proposal.md` is the original project pitch.

## Commands

```sh
npm install
npm start            # node server.js, PORT defaults to 8080
```

There are no tests, no linter, and no build step. The startup connects to MongoDB (`MONGO_URI`) and **exits if the connection fails**. Swagger UI is served at `/api-docs` and is generated from JSDoc comments in `routes/` by `express-jsdoc-swagger`. Deploy commands are in the comments at the top of the `Dockerfile`.

## Structure

- `server.js`: wires up the routes and connects Mongo. `app.locals.passkeysCollection` holds passkey public keys so they work across devices, because WebAuthn only exposes the public key at creation.
- `routes/*.routes.js` hold thin handlers, and `utils/*.utils.js` holds the logic. Each routes module exports `{ router }`.
  - `/smartId`: `getMockData`, `initiateSession`, `getData`. This is the Smart-ID RP API flow; the DEMO or PROD config is chosen via `CONFIG_URL`.
  - `/sanctions/getOFACmatches`: verifies the oracle-signed personal data, queries the OFAC API, and signs the `{isMatched, minScore, currentDate}` result.
  - `/uniqueHuman/getSecretValue`: a signed secret derived from `SECRET_VALUE_UNIQUE_HUMAN`.
  - `/passkeys`, `/ownership`: challenge and session endpoints for cross-device verification.
  - `/googleWallet/createPass`, `/ipfs/upload` (Pinata), `/api/health`.
- `middleware/storage.middleware.js`: an in-memory `Map` singleton for Smart-ID sessions, ownership, and passkey challenges. It's trimmed to 5000 entries every 5 minutes. State is lost on restart, and Cloud Run is deployed with `--max-instances=1` because of this.
- `config/db.js` (Mongo, database `id-mask`) and `config/swagger.js`.

## Conventions and gotchas

- The code is CommonJS (`require`), 2-space indentation, no semicolons.
- Signing uses `PRIVATE_KEY`, whose public key is `B62qmXFN...YzWN`. That key is hardcoded in every circuit, so rotating it means changing the circuits and regenerating the verification keys.
- Signed payloads must use exactly the field order and encoding that the circuit Structs expect (`CircuitString` for strings, `Field` for numbers, dates as `YYYYMMDD` integers, `isMockData` 0 or 1). Check `../smart-contracts/src/proof.utils.ts` before changing any signature.
- Errors are often returned as `200 { error: '...' }` rather than as HTTP error codes, because the frontend expects that shape.
- Env vars (`.env`): `PRIVATE_KEY`, `MONGO_URI`, `CONFIG_URL`, `SMART_ID_UUI_PROD`, `OFAC_API_KEY`, `SECRET_VALUE_UNIQUE_HUMAN`, `GOOGLE_ISSUER_ID`, `PINATA_API_KEY`, `PINATA_API_SECRET`, `APPLE_WALLET_*`, `PORT`. Google credentials are in `.googleCreds.json`. Both files are gitignored and copied into the Docker image, so never commit or print them.
