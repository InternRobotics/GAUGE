"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TaskCategory = "rigid" | "cable" | "textile" | "soft";
type TaskFilter = "all" | TaskCategory;
type SimTaskKey = "slope" | "bounce" | "fling" | "bend";

type TrialTask = {
  id: number;
  slug: string;
  category: TaskCategory;
  title: string;
  description: string;
  physics: string[];
  materials: string;
};

const categoryLabels: Record<TaskCategory, string> = {
  rigid: "Rigid body",
  cable: "Cable",
  textile: "Textile",
  soft: "Soft body",
};

const tasks: TrialTask[] = [
  { id: 1, slug: "slope-contact", category: "rigid", title: "Slope Contact", description: "A tri-rectangular tetrahedron falls and collides along a sloped contact surface.", physics: ["Slope collision"], materials: "Wood · Plastic" },
  { id: 2, slug: "nonsmooth-contact", category: "rigid", title: "Nonsmooth Contact", description: "Wedges and pyramids fall into groove-shaped bases with nonsmooth geometry.", physics: ["Codimensional collision"], materials: "Wood · Plastic" },
  { id: 3, slug: "slope-slider", category: "rigid", title: "Slope Slider", description: "A cube slides down an inclined wooden plane under controlled friction.", physics: ["Static friction", "Kinetic friction"], materials: "Wood · Plastic · Metal" },
  { id: 4, slug: "turntable", category: "rigid", title: "Turntable", description: "An off-center cube moves on a rotating platform in a non-inertial frame.", physics: ["Friction", "Non-inertial frame"], materials: "Wood · Plastic · Metal" },
  { id: 5, slug: "bouncing-ball", category: "rigid", title: "Bouncing Ball", description: "A rubber ball repeatedly impacts the ground with diminishing bounce height.", physics: ["Rapid impact", "Restitution"], materials: "Rubber" },
  { id: 6, slug: "newtons-cradle", category: "rigid", title: "Newton’s Cradle", description: "Closely fitted metal balls transfer momentum through repeated collisions.", physics: ["Momentum transfer"], materials: "Metal" },
  { id: 7, slug: "wall-breaking", category: "rigid", title: "Wall Breaking", description: "A wrecking ball collides with and breaks a wall assembled from blocks.", physics: ["Dense collision"], materials: "Wood" },
  { id: 8, slug: "pendulum", category: "rigid", title: "Pendulum", description: "A ball on a rigid rod oscillates while gradually losing energy.", physics: ["Periodic motion", "Energy behavior"], materials: "Metal" },
  { id: 9, slug: "rope-winding", category: "cable", title: "Rope Winding", description: "A flexible rope winds around supports while repeatedly making self-contact.", physics: ["Self-collision", "Stretch modulus"], materials: "Rubber" },
  { id: 10, slug: "textile-stretching", category: "textile", title: "Textile Stretching", description: "A fabric sheet is pulled to reveal its distributed tensile response.", physics: ["Stretch modulus"], materials: "Six fabric types" },
  { id: 11, slug: "textile-bending", category: "textile", title: "Textile Bending", description: "A supported textile sags naturally under gravity and bending resistance.", physics: ["Bending modulus"], materials: "Six fabric types" },
  { id: 12, slug: "textile-flinging", category: "textile", title: "Textile Flinging", description: "Rapid acceleration drives flutter, folding, and high-frequency cloth motion.", physics: ["High-acceleration cloth"], materials: "Six fabric types" },
  { id: 13, slug: "funnel", category: "textile", title: "Funnel", description: "A textile is drawn through an opening, coupling contact and friction.", physics: ["Collision", "Friction"], materials: "Six fabric types" },
  { id: 14, slug: "rotating-ball", category: "textile", title: "Rotating Ball", description: "A rotating ball drives a sheet through distributed surface friction.", physics: ["Static friction", "Kinetic friction"], materials: "Rayon · Satin · Uniform cloth" },
  { id: 15, slug: "tablecloth-pulling", category: "textile", title: "Tablecloth Pulling", description: "A textile is pulled beneath rigid objects without moving them uniformly.", physics: ["Static friction", "Kinetic friction"], materials: "Wood · Plastic · Metal" },
  { id: 16, slug: "foam-stretching", category: "soft", title: "Foam Stretching", description: "An elastic cuboid is stretched to expose volumetric tensile response.", physics: ["Stretch modulus"], materials: "Soft · Hard foam" },
  { id: 17, slug: "foam-compressing", category: "soft", title: "Foam Compressing", description: "A foam block is compressed while markers measure local deformation.", physics: ["Compression modulus"], materials: "Soft · Hard foam" },
  { id: 18, slug: "foam-shearing", category: "soft", title: "Foam Shearing", description: "Opposing motion shears a foam block and reveals off-axis strain.", physics: ["Shear modulus"], materials: "Soft · Hard foam" },
  { id: 19, slug: "foam-twisting", category: "soft", title: "Foam Twisting", description: "A foam sample twists around its long axis under controlled loading.", physics: ["Twisting modulus"], materials: "Soft · Hard foam" },
  { id: 20, slug: "foam-bending", category: "soft", title: "Foam Bending", description: "A foam beam bends while its surface marker mesh tracks strain.", physics: ["Bending modulus"], materials: "Soft · Hard foam" },
  { id: 21, slug: "stick-stack", category: "soft", title: "Stick-stack", description: "An elastic rod slides and settles against a plane through frictional contact.", physics: ["Static friction", "Kinetic friction"], materials: "Soft · Hard variants" },
  { id: 22, slug: "cantilever-beam", category: "soft", title: "Cantilever Beam", description: "A soft cantilever couples materials with strongly contrasting stiffness.", physics: ["Large-stiffness-ratio coupling"], materials: "Soft · Hard variants" },
];

