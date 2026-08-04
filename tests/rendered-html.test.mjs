import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /AI\/ML Engineer building/);
  assert.match(html, /reliable intelligent products/);
  assert.match(html, /JuriGPT/);
  assert.match(html, /Neev AI Agent/);
  assert.match(html, /Freelance client work/);
  assert.match(html, /CaptionCaptain/);
  assert.match(html, /RevCast AI/);
  assert.match(html, /id="contact"/);
  assert.match(html, /Let[^<]*s build something useful/);
  assert.match(html, /sahalsyed144@gmail\.com/);
  assert.match(html, /Footer navigation/);
  assert.match(html, /https:\/\/portfolio\.test\/og\.png/);
  assert.match(html, /src="\/projects\/jurigpt\.png"/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);

  const sectionOrder = [
    'id="work"',
    'id="experience"',
    'id="capabilities"',
    'id="about"',
    'id="contact"',
  ].map((marker) => html.indexOf(marker));
  assert.ok(sectionOrder.every((position) => position >= 0));
  assert.deepEqual(sectionOrder, [...sectionOrder].sort((a, b) => a - b));
});

test("server-renders the NEEV freelance case study", async () => {
  const response = await render("/work/neev-ai-poc");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Neev AI Agent/);
  assert.match(html, /Freelance client POC/);
  assert.match(html, /paid freelance engagement/);
  assert.match(html, /src="\/projects\/neev_ai_agent\.png"/);
  assert.doesNotMatch(html, /Construction AI/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
});

test("keeps the transparent NEEV logo free of a CSS background panel", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const cardRule = css.match(/\.project-card__image--neev-ai-poc\s*\{([^}]*)\}/)?.[1] ?? "";
  const heroRule = css.match(/\.case-hero__image--neev-ai-poc\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.doesNotMatch(cardRule, /background|border|padding/);
  assert.doesNotMatch(heroRule, /background|border|padding/);
});

test("keeps section spacing compact and fully fills the primary button on hover", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.work-section\s*\{[^}]*padding-bottom:\s*54px/s);
  assert.match(css, /\.experience-section\s*\{[^}]*padding-top:\s*70px/s);
  assert.match(css, /transform:\s*scale\(70\)/);
  assert.match(css, /background:\s*var\(--olive\)/);
  assert.doesNotMatch(css, /--mint|var\(--mint\)|104,\s*226,\s*179/);
  assert.match(css, /\.capabilities-section::after,[\s\S]*\.contact-section::after\s*\{[\s\S]*width:\s*72px;[\s\S]*background:\s*var\(--olive\)/);
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
