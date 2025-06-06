#!/usr/bin/env -S deno run --env-file -E=GITHUB_TOKEN -N=api.github.com:443

/**
 * @module
 * github-user-summary
 */

const DEFAULT_MAX = 10;
const PER_PAGE = 100;

/**
 * Options
 */
export interface Options {
  maxPage: number;
  token?: string;
}

/**
 * Result
 */
export interface Result {
  stargazers_count: number;
  forks_count: number;
  repositories_count: number;
  all: boolean;
  type?: string;
  avatar_url?: string;
}

/**
 * sum
 *
 * @param user
 * @param options
 * @returns result
 */
export async function sum(
  user: string,
  options: Options = { maxPage: DEFAULT_MAX, token: undefined },
): Promise<Result | null> {
  const encoded = encodeURIComponent(user);
  let stargazers_count = 0;
  let forks_count = 0;
  let repositories_count = 0;
  let page = 1;
  const headers: HeadersInit = { "Accept": "application/vnd.github+json" };
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  let json: {
    stargazers_count: number;
    forks_count: number;
    owner: { type: string; avatar_url: string };
  }[] = [];
  for (; page <= options.maxPage; page++) {
    const res = await fetch(
      `https://api.github.com/users/${encoded}/repos?page=${page}&per_page=${PER_PAGE}&sort=updated`,
      { headers },
    );
    if (res.status >= 400 && res.status < 500) {
      return null;
    }
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    json = await res.json();
    repositories_count += json.length;
    for (const row of json) {
      stargazers_count += row.stargazers_count;
      forks_count += row.forks_count;
    }
    if (json.length < 100) {
      const type = json.at(0)?.owner.type;
      const avatar_url = json.at(0)?.owner.avatar_url;
      return {
        stargazers_count,
        forks_count,
        repositories_count,
        all: true,
        type,
        avatar_url,
      };
    }
  }
  const type = json.at(0)?.owner.type;
  const avatar_url = json.at(0)?.owner.avatar_url;
  return {
    stargazers_count,
    forks_count,
    repositories_count,
    all: false,
    type,
    avatar_url,
  };
}

function usageExit() {
  const script = import.meta.filename || "jsr:@chiba/github-user-summary";
  console.log(`
Usage: deno run ${script} <USER> [MAX_PAGE]
  USER: GitHub user name or organization name
  MAX_PAGE: 1 or more. default: 10

Environment variables:
  GITHUB_TOKEN: GitHub token
`);
  Deno.exit(0);
}

if (import.meta.main) {
  if (Deno.args.length === 0) {
    usageExit();
  }
  let maxPage = DEFAULT_MAX;
  if (Deno.args.length >= 2) {
    maxPage = parseInt(Deno.args[1]);
    if (isNaN(maxPage) || maxPage === 0) {
      usageExit();
    }
  }
  const user = Deno.args[0];
  const token = Deno.env.get("GITHUB_TOKEN");
  const result = await sum(user, { maxPage, token });
  if (!result) {
    console.error(`User ${user} not found`);
    Deno.exit(1);
  }
  console.log(`
${result.type ?? "User"}: ${user}
Stars⭐: ${result.stargazers_count}
Forks: ${result.forks_count}
Repositories: ${result.repositories_count}
All: ${result.all}
`);
}