const filterOptions: { key: TaskFilter; label: string; count: number }[] = [
  { key: "all", label: "All", count: 22 },
  { key: "rigid", label: "Rigid body", count: 8 },
  { key: "cable", label: "Cable", count: 1 },
  { key: "textile", label: "Textile", count: 6 },
  { key: "soft", label: "Soft body", count: 7 },
];

const simTasks: Record<SimTaskKey, {
  label: string;
  material: string;
  metric: string;
  note: string;
  values: { name: string; value: number; color: string }[];
}> = {
  slope: {
    label: "Slope contact", material: "Plastic · 10 frames", metric: "Normalized RMSE",
    note: "A controlled contact case where all three engines remain comparatively close to the real trajectory.",
    values: [
      { name: "Isaac Sim", value: 1.26, color: "#ff6b35" },
      { name: "Genesis", value: 1.6, color: "#7f8ba3" },
      { name: "Newton", value: 1.75, color: "#b7bdc8" },
    ],
  },
  bounce: {
    label: "Bouncing ball", material: "Rubber · 18 frames", metric: "Normalized RMSE",
    note: "Rapid impact is difficult for every engine: the best error is still more than fifteen times the real-world baseline.",
    values: [
      { name: "Isaac Sim", value: 15.63, color: "#ff6b35" },
      { name: "Genesis", value: 22.5, color: "#7f8ba3" },
      { name: "Newton", value: 22.71, color: "#b7bdc8" },
    ],
  },
  fling: {
    label: "Textile flinging", material: "Satin · 562 frames", metric: "Normalized RMSE",
    note: "Solver rankings reverse under fast cloth motion. Genesis is strongest here; Isaac Sim diverges by more than an order of magnitude.",
    values: [
      { name: "Isaac Sim", value: 128.26, color: "#b7bdc8" },
      { name: "Genesis", value: 8.54, color: "#ff6b35" },
      { name: "Newton", value: 9.25, color: "#7f8ba3" },
    ],
  },
  bend: {
    label: "Foam bending", material: "Soft foam · 35 frames", metric: "Normalized RMSE",
    note: "Newton edges out Isaac Sim for bending, while Genesis trails—another sign that no engine dominates every physical regime.",
    values: [
      { name: "Isaac Sim", value: 10.71, color: "#7f8ba3" },
      { name: "Genesis", value: 14.43, color: "#b7bdc8" },
      { name: "Newton", value: 10.37, color: "#ff6b35" },
    ],
  },
};

