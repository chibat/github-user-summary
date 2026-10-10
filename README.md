[![NPM](https://nodei.co/npm/@chibat/github-user-summary.svg?style=shields&data=n,v,u,d&color=blue)](https://www.npmjs.com/package/@chibat/github-user-summary)

# github-user-summary
A CLI and Cloudflare Workers app for summarizing repository, star, and fork counts for GitHub users and organizations.


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

https://github-user-summary.chiba.dev

1. Install dependencies with `npm install`.
2. For local development, run `npm run dev` and open http://localhost:8787/.
3. Deploy with `npm run deploy`.

## Publishing

https://www.npmjs.com/package/@chibat/github-user-summary

The npm package is published by pushing a `v*` tag or manually running the
Publish workflow. Configure the repository's `NPM_TOKEN` secret first.

-------
```
npx wrangler login --device # for Dev Containers
```
