# github-user-summary

## CLI

Requires Node.js 18.20 or later. Run without installing:

```sh
npx @chibat/github-user-summary chibat
```

Pass an optional maximum page count after the user name:

```sh
npx @chibat/github-user-summary chibat 3
```

Set `GITHUB_TOKEN` in the environment to authenticate GitHub API requests and
increase the API rate limit. To run from a checkout, use `npm run cli -- chibat`.

Tests can be run with `npm test`.

## Web

### Cloudflare Workers

1. Install dependencies with `npm install`.
2. Create a KV namespace with `npx wrangler kv namespace create GITHUB_USER_SUMMARY_CACHE`, then
   replace `REPLACE_WITH_KV_NAMESPACE_ID` in `wrangler.jsonc` with its ID. The
   Worker binding name is `GITHUB_USER_SUMMARY_CACHE`.
3. For local development, run `npm run dev` and open http://localhost:8787/.
4. Deploy with `npm run deploy`. Add an optional GitHub token with
   `npx wrangler secret put GITHUB_TOKEN`.

## Publishing

The npm package is published by pushing a `v*` tag or manually running the
Publish workflow. Configure the repository's `NPM_TOKEN` secret first.

-------
```
npx wrangler login --device # for Dev Containers
```