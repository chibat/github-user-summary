#!/usr/bin/env node

import { GitHubApiError, sum } from "./github.js";

const DEFAULT_MAX = 10;

function printUsage() {
  console.log(`
Usage: npx @chibat/github-user-summary <USER> [MAX_PAGE]
  USER: GitHub user name or organization name
  MAX_PAGE: 1 or more. default: 10

Environment variables:
  GITHUB_TOKEN: GitHub token
`);
}

const [user, maxPageArgument] = process.argv.slice(2);
if (!user || (maxPageArgument !== undefined && !/^[1-9]\d*$/.test(maxPageArgument))) {
  printUsage();
  process.exit(user ? 1 : 0);
}

const maxPage = maxPageArgument === undefined
  ? DEFAULT_MAX
  : Number.parseInt(maxPageArgument, 10);
try {
  const result = await sum(user, { maxPage, token: process.env.GITHUB_TOKEN });
  console.log(`
${result.type ?? "User"}: ${user}
Stars⭐: ${result.stargazers_count}
Forks: ${result.forks_count}
Repositories: ${result.repositories_count}
All: ${result.all}
`);
} catch (error) {
  if (!(error instanceof GitHubApiError)) {
    throw error;
  }
  console.error(error.message);
  process.exitCode = 1;
}
