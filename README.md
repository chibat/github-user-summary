# github-user-summary

```
$ deno -r jsr:@chiba/github-user-summary

Usage: deno run jsr:@chiba/github-user-summary <USER> [MAX_PAGE]
  USER: GitHub user name or organization name
  MAX_PAGE: 1 or more. default: 10

Environment variables:
  GITHUB_TOKEN: GitHub token(Optional)

$ deno -rA jsr:@chiba/github-user-summary chibat
stargazers_count: 2916
repositories_count: 102
all: true
```
