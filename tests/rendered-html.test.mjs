import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the GAUGE research demo", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>GAUGE \| Measuring Physical Fidelity<\/title>/i);
  assert.match(html, /Does it move right/);
  assert.match(html, /<strong>22<\/strong><span>task families<\/span>/);
  assert.match(html, /Physics,/);
  assert.match(html, /Gallery/);
  assert.match(html, /Every row can drive/);
  assert.match(html, /16 cameras/);
  assert.match(html, /Cosmos3-Super-I2V/);
  assert.match(html, /Rope Winding/);
  assert.match(html, /Cantilever Beam/);
  assert.doesNotMatch(html, /Paper Table|Search tasks/i);
  assert.match(html, /Simulation-engine track/);
  assert.match(html, /GitHub code/);
  assert.match(html, /http:\/\/localhost(?::3000)?\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("removes the starter preview and keeps project metadata specific", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GaugeDemo \/>/);
  assert.match(layout, /GAUGE \| Measuring Physical Fidelity/);
  assert.match(layout, /og\.png/);
  assert.match(packageJson, /"name": "gauge-physical-fidelity-demo"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.deepEqual(await readdir(new URL("app/_sites-preview", projectRoot)), []);
});
