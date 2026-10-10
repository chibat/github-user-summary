import { Hono } from "hono";
import { GitHubApiError, type Result, sum } from "./github.ts";

const expireIn = 1000 * 60; // 1 minute
type Bindings = {
  ASSETS: Fetcher;
  GITHUB_USER_SUMMARY_CACHE: KVNamespace;
  GITHUB_TOKEN?: string;
};
const app = new Hono<{ Bindings: Bindings }>();

app.get("/static/*", (c) => {
  const assetUrl = new URL(c.req.url);
  assetUrl.pathname = assetUrl.pathname.replace(/^\/static/, "");
  return c.env.ASSETS.fetch(assetUrl);
});

app.get("/", async (c) => {
  const user = c.req.query("u");
  let result: Result | null = null;
  let message: string | null = null;
  let cache = true;
  if (user) {
    const key = `user:${user}`;
    if (c.req.header("Cache-Control") === "no-cache") {
      await c.env.GITHUB_USER_SUMMARY_CACHE.delete(key);
    }
    result = await c.env.GITHUB_USER_SUMMARY_CACHE.get<Result>(key, "json");
    if (!result) {
      try {
        result = await sum(user, {
          maxPage: 10,
          token: c.env.GITHUB_TOKEN,
        });
        await c.env.GITHUB_USER_SUMMARY_CACHE.put(key, JSON.stringify(result), {
          expirationTtl: expireIn / 1000,
        });
        cache = false;
      } catch (error) {
        if (!(error instanceof GitHubApiError)) {
          throw error;
        }
        message = error.message;
      }
    }
  }
  return c.html(
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/terminal.css@0.7.4/dist/terminal.min.css"
        />
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="icon" href="https://chiba.dev/favicon.ico" />
        <title>github-user-summary</title>
      </head>
      <body>
        <div class="container">
          <div class="terminal-nav">
            <div class="logo">github-user-summary</div>
          </div>
          <form>
            <input
              type="text"
              name="u"
              value={user}
              placeholder="github account"
              autofocus
            />
          </form>
          {message && (
            <div>{message}</div>
          )}
          {result && (
            <>
              {result.avatar_url && (
                <img
                  src={result.avatar_url}
                  alt={user}
                  style="width: 100px;"
                />
              )}
              <table>
                <tr>
                  <th>Type</th>
                  <td>
                    {result.type}
                  </td>
                </tr>
                <tr>
                  <th>Stars ⭐</th>
                  <td style="text-align: right">
                    {result.stargazers_count.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <th>Forks</th>
                  <td style="text-align: right">
                    {result.forks_count.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <th>Repositories</th>
                  <td style="text-align: right">
                    {result.repositories_count.toLocaleString()}
                  </td>
                </tr>
              </table>
              <ul>
                <li>all: {"" + result?.all}</li>
                <li>cache: {"" + cache}</li>
              </ul>
            </>
          )}
          <a
            href="https://github.com/chibat/github-user-summary"
            target="_blank"
          >
            source
          </a>
        </div>
      </body>
    </html>,
  );
});

export default app;
