# github-user-summary

[![JSR](https://jsr.io/badges/@chiba/github-user-summary)](https://jsr.io/@chiba/github-user-summary)
[![JSR Score](https://jsr.io/badges/@chiba/github-user-summary/score)](https://jsr.io/@chiba/github-user-summary)

## CLI

### JSR

```
$ deno -r jsr:@chiba/github-user-summary

Usage: deno run jsr:@chiba/github-user-summary <USER> [MAX_PAGE]
  USER: GitHub user name or organization name
  MAX_PAGE: 1 or more. default: 10

Environment variables:
  GITHUB_TOKEN: GitHub token(Optional)

$ deno -rA jsr:@chiba/github-user-summary chibat

User: chibat
Stars⭐: 2920
Forks: 483
Repositories: 102
All: true
```

### Repository

```
$ deno task cli chibat
```

## Web

### Deno Deploy

https://github-user-summary.deno.dev/

### Locally

#### JSR

```
$ deno -rA --unstable-kv jsr:@chiba/github-user-summary/web
```
open http://localhost:8000/

#### Repository

```
$ deno task web
```
open http://localhost:8000/

## API

https://jsr.io/@chiba/github-user-summary/doc

