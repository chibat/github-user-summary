const DEFAULT_MAX = 10;
const PER_PAGE = 100;

export interface Options {
  maxPage: number;
  token?: string;
}

export interface Result {
  stargazers_count: number;
  forks_count: number;
  repositories_count: number;
  all: boolean;
  type?: string;
  avatar_url?: string;
}

export class GitHubApiError extends Error {
  constructor(readonly status: number, statusText: string) {
    super(`GitHub API request failed with status ${status}: ${statusText}`);
    this.name = "GitHubApiError";
  }
}

export async function sum(
  user: string,
  options: Options = { maxPage: DEFAULT_MAX },
): Promise<Result> {
  const encoded = encodeURIComponent(user);
  let stargazers_count = 0;
  let forks_count = 0;
  let repositories_count = 0;
  let page = 1;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "github-user-summary" // for wrangler, this is required to avoid 403 errors
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
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
    if (!res.ok) {
      throw new GitHubApiError(res.status, res.statusText);
    }
    json = await res.json();
    repositories_count += json.length;
    for (const row of json) {
      stargazers_count += row.stargazers_count;
      forks_count += row.forks_count;
    }
    if (json.length < PER_PAGE) {
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
