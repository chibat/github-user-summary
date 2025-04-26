# github-user-summary

[![JSR](https://jsr.io/badges/@chiba/github-user-summary)](https://jsr.io/@chiba/github-user-summary)
[![JSR Score](https://jsr.io/badges/@chiba/github-user-summary/score)](https://jsr.io/@chiba/github-user-summary)

## CLI

```
$ deno -r jsr:@chiba/github-user-summary

Usage: deno run jsr:@chiba/github-user-summary <USER> [MAX_PAGE]
  USER: GitHub user name or organization name
  MAX_PAGE: 1 or more. default: 10

Environment variables:
  GITHUB_TOKEN: GitHub token(Optional)

$ deno -rA jsr:@chiba/github-user-summary chibat

User: chibat
Stargazers⭐: 2918
Repositories: 102
All: true
```

## Web

https://github-user-summary.deno.dev/
