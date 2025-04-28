import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { type Result, sum } from "./mod.ts";

const expireIn = 1000 * 60; // 1 minute
const app = new Hono();
const kv = await Deno.openKv();

app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", async (c) => {
  const user = c.req.query("u");
  let result: Result | null = null;
  let cache = true;
  if (user) {
    const key = ["user", user];
    if (c.req.header("Cache-Control") === "no-cache") {
      await kv.delete(key);
    }
    const entry = await kv.get<Result>(key);
    result = entry.value;
    if (!result) {
      result = await sum(user);
      kv.set(key, result, { expireIn });
      cache = false;
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

Deno.serve(app.fetch);