const engineLedger = [
  ["Slope contact", "Plastic", "RMSE / DTW", "1.26 / 1.83", "1.60 / 2.57", "1.75 / 3.07"],
  ["Nonsmooth contact", "Plastic", "RMSE / DTW", "1.53 / 1.90", "10.04 / 14.37", "6.05 / 8.01"],
  ["Slope slider", "Metal", "RMSE / DTW", "0.61 / 0.71", "0.58 / 0.69", "1.95 / 2.93"],
  ["Turntable", "Metal", "RMSE / DTW", "0.17 / 0.61", "0.57 / 2.01", "20.04 / 66.72"],
  ["Bouncing ball", "Rubber", "RMSE / DTW", "15.63 / 5.58", "22.50 / 14.58", "22.71 / 14.89"],
  ["Newton’s cradle", "Metal", "LSD / MTE", "0.00 / 0.20", "— / —", "0.00 / 0.26"],
  ["Pendulum", "Metal", "PD / EL", "1.10 / 11.01", "2.47 / −1.67", "1.09 / 6.87"],
  ["Textile stretching", "Satin", "RMSE / DTW", "0.73 / 0.76", "1.51 / 1.56", "0.73 / 0.75"],
  ["Textile bending", "Satin", "RMSE / DTW", "7.94 / 11.78", "11.73 / 17.35", "19.90 / 18.82"],
  ["Textile flinging", "Satin", "RMSE / DTW", "128.26 / 167.31", "8.54 / 11.27", "9.25 / 12.12"],
  ["Foam stretching", "Soft", "RMSE / DTW", "16.15 / 17.18", "10.05 / 10.65", "15.46 / 16.45"],
  ["Foam shearing", "Soft", "RMSE / DTW", "26.13 / 28.85", "15.26 / 16.74", "26.57 / 29.34"],
  ["Foam twisting", "Soft", "RMSE / DTW", "17.14 / 18.47", "10.86 / 11.67", "16.78 / 18.07"],
  ["Foam bending", "Soft", "RMSE / DTW", "10.71 / 21.28", "14.43 / 27.51", "10.37 / 20.53"],
];

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
      for (let x = 0; x <= w; x += w / 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += h / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const traces = [
        { color: "#151b26", width: 3, dash: [] as number[], amp: 0.3, drift: 0 },
        { color: "#ff6b35", width: 2, dash: [7, 6], amp: 0.28, drift: -0.015 },
        { color: "#7a879d", width: 2, dash: [3, 6], amp: 0.39, drift: 0.02 },
      ];
      traces.forEach((trace, index) => {
        ctx.beginPath(); ctx.setLineDash(trace.dash); ctx.strokeStyle = trace.color; ctx.lineWidth = trace.width;
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

function TrialVideo({ task, controls = false }: { task: TrialTask; controls?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(controls);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || controls) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true);
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { rootMargin: "180px 0px", threshold: 0.12 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [controls]);

  if (failed) return <div className="video-fallback"><span>{String(task.id).padStart(2, "0")}</span><small>REAL-WORLD TRIAL</small></div>;
  return (
    <video ref={videoRef} muted={!controls} loop={!controls} playsInline controls={controls} preload={controls ? "metadata" : "none"} onError={() => setFailed(true)} aria-label={`${task.title} real-world trial`}>
      {ready && <source src={`/trials/${task.slug}.mp4`} type="video/mp4" />}
    </video>
  );
}

function TaskCard({ task, onOpen }: { task: TrialTask; onOpen: (task: TrialTask) => void }) {
  return (
    <article className="trial-card">
      <button className="trial-media" onClick={() => onOpen(task)} aria-label={`Open ${task.title} trial`}>
        <TrialVideo task={task} />
        <span className="trial-badge">Real trial</span>
        <span className="trial-open">View <i>↗</i></span>
      </button>
      <div className="trial-meta"><span>Task {String(task.id).padStart(2, "0")}</span><span>{categoryLabels[task.category]}</span></div>
      <h3><button onClick={() => onOpen(task)}>{task.title}</button></h3>
      <p>{task.description}</p>
      <div className="physics-tags">{task.physics.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function TaskModal({ task, onClose }: { task: TrialTask; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  return (
    <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="task-modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close task detail">×</button>
        <div className="modal-video"><TrialVideo task={task} controls /></div>
        <div className="modal-copy">
          <p className="micro">Task {String(task.id).padStart(2, "0")} · {categoryLabels[task.category]}</p>
          <h3 id="task-modal-title">{task.title}</h3>
          <p>{task.description}</p>
          <dl><div><dt>Diagnostic target</dt><dd>{task.physics.join(" · ")}</dd></div><div><dt>Materials</dt><dd>{task.materials}</dd></div></dl>
        </div>
      </div>
    </div>
  );
}

function MiniMark() {
  return <span className="mini-mark" aria-hidden="true"><i /><b /></span>;
}

export function GaugeDemo() {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [activeTask, setActiveTask] = useState<TrialTask | null>(null);
  const [simTask, setSimTask] = useState<SimTaskKey>("fling");
  const [track, setTrack] = useState<"engine" | "world">("engine");
  const filteredTasks = useMemo(() => filter === "all" ? tasks : tasks.filter((task) => task.category === filter), [filter]);
  const selectedTask = simTasks[simTask];
  const maxLog = Math.max(...selectedTask.values.map((item) => Math.log10(item.value + 1)));

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GAUGE home"><MiniMark /><span>GAUGE</span></a>
        <nav aria-label="Primary navigation"><a href="#benchmark">Benchmark</a><a href="#protocol">Protocol</a><a href="#results">Results</a><a href="#paper">Paper</a></nav>
        <a className="header-cta" href="/gauge.pdf" target="_blank" rel="noreferrer">Read paper <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>Measurement-grounded</span> physical fidelity</p>
          <h1>Does it move right,<br />or just <em>look</em> right?</h1>
          <p className="hero-deck">GAUGE diagnoses how simulation engines and video world models reproduce—or violate—real-world physics.</p>
          <div className="hero-actions"><a className="button primary" href="#results">Open the diagnostic</a><a className="button secondary" href="#benchmark">Explore 22 tasks <span>↓</span></a></div>
          <div className="authors"><p>Shuai Wang · Yaxin Feng · Xuekun Jiang · Shihan Tian · Ningyu Yan · Xing Shen · Chaoyang Lyu · Hui Wang · Yunsong Zhou · Hanqing Wang · Jiangmiao Pang · Yang Xiang · Xing Gao · Chunhua Shen · Weinan Zhang</p><span>Shanghai AI Laboratory · HKUST · SJTU · Zhejiang University</span></div>
        </div>
        <div className="hero-instrument" aria-label="Physical fidelity diagnostic preview">
          <div className="instrument-topline"><span>LIVE DIAGNOSTIC / PENDULUM</span><span className="live-dot">REAL → SIM</span></div>
          <div className="trace-panel"><div className="trace-labels"><span><i className="real" />Real mean</span><span><i className="isaac" />Isaac Sim</span><span><i className="genesis" />Genesis</span></div><TraceCanvas /><span className="axis axis-y">angle</span><span className="axis axis-x">time →</span></div>
          <div className="instrument-readout">
            <div className="dial-wrap"><div className="dial"><i /><span>0.61</span><small>FIDELITY</small></div></div>
            <div className="readout-copy"><span>Observed deviation</span><strong>Period drift</strong><p>Shape agreement can hide an incorrect physical parameter.</p></div>
            <div className="status-stack"><span>PD <b>2.47 s</b></span><span>REAL <b>1.14 s</b></span><span>Δ <b className="warn">+1.33 s</b></span></div>
          </div>
        </div>
      </section>

      <section className="stat-ribbon" aria-label="Benchmark statistics">
        <div><strong>22</strong><span>task families</span></div><div><strong>≈1,560</strong><span>real trials</span></div><div><strong>4</strong><span>physical regimes</span></div><div><strong>2</strong><span>evaluation tracks</span></div>
      </section>

      <section className="section intro" id="protocol">
        <div className="section-kicker">01 / The protocol</div>
        <div className="section-title-grid"><h2>One ground truth.<br />Two complementary tracks.</h2><p>GAUGE starts from repeated real-world experiments, calibrated metadata, and uncertainty—not visual preference. The same foundation diagnoses numerical simulators and generative video models.</p></div>
        <div className="principle-grid">
          <article><span>01</span><h3>Measurement-grounded</h3><p>Sixteen infrared cameras capture motion at 180 Hz. Repeated trials yield millimeter-level trajectories and uncertainty estimates.</p></article>
          <article><span>02</span><h3>Cross-regime</h3><p>One benchmark spans rigid bodies, flexible cables, textiles, and volumetric soft bodies.</p></article>
          <article><span>03</span><h3>Diagnostic by design</h3><p>Trajectory error, equation form, physical parameters, and temporal stability remain separate signals.</p></article>
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
              ["03", "Measure the gap", "Six metrics expose errors across four physical regimes."],
            ] : [
              ["01", "Condition generation", "A fixed first frame and standardized text prompt define the rollout."],
              ["02", "Recover motion", "Tracking extracts keypoints and derived physical signals from pixels."],
              ["03", "Test the law", "Five metrics separate equation form, parameter accuracy, and stability."],
            ]).map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
          </div>
          <figure className="paper-overview">
            {/* The framework is a local paper figure with fixed intrinsic content. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/paper/overview.png" alt="GAUGE evaluation framework from the paper" />
            <figcaption>Real-world measurements anchor both evaluation tracks.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section benchmark" id="benchmark">
        <div className="section-kicker light">02 / Real-world task atlas</div>
        <div className="section-title-grid light"><h2>Physics,<br />observed.</h2><p>Every card is a canonical real-world trial. Filter by body type; open any task to inspect its diagnostic target and material setup.</p></div>
        <div className="task-filter" role="tablist" aria-label="Filter trial tasks">
          {filterOptions.map((option) => <button key={option.key} className={filter === option.key ? "active" : ""} onClick={() => setFilter(option.key)} role="tab" aria-selected={filter === option.key}><span>{option.label}</span><b>{option.count}</b></button>)}
        </div>
        <p className="filter-status" aria-live="polite">Showing {filteredTasks.length} of 22 task families</p>
        <div className="trial-grid">{filteredTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={setActiveTask} />)}</div>
        <details className="disclosure task-index">
          <summary><span><small>Reference index</small>Complete task &amp; material index</span><b>22 tasks <i>＋</i></b></summary>
          <div className="task-index-grid">{tasks.map((task) => <article key={task.id}><span>{String(task.id).padStart(2, "0")}</span><div><p>{categoryLabels[task.category]}</p><h3>{task.title}</h3><small>{task.physics.join(" · ")}</small></div><strong>{task.materials}</strong></article>)}</div>
        </details>
      </section>

      <section className="section results" id="results">
        <div className="section-kicker">03 / Engine diagnosis</div>
        <div className="section-title-grid"><h2>No single engine<br />wins every regime.</h2><p>Choose a task to compare reported physical-fidelity errors. Bar lengths use a logarithmic scale so compact errors and catastrophic divergence remain readable.</p></div>
        <div className="diagnostic-shell">
          <div className="task-selector" role="tablist" aria-label="Engine result task">{(Object.keys(simTasks) as SimTaskKey[]).map((key) => <button key={key} className={simTask === key ? "active" : ""} onClick={() => setSimTask(key)} role="tab" aria-selected={simTask === key}>{simTasks[key].label}</button>)}</div>
          <div className="diagnostic-main">
            <div className="diagnostic-copy"><p className="micro">{selectedTask.material}</p><h3>{selectedTask.label}</h3><p>{selectedTask.note}</p><div className="legend-note"><b>↓ Lower is better</b><span>{selectedTask.metric}</span></div></div>
            <div className="bar-plot">{selectedTask.values.map((item) => { const width = 18 + (Math.log10(item.value + 1) / maxLog) * 82; return <div className="bar-item" key={item.name}><div className="bar-meta"><span>{item.name}</span><strong>{item.value.toFixed(2)}×</strong></div><div className="bar-track"><i style={{ width: `${width}%`, background: item.color }} /></div></div>; })}</div>
          </div>
          <div className="diagnostic-footer"><span>REAL-WORLD BASELINE = 1.00×</span><span>Reported GAUGE evaluation</span></div>
        </div>
        <details className="disclosure engine-ledger">
          <summary><span><small>Normalized errors</small>Complete engine result ledger</span><b>14 tasks <i>＋</i></b></summary>
          <div className="ledger-legend"><span>Task / metric</span><span>Isaac Sim</span><span>Genesis</span><span>Newton</span></div>
          <div className="ledger-rows">{engineLedger.map(([name, material, metric, isaac, genesis, newton]) => <article key={name}><div><p>{material}</p><h3>{name}</h3><small>{metric}</small></div><dl><div><dt>Isaac Sim</dt><dd>{isaac}</dd></div><div><dt>Genesis</dt><dd>{genesis}</dd></div><div><dt>Newton</dt><dd>{newton}</dd></div></dl></article>)}</div>
          <p className="ledger-note">Values are normalized by the real-world baseline mean. Lower is better for RMSE and DTW; metric-specific interpretation applies to LSD, MTE, PD, and EL.</p>
        </details>
      </section>

      <section className="section world-models">
        <div className="world-copy"><div className="section-kicker light">04 / World-model diagnosis</div><h2>Plausible motion can still encode the wrong physics.</h2><p>A generated video may follow the expected equation form while recovering incorrect acceleration, momentum transfer, or oscillation timing. GAUGE keeps those layers separate.</p><a href="/gauge.pdf" target="_blank" rel="noreferrer">Read the model analysis <span>↗</span></a></div>
        <div className="evidence-stack">
          <article><div><span>Slope slider</span><b>Acceleration</b></div><h3>Closest generation</h3><strong>2.06 <small>m/s²</small></strong><p>Real baseline <b>2.58 m/s²</b> · lowest QFI 13.61</p></article>
          <article><div><span>Pendulum</span><b>Timing</b></div><h3>Equation form fits</h3><strong>0.99 <small>R²</small></strong><p>Generated periods <b>1.93 / 1.90 s</b> · real 1.06 s</p></article>
          <article><div><span>Bouncing ball</span><b>Physical scale</b></div><h3>Motion looks plausible</h3><strong>0.088 <small>m/s²</small></strong><p>Versus <b>9.81 m/s²</b> real baseline · lowest QFI 12.50</p></article>
          <div className="law-callout"><span>KEY FINDING</span><p>Equation-form agreement does not guarantee correct scale or timing.</p></div>
        </div>
      </section>

      <section className="section measurement">
        <div className="section-kicker">05 / Measurement language</div>
        <div className="section-title-grid"><h2>Different bodies need<br />different observables.</h2><p>GAUGE maps each physical regime to a generalized trajectory, preserving what matters for that body instead of forcing every experiment into a single perceptual metric.</p></div>
        <div className="observable-grid">
          <article><div className="observable-icon position"><i /></div><span>RIGID</span><h3>Position P(t)</h3><p>Millimeter-scale 3D body motion from a body-fixed marker frame.</p></article>
          <article><div className="observable-icon curvature"><i /><i /><i /></div><span>TEXTILE</span><h3>Curvature K(t)</h3><p>Marker-wise Gaussian curvature captures distributed surface deformation.</p></article>
          <article><div className="observable-icon area"><i /></div><span>VOLUMETRIC</span><h3>Triangle area A(t)</h3><p>Neighboring marker faces quantify local strain and 3D deformation.</p></article>
        </div>
      </section>

      <section className="paper-cta" id="paper"><div><p className="eyebrow">GAUGE / 2026</p><h2>Measure the physics,<br />not the impression.</h2></div><div><p>A measurement-grounded benchmark for physical fidelity in simulation engines and video world models.</p><a className="button primary" href="/gauge.pdf" target="_blank" rel="noreferrer">Download the paper <span>↗</span></a></div></section>
      <footer><a className="brand" href="#top"><MiniMark /><span>GAUGE</span></a><p>Built from the GAUGE paper · Local research demo</p><a href="#top">Back to top ↑</a></footer>
      {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />}
    </main>
  );
}
