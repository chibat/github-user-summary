import assert from "node:assert/strict";
import { test } from "node:test";
import { GitHubApiError, sum } from "./dist/github.js";

test("sums repository stars and forks", async (t) => {
  t.mock.method(globalThis, "fetch", async (input, init) => {
    assert.equal(
      String(input),
      "https://api.github.com/users/octo/repos?page=1&per_page=100&sort=updated",
    );
    const headers = new Headers(init.headers);
    assert.equal(headers.get("Accept"), "application/vnd.github+json");
    assert.equal(headers.get("User-Agent"), "github-user-summary");
    assert.equal(headers.get("Authorization"), "Bearer test-token");

    return new Response(JSON.stringify([
      {
        stargazers_count: 8,
        forks_count: 3,
        owner: { type: "User", avatar_url: "https://example.com/avatar.png" },
      },
      {
        stargazers_count: 5,
        forks_count: 2,
        owner: { type: "User", avatar_url: "https://example.com/avatar.png" },
      },
    ]), { headers: { "Content-Type": "application/json" } });
  });

  assert.deepEqual(await sum("octo", { maxPage: 1, token: "test-token" }), {
    stargazers_count: 13,
    forks_count: 5,
    repositories_count: 2,
    all: true,
    type: "User",
    avatar_url: "https://example.com/avatar.png",
  });
});

test("reports the GitHub API status when the user is not found", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response("Not Found", { status: 404 })
  );

  await assert.rejects(
    sum("missing-user", { maxPage: 1 }),
    (error) => error instanceof GitHubApiError && error.status === 404,
  );
});

test("reports rate limit errors instead of treating them as missing users", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response("API rate limit exceeded", { status: 403 })
  );

  await assert.rejects(
    sum("octo", { maxPage: 1 }),
    (error) => error instanceof GitHubApiError && error.status === 403,
  );
});
