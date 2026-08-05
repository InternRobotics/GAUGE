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
  assert.match(html, /A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models/);
  assert.match(html, /Measure physical fidelity against the real world/);
  assert.match(html, /Equal contribution/);
  assert.match(html, /Corresponding author/);
  assert.ok(html.indexOf('class="academic-hero"') < html.indexOf('class="benchmark-composition"'), "the academic paper header should precede benchmark statistics");
  assert.match(html, /class="academic-framework"/);
  assert.match(html, /class="composition-ring task-ring"/);
  assert.match(html, /class="capture-apparatus"/);
  assert.doesNotMatch(html, /capture-ring/);
  assert.match(html, /Shared real-world foundation/);
  assert.match(html, /both evaluation tracks share the same real-world experimental foundation/);
  assert.doesNotMatch(html, /One empirical anchor|anchors both evaluation tracks/);
  assert.match(html, /<strong>22<\/strong><span>task families<\/span>/);
  assert.match(html, /22 task families across/);
  assert.match(html, /Four physical regimes/);
  assert.match(html, /Approximately 1,560 real trials/);
  assert.match(html, /Gallery/);
  assert.match(html, /class="trial-media"/);
  assert.match(html, /Open Slope Contact trial|class="trial-open"/);
  assert.match(html, /Physical fidelity is/);
  assert.match(html, /No engine stays uniformly faithful/);
  assert.match(html, /16 cameras/);
  assert.match(html, /Cosmos3-Super-I2V/);
  assert.match(html, /class="world-result-grid"/);
  assert.match(html, /world-model-results\/slope-slider\/standard\/cosmos3-nano\.mp4/);
  assert.match(html, /Prompt used/);
  assert.match(html, /Exact reported values/);
  assert.match(html, /Generated videos/);
  assert.match(html, /can look plausible/);
  assert.match(html, /yet still predict/);
  assert.match(html, /the wrong physics/);
  assert.ok(html.indexOf("02 / Measurement language") < html.indexOf("03 / Benchmark task demonstrations"), "measurement language should precede the task atlas and results");
  assert.match(html, /Rigid marker frame/);
  assert.match(html, /Object-centre position/);
  assert.match(html, /Generalized trajectory/);
  assert.doesNotMatch(html, /Question answered:/);
  assert.match(html, /Physical fidelity is/);
  assert.match(html, /Dynamic contact, rapid cloth motion, and volumetric deformation/);
  assert.match(html, /recover equation form while still missing the correct physical scale and timing/);
  assert.match(html, /Rope Winding/);
  assert.match(html, /Cantilever Beam/);
  assert.doesNotMatch(html, /Paper Table|Search tasks/i);
  assert.match(html, /Simulation-engine track/);
  assert.match(html, /Track A/);
  assert.match(html, /Track B/);
  assert.doesNotMatch(html, /PAPER DATA \/ SIM-TO-REAL GAP|metric-aware gap · log scale/);
  assert.doesNotMatch(html, /◇|▶/);
  assert.match(html, /<nav aria-label="Primary navigation"><a href="#protocol">Protocol<\/a><a href="#benchmark">Benchmark<\/a><a href="#results">Results<\/a><a href="#conclusion">Conclusion<\/a><\/nav>/);
  assert.match(html, /class="paper-cta" id="conclusion"/);
  assert.match(html, /Coming soon/);
  assert.doesNotMatch(html, /https:\/\/github\.com\/NINGYURICHARD\/gauge-web/);
  assert.match(html, /world-model-results\/slope-slider\/standard\/cosmos3-super-i2v\.mp4/);
  assert.match(html, /world-model-results\/pendulum\/physics\/wan-2-2\.mp4/);
  assert.match(html, /world-model-results\/bouncing-ball\/physics\/cosmos3-super-i2v\.mp4/);
  assert.match(html, /The slide accelerates, but at the wrong rate/);
  assert.match(html, /The swing trend fits, but the period is wrong/);
  assert.match(html, /Recovered free-fall acceleration · Real: 9\.81 m\/s² · QFI: 12\.50/);
  assert.match(html, /BibTeX/);
  assert.match(html, /class="citation-section"/);
  assert.match(html, /GAUGE \/ Conclusion/);
  assert.match(html, /@article\{wang2026gauge/);
  assert.match(html, /GitHub repository coming soon/);
  assert.match(html, /octicon-mark-github/);
  assert.match(html, /© 2026 Shanghai Artificial Intelligence Laboratory/);
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
