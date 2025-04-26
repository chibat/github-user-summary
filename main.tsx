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
  if (user) {
    const entry = await kv.get<Result>(["user", user]);
    result = entry.value;
    if (!result) {
      result = await sum(user);
      kv.set(["user", user], result, { expireIn });
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
            <table>
              <tr>
                <th>Stargazers ⭐</th>
                <td>{result.stargazers_count}</td>
              </tr>
              <tr>
                <th>Repositories</th>
                <td>{result.repositories_count}</td>
              </tr>
              <tr>
                <th>All</th>
                <td>{"" + result.all}</td>
              </tr>
            </table>
          )}
        </div>
      </body>
    </html>,
  );
});

Deno.serve(app.fetch);
