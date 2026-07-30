import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://portfolio.test${pathname}`, {
      headers: {
        accept: "text/html",
        host: "portfolio.test",
        "x-forwarded-host": "portfolio.test",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Muhammadsahal Saiyed — AI\/ML Engineer/);
  assert.match(html, /I build AI systems that move from/);
  assert.match(html, /JuriGPT/);
  assert.match(html, /CaptionCaptain/);
  assert.match(html, /RevCast AI/);
  assert.match(html, /id="contact"/);
  assert.match(html, /https:\/\/portfolio\.test\/og\.png/);
  assert.match(html, /src="\/projects\/jurigpt\.png"/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("server-renders a detailed project case study", async () => {
  const response = await render("/work/jurigpt");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /JuriGPT — AI Legal Assistant for Indian Law/);
  assert.match(html, /Grounding before generation/);
  assert.match(html, /Current limitations/);
  assert.match(html, /https:\/\/jurigpt\.vercel\.app/);
  assert.match(html, /src="\/projects\/jurigpt\.png"/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
});
