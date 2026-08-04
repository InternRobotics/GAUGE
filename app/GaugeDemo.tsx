"use client";

import { useEffect, useRef, useState } from "react";

type FamilyKey = "rigid" | "textile" | "soft";
type SimTaskKey = "slope" | "bounce" | "fling" | "bend";

const families: Record<FamilyKey, {
  count: number;
  title: string;
  body: string;
  metrics: string;
  tasks: string[];
  image: string;
  imageAlt: string;
}> = {
  rigid: {
    count: 8,
    title: "Rigid bodies",
    body: "Contact, friction, restitution, momentum transfer, oscillation, and energy loss under controlled geometry and materials.",
    metrics: "Position · RMSE · DTW · MTE · PD · EL",
    tasks: ["Slope contact", "Nonsmooth contact", "Slope slider", "Turntable", "Bouncing ball", "Newton’s cradle", "Pendulum", "Wall breaking"],
    image: "/paper/slope-contact.png",
    imageAlt: "GAUGE slope contact real-world experiment",
  },
  textile: {
    count: 6,
    title: "Textiles & cables",
    body: "Distributed surface motion exposes errors that a single point trajectory cannot: bending, curvature, self-contact, and rapid deformation.",
    metrics: "Gaussian curvature · Surface trajectory · RMSE · DTW",
    tasks: ["Textile stretching", "Textile bending", "Textile flinging", "Rotating funnel", "Tablecloth pulling", "Rope winding"],
    image: "/paper/textile-flinging.png",
    imageAlt: "GAUGE textile flinging real-world experiment",
  },
  soft: {
    count: 8,
    title: "Volumetric soft bodies",
    body: "Marker meshes quantify strain and deformation across foam, rubber, rods, and beams rather than relying on visual plausibility.",
    metrics: "Triangle area · Strain · Deformation · RMSE · DTW",
    tasks: ["Foam stretching", "Foam compressing", "Foam shearing", "Foam twisting", "Foam bending", "Rubber variants", "Stick stack", "Cantilever beam"],
    image: "/paper/foam-compressing.png",
    imageAlt: "GAUGE foam compression real-world experiment",
  },
};

const simTasks: Record<SimTaskKey, {
  label: string;
  material: string;
  metric: string;
  note: string;
  values: { name: string; value: number; color: string }[];
}> = {
  slope: {
    label: "Slope contact",
    material: "Plastic · 10 frames",
    metric: "Normalized RMSE",
    note: "A controlled contact case where all three engines remain comparatively close to the real trajectory.",
    values: [
      { name: "Isaac Sim", value: 1.26, color: "#ff6b35" },
      { name: "Genesis", value: 1.6, color: "#7f8ba3" },
      { name: "Newton", value: 1.75, color: "#b7bdc8" },
    ],
  },
  bounce: {
    label: "Bouncing ball",
    material: "Rubber · 18 frames",
    metric: "Normalized RMSE",
    note: "Rapid impact is difficult for every engine: the best error is still more than fifteen times the real-world baseline.",
    values: [
      { name: "Isaac Sim", value: 15.63, color: "#ff6b35" },
      { name: "Genesis", value: 22.5, color: "#7f8ba3" },
      { name: "Newton", value: 22.71, color: "#b7bdc8" },
    ],
  },
  fling: {
    label: "Textile flinging",
    material: "Satin · 562 frames",
    metric: "Normalized RMSE",
    note: "Solver rankings reverse under fast cloth motion. Genesis is strongest here; Isaac Sim diverges by more than an order of magnitude.",
    values: [
      { name: "Isaac Sim", value: 128.26, color: "#b7bdc8" },
      { name: "Genesis", value: 8.54, color: "#ff6b35" },
      { name: "Newton", value: 9.25, color: "#7f8ba3" },
    ],
  },
  bend: {
    label: "Foam bending",
    material: "Soft foam · 35 frames",
    metric: "Normalized RMSE",
    note: "Newton edges out Isaac Sim for bending, while Genesis trails—another sign that no engine dominates every physical regime.",
    values: [
      { name: "Isaac Sim", value: 10.71, color: "#7f8ba3" },
      { name: "Genesis", value: 14.43, color: "#b7bdc8" },
      { name: "Newton", value: 10.37, color: "#ff6b35" },
    ],
  },
};

function TraceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(21, 27, 38, 0.09)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += w / 6) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += h / 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const traces = [
        { color: "#151b26", width: 3, dash: [] as number[], amp: 0.3, drift: 0 },
        { color: "#ff6b35", width: 2, dash: [7, 6], amp: 0.28, drift: -0.015 },
        { color: "#7a879d", width: 2, dash: [3, 6], amp: 0.39, drift: 0.02 },
      ];
      traces.forEach((trace, index) => {
        ctx.beginPath();
        ctx.setLineDash(trace.dash);
        ctx.strokeStyle = trace.color;
        ctx.lineWidth = trace.width;
        for (let i = 0; i <= 100; i += 1) {
          const t = i / 100;
          const x = 10 + t * (w - 20);
          const decay = Math.exp(-1.45 * t);
          const y = h * 0.51 - Math.sin(t * Math.PI * 4.25 + index * 0.08) * h * trace.amp * decay + t * h * trace.drift;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return <canvas ref={canvasRef} aria-label="Representative real and simulated trajectories" />;
}

function MiniMark() {
  return <span className="mini-mark" aria-hidden="true"><i /><b /></span>;
}

export function GaugeDemo() {
  const [family, setFamily] = useState<FamilyKey>("rigid");
  const [simTask, setSimTask] = useState<SimTaskKey>("fling");
  const [track, setTrack] = useState<"engine" | "world">("engine");
  const selectedFamily = families[family];
  const selectedTask = simTasks[simTask];
  const maxLog = Math.max(...selectedTask.values.map((item) => Math.log10(item.value + 1)));

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GAUGE home"><MiniMark /><span>GAUGE</span></a>
        <nav aria-label="Primary navigation">
          <a href="#benchmark">Benchmark</a>
          <a href="#protocol">Protocol</a>
          <a href="#results">Results</a>
          <a href="#paper">Paper</a>
        </nav>
        <a className="header-cta" href="/gauge.pdf" target="_blank" rel="noreferrer">Read paper <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>Measurement-grounded</span> physical fidelity</p>
          <h1>Does it move right,<br />or just <em>look</em> right?</h1>
          <p className="hero-deck">GAUGE diagnoses how simulation engines and video world models reproduce—or violate—real-world physics.</p>
          <div className="hero-actions">
            <a className="button primary" href="#results">Open the diagnostic</a>
            <a className="button secondary" href="#benchmark">Explore 22 tasks <span>↓</span></a>
          </div>
          <div className="authors">
            <p>Shuai Wang · Yaxin Feng · Xuekun Jiang · Shihan Tian · Ningyu Yan · Xing Shen · Chaoyang Lyu · Hui Wang · Yunsong Zhou · Hanqing Wang · Jiangmiao Pang · Yang Xiang · Xing Gao · Chunhua Shen · Weinan Zhang</p>
            <span>Shanghai AI Laboratory · HKUST · SJTU · Zhejiang University</span>
          </div>
        </div>

        <div className="hero-instrument" aria-label="Physical fidelity diagnostic preview">
          <div className="instrument-topline"><span>LIVE DIAGNOSTIC / PENDULUM</span><span className="live-dot">REAL ↔ SIM</span></div>
          <div className="trace-panel">
            <div className="trace-labels"><span><i className="real" />Real mean</span><span><i className="isaac" />Isaac Sim</span><span><i className="genesis" />Genesis</span></div>
            <TraceCanvas />
            <span className="axis axis-y">angle</span><span className="axis axis-x">time →</span>
          </div>
          <div className="instrument-readout">
            <div className="dial-wrap">
              <div className="dial"><i /><span>0.61</span><small>FIDELITY</small></div>
            </div>
            <div className="readout-copy"><span>Observed deviation</span><strong>Period drift</strong><p>Shape agreement can hide an incorrect physical parameter.</p></div>
            <div className="status-stack"><span>PD <b>2.47 s</b></span><span>REAL <b>1.14 s</b></span><span>Δ <b className="warn">+1.33 s</b></span></div>
          </div>
        </div>
      </section>

      <section className="stat-ribbon" aria-label="Benchmark statistics">
        <div><strong>22</strong><span>controlled task families</span></div>
        <div><strong>≈1,560</strong><span>motion-capture trials</span></div>
        <div><strong>3</strong><span>simulation engines</span></div>
        <div><strong>6</strong><span>video world models</span></div>
      </section>

      <section className="section intro" id="protocol">
        <div className="section-kicker">01 / The protocol</div>
        <div className="section-title-grid">
          <h2>One ground truth.<br />Two complementary tracks.</h2>
          <p>GAUGE starts from repeated real-world experiments, calibrated metadata, and uncertainty—not visual preference. The same foundation supports diagnosis of numerical simulators and generative video models.</p>
        </div>
        <div className="track-switcher" role="tablist" aria-label="Evaluation track">
          <button className={track === "engine" ? "active" : ""} onClick={() => setTrack("engine")} role="tab" aria-selected={track === "engine"}>Simulation-engine track</button>
          <button className={track === "world" ? "active" : ""} onClick={() => setTrack("world")} role="tab" aria-selected={track === "world"}>Video world-model track</button>
        </div>
        <div className="protocol-stage">
          <div className="protocol-steps">
            {(track === "engine" ? [
              ["01", "Match the scene", "Assets, geometry, materials, and initial conditions mirror the real apparatus."],
              ["02", "Run the engine", "Isaac Sim, Genesis, and Newton produce comparable state trajectories."],
              ["03", "Measure the gap", "Six metrics across rigid, textile, and soft-body physical regimes."],
            ] : [
              ["01", "Condition generation", "A fixed first frame and standardized text prompt define the rollout."],
              ["02", "Recover motion", "SAM3 tracking extracts keypoints and derived physical signals from pixels."],
              ["03", "Test the law", "Five metrics separate equation-form fit, parameter accuracy, and temporal stability."],
            ]).map(([number, title, copy]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
            ))}
          </div>
          <figure className="paper-overview">
            <img src="/paper/overview.png" alt="GAUGE evaluation framework from the paper" />
            <figcaption>Real-world measurements anchor both evaluation tracks.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section benchmark" id="benchmark">
        <div className="section-kicker light">02 / Benchmark atlas</div>
        <div className="section-title-grid light">
          <h2>Physics across<br />1D, 2D, and 3D.</h2>
          <p>Twenty-two standardized experiments cover the failure modes that matter to embodied agents—from a bouncing ball to fast textile motion and volumetric deformation.</p>
        </div>
        <div className="family-tabs" role="tablist" aria-label="Task family">
          {(Object.keys(families) as FamilyKey[]).map((key) => (
            <button key={key} className={family === key ? "active" : ""} onClick={() => setFamily(key)} role="tab" aria-selected={family === key}>
              <span>{families[key].count.toString().padStart(2, "0")}</span>{families[key].title}
            </button>
          ))}
        </div>
        <div className="family-panel">
          <div className="family-image"><img src={selectedFamily.image} alt={selectedFamily.imageAlt} /><span>REAL EXPERIMENT</span></div>
          <div className="family-copy"><p className="micro">{selectedFamily.count} TASK FAMILIES</p><h3>{selectedFamily.title}</h3><p>{selectedFamily.body}</p><div className="metric-chip">{selectedFamily.metrics}</div></div>
          <ol className="task-list">{selectedFamily.tasks.map((task, index) => <li key={task}><span>{(index + 1).toString().padStart(2, "0")}</span>{task}</li>)}</ol>
        </div>
      </section>

      <section className="section results" id="results">
        <div className="section-kicker">03 / Engine diagnosis</div>
        <div className="section-title-grid">
          <h2>No single engine<br />wins every regime.</h2>
          <p>Choose a task to compare reported physical-fidelity errors. Bar lengths use a logarithmic scale so both compact errors and catastrophic divergence remain readable.</p>
        </div>
        <div className="diagnostic-shell">
          <div className="task-selector" role="tablist" aria-label="Engine result task">
            {(Object.keys(simTasks) as SimTaskKey[]).map((key) => <button key={key} className={simTask === key ? "active" : ""} onClick={() => setSimTask(key)} role="tab" aria-selected={simTask === key}>{simTasks[key].label}</button>)}
          </div>
          <div className="diagnostic-main">
            <div className="diagnostic-copy"><p className="micro">{selectedTask.material}</p><h3>{selectedTask.label}</h3><p>{selectedTask.note}</p><div className="legend-note"><b>↓ Lower is better</b><span>{selectedTask.metric}</span></div></div>
            <div className="bar-plot">
              {selectedTask.values.map((item) => {
                const width = 18 + (Math.log10(item.value + 1) / maxLog) * 82;
                return <div className="bar-item" key={item.name}><div className="bar-meta"><span>{item.name}</span><strong>{item.value.toFixed(2)}×</strong></div><div className="bar-track"><i style={{ width: `${width}%`, background: item.color }} /></div></div>;
              })}
            </div>
          </div>
          <div className="diagnostic-footer"><span>REAL-WORLD BASELINE = 1.00×</span><span>Source: Table 3 · GAUGE paper</span></div>
        </div>
      </section>

      <section className="section world-models">
        <div className="world-copy">
          <div className="section-kicker light">04 / World-model diagnosis</div>
          <h2>Plausible motion can still encode the wrong physics.</h2>
          <p>A generated video may follow the expected equation form while recovering incorrect acceleration, momentum transfer, or oscillation timing. GAUGE measures all three layers instead of collapsing them into one visual score.</p>
          <a href="/gauge.pdf" target="_blank" rel="noreferrer">Read the model analysis <span>↗</span></a>
        </div>
        <div className="law-stack">
          <article><span className="law-index">01</span><div><p>FORM</p><h3>Does the trajectory obey the expected equation?</h3></div><strong>R² · QFI</strong></article>
          <article><span className="law-index">02</span><div><p>PARAMETER</p><h3>Does the fit recover the correct physical quantity?</h3></div><strong>a · MTE · PD</strong></article>
          <article><span className="law-index">03</span><div><p>STABILITY</p><h3>Does that inferred quantity remain consistent over time?</h3></div><strong>Variance · drift</strong></article>
          <div className="law-callout"><span>KEY FINDING</span><p>Looking physical is not the same as being physically faithful.</p></div>
        </div>
      </section>

      <section className="section measurement">
        <div className="section-kicker">05 / Measurement language</div>
        <div className="section-title-grid">
          <h2>Different bodies need<br />different observables.</h2>
          <p>GAUGE maps each physical regime to a generalized trajectory, preserving what matters for that body instead of forcing every experiment into a single perceptual metric.</p>
        </div>
        <div className="observable-grid">
          <article><div className="observable-icon position"><i /></div><span>RIGID</span><h3>Position P(t)</h3><p>Millimeter-scale 3D body motion from a body-fixed marker frame.</p></article>
          <article><div className="observable-icon curvature"><i /><i /><i /></div><span>TEXTILE</span><h3>Curvature K(t)</h3><p>Marker-wise Gaussian curvature captures distributed surface deformation.</p></article>
          <article><div className="observable-icon area"><i /></div><span>VOLUMETRIC</span><h3>Triangle area A(t)</h3><p>Neighboring marker faces quantify local strain and 3D deformation.</p></article>
        </div>
      </section>

      <section className="paper-cta" id="paper">
        <div><p className="eyebrow">GAUGE / 2026</p><h2>Measure the physics,<br />not the impression.</h2></div>
        <div><p>A measurement-grounded benchmark for physical fidelity in simulation engines and video world models.</p><a className="button primary" href="/gauge.pdf" target="_blank" rel="noreferrer">Download the paper <span>↗</span></a></div>
      </section>

      <footer><a className="brand" href="#top"><MiniMark /><span>GAUGE</span></a><p>Built from the GAUGE paper · Local research demo</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
