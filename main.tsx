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
    const entry = await kv.get<Result>(["user", user]);
    result = entry.value;
    if (!result) {
      result = await sum(user);
      kv.set(["user", user], result, { expireIn });
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
          <a href="https://github.com/chibat/github-user-summary" target="_blank">source</a>
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
            <table>
              <tr>
                <th>Stars ⭐</th>
                <td style="text-align: right">{result.stargazers_count.toLocaleString()}</td>
              </tr>
              <tr>
                <th>Repositories</th>
                <td style="text-align: right">{result.repositories_count.toLocaleString()}</td>
              </tr>
            </table>
          )}
          <ul>
            <li>all: {"" + result?.all}</li>
            <li>cache: {"" + cache}</li>
          </ul>
        </div>
      </body>
    </html>,
  );
});

Deno.serve(app.fetch);
