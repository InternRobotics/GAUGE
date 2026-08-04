# GAUGE Web Demo

An interactive research project page for **GAUGE: A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models**.

The demo translates the paper into five explorable ideas:

- a real-vs-simulation trajectory instrument;
- the two complementary evaluation tracks;
- an atlas of 22 rigid, textile, cable, and volumetric task families;
- an interactive comparison of Isaac Sim, Genesis, and Newton results;
- a three-layer diagnosis of video world models: equation form, parameter accuracy, and temporal stability.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
npm test
```

The test command creates a production build and verifies the rendered research page and project-specific metadata.

## Project map

- `app/GaugeDemo.tsx` — content, data, and interactions
- `app/globals.css` — responsive visual system
- `public/paper/` — paper-derived figures and experiment crops
- `public/gauge.pdf` — source paper used by the local demo
- `public/og.png` — generated social preview card

The project uses vinext and retains `.openai/hosting.json` for optional future hosting, but this version is configured and verified for local use.
