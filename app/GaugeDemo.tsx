"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MarkGithubIcon } from "@primer/octicons-react";

type TaskCategory = "rigid" | "cable" | "textile" | "soft";
type TaskFilter = "all" | TaskCategory;
type EngineCategory = "rigid" | "textile" | "soft";
type EngineFilter = "all" | EngineCategory;

type TrialTask = {
  id: number;
  slug: string;
  category: TaskCategory;
  title: string;
  description: string;
  physics: string[];
  materials: string;
};

type EngineMetric = {
  label: string;
  baseline: string;
  target: "low" | "one" | "zero";
  values: [number | null, number | null, number | null];
};

type EngineResult = {
  task: string;
  category: EngineCategory;
  material: string;
  frames: string;
  note: string;
  metrics: [EngineMetric, EngineMetric];
};

type PaperDetail = {
  kicker: string;
  title: string;
  summary: string;
  items: { label: string; value: string }[];
  footnote?: string;
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

const engineResults: EngineResult[] = [
  { task: "Slope contact", category: "rigid", material: "Plastic", frames: "10", note: "All engines stay comparatively close on this controlled contact case.", metrics: [{ label: "RMSE", baseline: "12.31 (7.62)", target: "low", values: [1.26, 1.60, 1.75] }, { label: "DTW", baseline: "5.30 (1.84)", target: "low", values: [1.83, 2.57, 3.07] }] },
  { task: "Nonsmooth contact", category: "rigid", material: "Plastic", frames: "20", note: "Codimensional contact exposes a marked gap between Isaac Sim and the other solvers.", metrics: [{ label: "RMSE", baseline: "17.67 (6.19)", target: "low", values: [1.53, 10.04, 6.05] }, { label: "DTW", baseline: "8.92 (2.44)", target: "low", values: [1.90, 14.37, 8.01] }] },
  { task: "Slope slider", category: "rigid", material: "Metal", frames: "60", note: "Genesis is marginally strongest for this friction-controlled slide.", metrics: [{ label: "RMSE", baseline: "38.01 (28.53)", target: "low", values: [0.61, 0.58, 1.95] }, { label: "DTW", baseline: "9.54 (8.52)", target: "low", values: [0.71, 0.69, 2.93] }] },
  { task: "Turntable", category: "rigid", material: "Metal", frames: "95", note: "Newton diverges strongly in a rotating non-inertial frame.", metrics: [{ label: "RMSE", baseline: "13.26 (7.43)", target: "low", values: [0.17, 0.57, 20.04] }, { label: "DTW", baseline: "3.33 (0.81)", target: "low", values: [0.61, 2.01, 66.72] }] },
  { task: "Bouncing ball", category: "rigid", material: "Rubber", frames: "18", note: "Rapid impact remains difficult: even the best normalized trajectory error is large.", metrics: [{ label: "RMSE", baseline: "5.29 (3.60)", target: "low", values: [15.63, 22.50, 22.71] }, { label: "DTW", baseline: "4.23 (2.87)", target: "low", values: [5.58, 14.58, 14.89] }] },
  { task: "Newton’s cradle", category: "rigid", material: "Metal", frames: "1,027", note: "Genesis has no valid rollout; the remaining engines transfer only a fraction of momentum.", metrics: [{ label: "LSD", baseline: "0.38 (0.015)", target: "one", values: [0.00, null, 0.00] }, { label: "MTE", baseline: "93.02 (2.47)", target: "one", values: [0.20, null, 0.26] }] },
  { task: "Pendulum", category: "rigid", material: "Metal", frames: "300 / 3,000", note: "Period can appear plausible while energy behavior remains non-physical.", metrics: [{ label: "PD", baseline: "1.14 (0.066)", target: "one", values: [1.10, 2.47, 1.09] }, { label: "EL", baseline: "0.00", target: "zero", values: [11.01, -1.67, 6.87] }] },
  { task: "Textile stretching", category: "textile", material: "Satin", frames: "380", note: "Slow tensile deformation is one of the better-reproduced cloth cases.", metrics: [{ label: "RMSE", baseline: "0.21 (0.42)", target: "low", values: [0.73, 1.51, 0.73] }, { label: "DTW", baseline: "0.21 (0.42)", target: "low", values: [0.76, 1.56, 0.75] }] },
  { task: "Textile bending", category: "textile", material: "Satin", frames: "335", note: "Natural sagging amplifies bending-model differences across all engines.", metrics: [{ label: "RMSE", baseline: "1.92 (0.69)", target: "low", values: [7.94, 11.73, 19.90] }, { label: "DTW", baseline: "1.20 (0.17)", target: "low", values: [11.78, 17.35, 18.82] }] },
  { task: "Textile flinging", category: "textile", material: "Satin", frames: "562", note: "Fast, spatially varying cloth motion reverses the solver ranking.", metrics: [{ label: "RMSE", baseline: "0.016 (0.0056)", target: "low", values: [128.26, 8.54, 9.25] }, { label: "DTW", baseline: "0.012 (0.0014)", target: "low", values: [167.31, 11.27, 12.12] }] },
  { task: "Foam stretching", category: "soft", material: "Soft", frames: "30", note: "All three simulators remain an order of magnitude above the real baseline.", metrics: [{ label: "RMSE", baseline: "8.72 (6.94)", target: "low", values: [16.15, 10.05, 15.46] }, { label: "DTW", baseline: "8.19 (6.93)", target: "low", values: [17.18, 10.65, 16.45] }] },
  { task: "Foam shearing", category: "soft", material: "Soft", frames: "37", note: "Genesis is strongest, but deformation errors remain substantial.", metrics: [{ label: "RMSE", baseline: "5.60 (0.70)", target: "low", values: [26.13, 15.26, 26.57] }, { label: "DTW", baseline: "5.07 (0.59)", target: "low", values: [28.85, 16.74, 29.34] }] },
  { task: "Foam twisting", category: "soft", material: "Soft", frames: "65", note: "Twisting again favors Genesis without approaching real-trial variation.", metrics: [{ label: "RMSE", baseline: "8.07 (0.53)", target: "low", values: [17.14, 10.86, 16.78] }, { label: "DTW", baseline: "7.48 (0.39)", target: "low", values: [18.47, 11.67, 18.07] }] },
  { task: "Foam bending", category: "soft", material: "Soft", frames: "35", note: "Newton narrowly leads bending, confirming that no engine dominates every regime.", metrics: [{ label: "RMSE", baseline: "7.00 (4.39)", target: "low", values: [10.71, 14.43, 10.37] }, { label: "DTW", baseline: "3.52 (1.05)", target: "low", values: [21.28, 27.51, 20.53] }] },
];

const worldScenes = [
  { id: "slope", title: "Slope slider", metric: "QFI", parameter: "Acceleration", baseline: "QFI 0 · 2.58 m/s² (wood)", summary: "Equation-form ranking changes across materials; a low QFI still does not guarantee the correct acceleration.", rows: [
    ["Cosmos3-Nano", [64.89, 2.06], [26.65, 0.90]], ["Cosmos3-Super-I2V", [13.61, 0.13], [569.36, 0.12]], ["Wan-2.2", [393.00, 0.43], [15.74, 0.091]], ["Wan-2.7", [1201.08, 0.061], [558.97, 0.038]], ["Seedance 2.0", [781.51, 0.23], null], ["Genie 3", [40.11, 0.62], null],
  ] },
  { id: "turntable", title: "Turntable", metric: "DE", parameter: "Radial diagnosis", baseline: "DE 0 (wood)", summary: "Force-motion consistency is tested separately from whether the cube visibly slides radially on the turntable.", rows: [
    ["Cosmos3-Nano", [0.078, null], [0.10, null]], ["Cosmos3-Super-I2V", [0.092, null], [0.00, null]], ["Wan-2.2", [0.00, null], [0.00, null]], ["Wan-2.7", [0.18, null], [0.00037, null]], ["Seedance 2.0", [0.00, null], null], ["Genie 3", [0.00, null], null],
  ] },
  { id: "bounce", title: "Bouncing ball", metric: "QFI", parameter: "Acceleration", baseline: "QFI 0 · 9.81 m/s²", summary: "The smoothest fitted law can still encode less than one percent of real gravitational acceleration.", rows: [
    ["Cosmos3-Nano", [2620.05, 0.45], [1125.36, 0.33]], ["Cosmos3-Super-I2V", [270.69, 0.076], [12.50, 0.088]], ["Wan-2.2", [428.39, 0.051], [38.72, 0.064]], ["Wan-2.7", [59.49, 0.16], [16.08, 0.15]], ["Seedance 2.0", [65.16, 1.84], null], ["Genie 3", [88.70, -0.052], null],
  ] },
  { id: "cradle", title: "Newton’s cradle", metric: "MTE", parameter: "Transfer events", baseline: "MTE ≈ 1", summary: "Six of ten reported configurations fail to produce a valid cradle sequence; the best MTE reaches only 0.76.", rows: [
    ["Cosmos3-Nano", [null, null], [null, null]], ["Cosmos3-Super-I2V", [null, null], [null, null]], ["Wan-2.2", [null, null], [0.76, null]], ["Wan-2.7", [0.55, null], [0.48, null]], ["Seedance 2.0", [0.24, null], null], ["Genie 3", [null, null], null],
  ] },
  { id: "pendulum", title: "Pendulum", metric: "R²", parameter: "Period", baseline: "R² 1 · 1.06 s", summary: "Wan-2.2 and Genie 3 reach R² = 0.99, yet their periods are still 1.93 s and 1.90 s.", rows: [
    ["Cosmos3-Nano", [0.86, 2.36], [0.66, 2.93]], ["Cosmos3-Super-I2V", [0.50, 17.95], [0.92, 2.34]], ["Wan-2.2", [0.98, 6.03], [0.99, 1.93]], ["Wan-2.7", [0.71, 1.83], [0.72, 1.87]], ["Seedance 2.0", [0.96, 3.13], null], ["Genie 3", [0.99, 1.90], null],
  ] },
] as const;

const citationText = `@article{wang2026gauge,
  title   = {GAUGE: A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models},
  author  = {Wang, Shuai and Feng, Yaxin and Jiang, Xuekun and Tian, Shihan and Yan, Ningyu and Shen, Xing and Lyu, Chaoyang and Wang, Hui and Zhou, Yunsong and Wang, Hanqing and Pang, Jiangmiao and Xiang, Yang and Gao, Xing and Shen, Chunhua and Zhang, Weinan},
  year    = {2026},
  note    = {Manuscript}
}`;

const taskVariants = (task: TrialTask) => task.id >= 2 && task.id <= 4 ? 3 : 1;
const taskObservable = (task: TrialTask) => task.category === "rigid" ? "6-DoF position P(t)" : task.category === "textile" || task.category === "cable" ? "Gaussian curvature K(t)" : "Triangle area A(t)";

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
        { color: "#7652c8", width: 2, dash: [7, 6], amp: 0.28, drift: -0.015 },
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
    <video ref={videoRef} muted loop playsInline controls={controls} autoPlay preload={controls ? "metadata" : "none"} onError={() => setFailed(true)} aria-label={`${task.title} real-world trial`}>
      {ready && <source src={`/trials/${task.slug}.mp4`} type="video/mp4" />}
    </video>
  );
}

function TaskCard({ task, onOpen }: { task: TrialTask; onOpen: (task: TrialTask) => void }) {
  return (
    <article className="trial-card">
      <button className="trial-media" onClick={() => onOpen(task)} aria-label={`Open ${task.title} trial`}>
        <TrialVideo task={task} />
        <span className="trial-badge">Real trial · {String(task.id).padStart(2, "0")}</span>
        <span className="trial-open">Details <i>↗</i></span>
      </button>
      <div className="trial-meta"><span>{categoryLabels[task.category]}</span><span>{taskVariants(task)} {taskVariants(task) === 1 ? "subtask" : "subtasks"}</span></div>
      <h3><button onClick={() => onOpen(task)}>{task.title}</button></h3>
      <p>{task.description}</p>
      <div className="physics-tags">{task.physics.map((tag) => <span key={tag}>{tag}</span>)}<span>{task.materials}</span></div>
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
      <div className="task-modal-panel expanded-task-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close task detail">×</button>
        <div className="modal-video"><TrialVideo task={task} controls /></div>
        <div className="modal-copy">
          <p className="micro">Task {String(task.id).padStart(2, "0")} · {categoryLabels[task.category]}</p>
          <h3 id="task-modal-title">{task.title}</h3>
          <p>{task.description}</p>
          <dl>
            <div><dt>Diagnostic target</dt><dd>{task.physics.join(" · ")}</dd></div>
            <div><dt>Condition subtasks</dt><dd>{taskVariants(task)}</dd></div>
            <div><dt>Materials</dt><dd>{task.materials}</dd></div>
            <div><dt>Observable</dt><dd>{taskObservable(task)}</dd></div>
            <div><dt>Acquisition</dt><dd>20 real trials · 180 Hz capture · 30 fps evaluation</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function PaperDetailModal({ detail, onClose }: { detail: PaperDetail; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  return (
    <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="paper-detail-title" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="paper-detail-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close detail">×</button>
        <div className="detail-orbit" aria-hidden="true"><span /><i /><b /></div>
        <div className="paper-detail-copy">
          <p className="micro">{detail.kicker}</p>
          <h3 id="paper-detail-title">{detail.title}</h3>
          <p>{detail.summary}</p>
          <dl>{detail.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          {detail.footnote && <small>{detail.footnote}</small>}
        </div>
      </div>
    </div>
  );
}

function metricScore(value: number | null, target: EngineMetric["target"]) {
  if (value === null) return Number.POSITIVE_INFINITY;
  if (target === "one") return Math.abs(value - 1);
  if (target === "zero") return Math.abs(value);
  return value;
}

function MiniMark() {
  return <span className="mini-mark" aria-hidden="true"><i /><b /></span>;
}

export function GaugeDemo() {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [taskView, setTaskView] = useState<"gallery" | "dataset">("gallery");
  const [activeTask, setActiveTask] = useState<TrialTask | null>(null);
  const [taskSort, setTaskSort] = useState<"id" | "title" | "category" | "variants">("id");
  const [engineFilter, setEngineFilter] = useState<EngineFilter>("all");
  const [selectedEngineIndex, setSelectedEngineIndex] = useState(9);
  const [metricIndex, setMetricIndex] = useState<0 | 1>(0);
  const [resultSort, setResultSort] = useState<"order" | "regime">("order");
  const [worldSceneId, setWorldSceneId] = useState("slope");
  const [promptMode, setPromptMode] = useState<"standard" | "negative">("standard");
  const [paperDetail, setPaperDetail] = useState<PaperDetail | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);
  const filteredTasks = useMemo(() => {
    const list = filter === "all" ? [...tasks] : tasks.filter((task) => task.category === filter);
    return list.sort((a, b) => taskSort === "title" ? a.title.localeCompare(b.title) : taskSort === "category" ? a.category.localeCompare(b.category) || a.id - b.id : taskSort === "variants" ? taskVariants(b) - taskVariants(a) || a.id - b.id : a.id - b.id);
  }, [filter, taskSort]);
  const visibleEngineResults = useMemo(() => {
    const list = engineFilter === "all" ? engineResults.map((result, index) => ({ result, index })) : engineResults.map((result, index) => ({ result, index })).filter(({ result }) => result.category === engineFilter);
    return resultSort === "regime" ? list.sort((a, b) => a.result.category.localeCompare(b.result.category)) : list;
  }, [engineFilter, resultSort]);
  const selectedEngine = engineResults[selectedEngineIndex];
  const selectedMetric = selectedEngine.metrics[metricIndex];
  const engineNames = ["Isaac Sim", "Genesis", "Newton"];
  const engineColors = ["#7652c8", "#7f8ba3", "#b7bdc8"];
  const maxMetricLog = Math.max(...selectedMetric.values.filter((value): value is number => value !== null).map((value) => Math.log10(Math.abs(value) + 1)), 0.01);
  const bestEngineScore = Math.min(...selectedMetric.values.map((value) => metricScore(value, selectedMetric.target)));
  const worldScene = worldScenes.find((scene) => scene.id === worldSceneId) ?? worldScenes[0];

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCitationCopied(true);
      window.setTimeout(() => setCitationCopied(false), 2200);
    } catch {
      setCitationCopied(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GAUGE home"><MiniMark /><span>GAUGE</span></a>
        <nav aria-label="Primary navigation"><a href="#protocol">Protocol</a><a href="#benchmark">Benchmark</a><a href="#results">Results</a><a href="#paper">Paper</a></nav>
        <div className="header-actions"><a className="header-cta" href="/gauge.pdf" target="_blank" rel="noreferrer">Read paper <span>↗</span></a><a className="github-link" href="#github-coming-soon" aria-disabled="true" aria-label="GitHub repository coming soon" title="GitHub repository coming soon" onClick={(event) => event.preventDefault()}><MarkGithubIcon size={24} /></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>Measurement-grounded</span> physical fidelity</p>
          <h1 aria-label="Does it move right, or just look right?"><span>Does it</span><span>move right,</span><span>or just <em>look</em></span><span>right?</span></h1>
          <p className="hero-deck">GAUGE diagnoses how simulation engines and video world models reproduce—or violate—real-world physics.</p>
          <div className="hero-actions"><a className="button primary" href="#results">Open the diagnostic</a><a className="button secondary" href="#benchmark">Explore 22 tasks <span>↓</span></a><span className="button code-link code-disabled" aria-label="Code release coming soon"><b>Code</b><small>Coming soon</small></span></div>
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
        <div className="hero-footer"><p className="hero-paper-title"><strong>GAUGE</strong> — A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models</p><div className="authors"><p>Shuai Wang · Yaxin Feng · Xuekun Jiang · Shihan Tian · Ningyu Yan · Xing Shen · Chaoyang Lyu · Hui Wang · Yunsong Zhou · Hanqing Wang · Jiangmiao Pang · Yang Xiang · Xing Gao · Chunhua Shen · Weinan Zhang</p><span>Shanghai AI Laboratory · HKUST · Shanghai Jiao Tong University · Zhejiang University</span></div></div>
      </section>

      <section className="stat-ribbon" aria-label="Benchmark statistics">
        <div><strong>22</strong><span>task families</span></div><div><strong>≈1,560</strong><span>real trials</span></div><div><strong>4</strong><span>physical regimes</span></div><div><strong>2</strong><span>evaluation tracks</span></div>
      </section>

      <section className="section intro" id="protocol">
        <div className="section-kicker">01 / The protocol</div>
        <div className="section-title-grid"><h2>One ground truth.<br />Two complementary tracks.</h2><p>GAUGE starts from repeated real-world experiments, calibrated metadata, and uncertainty—not visual preference. The same foundation diagnoses numerical simulators and generative video models.</p></div>
        <figure className="paper-overview protocol-figure">
          {/* The framework is a local paper figure with fixed intrinsic content. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/paper/overview.png" alt="GAUGE evaluation framework from the paper" />
          <figcaption>The complete GAUGE pipeline: real-world measurements anchor both diagnostic tracks.</figcaption>
        </figure>
        <div className="principle-grid">
          <article><div className="principle-meta"><span>Principle 01</span><b>Ground truth</b></div><h3>Measurement-grounded</h3><p>Sixteen infrared cameras capture motion at 180 Hz. Repeated trials yield millimeter-level trajectories and uncertainty estimates.</p></article>
          <article><div className="principle-meta"><span>Principle 02</span><b>Coverage</b></div><h3>Cross-regime</h3><p>One benchmark spans rigid bodies, flexible cables, textiles, and volumetric soft bodies.</p></article>
          <article><div className="principle-meta"><span>Principle 03</span><b>Readout</b></div><h3>Diagnostic by design</h3><p>Trajectory error, equation form, physical parameters, and temporal stability remain separate signals.</p></article>
        </div>
        <div className="track-map-intro"><span>Two evaluation tracks</span><p>Both begin with the same measured real-world foundation. Track A evaluates numerical simulation; Track B evaluates generated video.</p></div>
        <div className="track-overview">
          <article className="track-column engine-track">
            <header><span className="track-badge">Track A</span><div><h3>Simulation-engine track</h3><p>How accurately does a numerical simulator reproduce measured outcomes?</p></div></header>
            <div className="track-steps"><div><b>A1</b><h4>Reconstruct</h4><p>Match real initial states, geometry, materials, and calibrated parameters.</p></div><div><b>A2</b><h4>Simulate</h4><p>Run Isaac Sim, Genesis, and Newton on fourteen representative task families.</p></div><div><b>A3</b><h4>Compare</h4><p>Measure generalized trajectory error with RMSE, DTW, and task-specific metrics.</p></div></div>
          </article>
          <article className="track-column world-track">
            <header><span className="track-badge">Track B</span><div><h3>Video world-model track</h3><p>Does generated motion obey the right law at the right physical scale?</p></div></header>
            <div className="track-steps"><div><b>B1</b><h4>Condition</h4><p>Provide a shared first frame and a verified task prompt.</p></div><div><b>B2</b><h4>Generate</h4><p>Evaluate six video models on five rigid-body tasks.</p></div><div><b>B3</b><h4>Diagnose</h4><p>Recover SAM3 trajectories and test law form, parameters, and timing.</p></div></div>
          </article>
        </div>
      </section>

      <section className="section benchmark" id="benchmark">
        <div className="section-kicker light">02 / Benchmark task demonstrations</div>
        <div className="section-title-grid light"><h2>22 task families.<br />Four physical regimes.</h2><p>Approximately 1,560 real trials span rigid bodies, flexible cables, textiles, and volumetric soft bodies. Each task isolates a measurable mechanism—from collision and friction to bending, strain, and large deformation.</p></div>
        <div className="atlas-toolbar">
          <div className="task-filter" role="tablist" aria-label="Filter trial tasks">
            {filterOptions.map((option) => <button key={option.key} className={filter === option.key ? "active" : ""} onClick={() => setFilter(option.key)} role="tab" aria-selected={filter === option.key}><span>{option.label}</span><b>{option.count}</b></button>)}
          </div>
          <div className="view-switch" role="tablist" aria-label="Task atlas view"><button className={taskView === "gallery" ? "active" : ""} onClick={() => setTaskView("gallery")} role="tab" aria-selected={taskView === "gallery"}>Gallery</button><button className={taskView === "dataset" ? "active" : ""} onClick={() => setTaskView("dataset")} role="tab" aria-selected={taskView === "dataset"}>Dataset</button></div>
        </div>
        <p className="filter-status" aria-live="polite">Showing {filteredTasks.length} of 22 task families · {taskView} view</p>
        {taskView === "gallery" ? <div className="trial-grid">{filteredTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={setActiveTask} />)}</div> :
          <div className="task-table-panel">
            <div className="table-toolbar"><p aria-live="polite">{filteredTasks.length} task families</p><div><span>Sort</span>{(["id", "title", "category", "variants"] as const).map((key) => <button key={key} className={taskSort === key ? "active" : ""} onClick={() => setTaskSort(key)}>{key === "id" ? "Task" : key === "variants" ? "Subtasks" : key === "category" ? "Regime" : "Name"}</button>)}</div></div>
            <table className="task-data-table">
              <thead><tr><th>Task</th><th>Regime</th><th>Diagnostic target</th><th>Sub.</th><th>Material</th></tr></thead>
              <tbody>{filteredTasks.map((task) => <tr key={task.id} onClick={() => setActiveTask(task)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setActiveTask(task); }}><td><span>{String(task.id).padStart(2, "0")}</span><strong>{task.title}</strong></td><td>{categoryLabels[task.category]}</td><td>{task.physics.join(" · ")}</td><td>{taskVariants(task)}</td><td>{task.materials}</td></tr>)}</tbody>
            </table>
          </div>}
        <div className="paper-detail-cards">
          <button onClick={() => setPaperDetail({ kicker: "Acquisition detail", title: "From millimeter capture to evaluation trajectories", summary: "GAUGE records repeated experiments inside a calibrated 2 m × 2 m × 2 m motion-capture volume.", items: [{ label: "Camera array", value: "16 NOKOV Mars9H infrared cameras across three height levels" }, { label: "Capture rate", value: "180 Hz raw acquisition; processed trajectories downsampled to 30 fps" }, { label: "Repetition", value: "20 independent real-world trials for every evaluation task" }, { label: "Output", value: "Valid intervals and calibrated physical properties stored with trajectories in JSON" }] })}><span>Capture</span><strong>16 cameras · 180 Hz</strong><small>Open acquisition detail ↗</small></button>
          <button onClick={() => setPaperDetail({ kicker: "Calibration detail", title: "The scene is measured, not visually approximated", summary: "Each asset carries task-matched physical metadata so simulator and model outputs can be diagnosed against the same apparatus.", items: [{ label: "Every asset", value: "Dimensions, mass, and density" }, { label: "Rigid contact", value: "Friction and restitution measured for task-specific material pairs" }, { label: "Textiles", value: "Rayon, satin, uniform cloth, Oxford fabric, synthetic leather, and nylon taslan" }, { label: "Soft bodies", value: "Soft and hard foam or rubber variants" }] })}><span>Calibration</span><strong>Mass · friction · restitution</strong><small>Open parameter detail ↗</small></button>
          <button onClick={() => setPaperDetail({ kicker: "Representation detail", title: "One benchmark, three generalized trajectories", summary: "The benchmark does not force different bodies into a single perceptual representation.", items: [{ label: "Rigid", value: "Body-fixed marker frame recovers 6-DoF pose and position P(t)" }, { label: "Textile and cable", value: "Triangulated surface tracking yields Gaussian curvature K(t)" }, { label: "Volumetric soft body", value: "Neighboring marker faces yield triangle area A(t) as local strain" }, { label: "Comparison", value: "RMSE and DTW operate on the regime-appropriate generalized trajectory" }] })}><span>Observables</span><strong>P(t) · K(t) · A(t)</strong><small>Open representation detail ↗</small></button>
        </div>
      </section>

      <section className="section results" id="results">
        <div className="section-kicker">03 / Engine diagnosis</div>
        <div className="section-title-grid"><h2>Physical fidelity is<br />mechanism-specific.</h2><p>No engine stays uniformly faithful across every regime. Dynamic contact, rapid cloth motion, and volumetric deformation expose the widest sim-to-real gaps, while the leading simulator changes from task to task.</p></div>
        <div className="result-filter-bar">
          <div role="tablist" aria-label="Filter engine results">{([{"key":"all","label":"All","count":14},{"key":"rigid","label":"Rigid","count":7},{"key":"textile","label":"Textile","count":3},{"key":"soft","label":"Soft body","count":4}] as const).map((option) => <button key={option.key} className={engineFilter === option.key ? "active" : ""} onClick={() => { setEngineFilter(option.key); const first = option.key === "all" ? 0 : engineResults.findIndex((result) => result.category === option.key); if (first >= 0) setSelectedEngineIndex(first); }} role="tab" aria-selected={engineFilter === option.key}>{option.label} <span>{option.count}</span></button>)}</div>
          <label>Order<select value={resultSort} onChange={(event) => setResultSort(event.target.value as "order" | "regime")}><option value="order">Paper order</option><option value="regime">Physical regime</option></select></label>
        </div>
        <div className="result-workbench">
          <div className="diagnostic-shell">
            <div className="metric-switch" role="tablist" aria-label="Select reported metric">{selectedEngine.metrics.map((metric, index) => <button key={metric.label} className={metricIndex === index ? "active" : ""} onClick={() => setMetricIndex(index as 0 | 1)} role="tab" aria-selected={metricIndex === index}>{metric.label}<small>Baseline {metric.baseline}</small></button>)}</div>
          <div className="diagnostic-main">
              <div className="diagnostic-copy"><p className="micro">{selectedEngine.material} · {selectedEngine.frames} frames · {selectedEngine.category}</p><h3>{selectedEngine.task}</h3><p>{selectedEngine.note}</p><div className="legend-note"><b>{selectedMetric.target === "low" ? "↓ Lower is better" : selectedMetric.target === "one" ? "→ Closer to 1 is better" : "→ Closer to 0 is better"}</b><span>Real mean (σ): {selectedMetric.baseline}</span></div></div>
              <div className="bar-plot">{selectedMetric.values.map((value, index) => { const width = value === null ? 0 : 14 + (Math.log10(Math.abs(value) + 1) / maxMetricLog) * 86; const isBest = metricScore(value, selectedMetric.target) === bestEngineScore; return <div className={`bar-item ${isBest ? "best" : ""}`} key={engineNames[index]}><div className="bar-meta"><span>{engineNames[index]} {isBest && <i>BEST</i>}</span><strong>{value === null ? "—" : value.toFixed(2)}</strong></div><div className="bar-track"><i style={{ width: `${width}%`, background: engineColors[index] }} /></div></div>; })}</div>
            </div>
            <div className="diagnostic-footer"><span>NORMALIZED BY REAL-WORLD BASELINE</span><button onClick={() => setPaperDetail({ kicker: "Metric interpretation", title: `${selectedMetric.label} on ${selectedEngine.task}`, summary: selectedEngine.note, items: [{ label: "Real baseline", value: selectedMetric.baseline }, { label: "Interpretation", value: selectedMetric.target === "low" ? "RMSE and DTW are normalized trajectory errors; lower values indicate closer motion." : selectedMetric.target === "one" ? "This task-specific normalized metric is best when it approaches one." : "Pendulum energy loss is reported raw because its baseline is zero; zero is ideal." }, { label: "Evaluation material", value: selectedEngine.material }, { label: "Recorded frames", value: selectedEngine.frames }] })}>How to read this metric ↗</button></div>
          </div>
          <div className="engine-table-panel">
            <table className="engine-data-table"><thead><tr><th>Task / setup</th><th>{metricIndex === 0 ? "Primary metric" : "Secondary metric"}</th><th>Isaac</th><th>Genesis</th><th>Newton</th><th>Lead</th></tr></thead><tbody>{visibleEngineResults.map(({ result, index }) => { const metric = result.metrics[metricIndex]; const scores = metric.values.map((value) => metricScore(value, metric.target)); const best = Math.min(...scores); const leaders = scores.map((score, engineIndex) => score === best ? engineNames[engineIndex] : null).filter(Boolean).join(" / "); return <tr key={result.task} className={selectedEngineIndex === index ? "active" : ""} onClick={() => setSelectedEngineIndex(index)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedEngineIndex(index); }}><td><strong>{result.task}</strong><small>{result.material} · {result.frames} f</small></td><td><b>{metric.label}</b><small>base {metric.baseline}</small></td>{metric.values.map((value, valueIndex) => <td key={valueIndex} className={scores[valueIndex] === best ? "best" : ""}>{value === null ? "—" : value.toFixed(2)}</td>)}<td><span>{leaders || "No valid result"}</span></td></tr>; })}</tbody></table>
          </div>
        </div>
      </section>

      <section className="section world-models">
        <div className="world-copy"><div className="section-kicker light">04 / World-model diagnosis</div><h2>Video models can look plausible and still predict the wrong physics.</h2><p>These are generated videos, not the real trials above. GAUGE tracks the moving object in every frame, fits the expected law, then checks whether its scale and timing match reality.</p><a href="#world-model-lab">Compare all model readings <span>↓</span></a></div>
        <div className="evidence-stack">
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="metadata"><source src="/world-models/slope-slider.mp4" type="video/mp4" /></video><div className="world-video-label"><span>Seedance 2.0 · Standard prompt</span><b>Slope slider</b></div><div className="world-video-reading"><h3>Looks like a clean slide.</h3><p><strong>0.23 m/s²</strong><span>Recovered acceleration · Real: 2.58 m/s² · QFI: 781.51</span></p></div></article>
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="metadata"><source src="/world-models/pendulum.mp4" type="video/mp4" /></video><div className="world-video-label"><span>Wan-2.7 · Physics-conditioned</span><b>Pendulum</b></div><div className="world-video-reading"><h3>A familiar swing, but the wrong clock.</h3><p><strong>R² 0.72</strong><span>Period: 1.87 s · Real: 1.06 s</span></p></div></article>
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="metadata"><source src="/world-models/bouncing-ball.mp4" type="video/mp4" /></video><div className="world-video-label"><span>Cosmos3-Nano · Standard prompt</span><b>Bouncing ball</b></div><div className="world-video-reading"><h3>A bounce without gravity’s scale.</h3><p><strong>0.45 m/s²</strong><span>Real gravity: 9.81 m/s² · QFI: 2620.05</span></p></div></article>
          <div className="law-callout"><span>KEY FINDING</span><p>Equation-form agreement does not guarantee correct scale or timing.</p></div>
        </div>
        <div className="world-lab" id="world-model-lab">
          <div className="world-scene-tabs" role="tablist" aria-label="World-model evaluation scene">{worldScenes.map((scene) => <button key={scene.id} className={worldScene.id === scene.id ? "active" : ""} onClick={() => setWorldSceneId(scene.id)} role="tab" aria-selected={worldScene.id === scene.id}><span>{scene.title}</span><small>{scene.metric} · {scene.parameter}</small></button>)}</div>
          <article className="world-scene-summary"><div><p>Selected scene</p><h3>{worldScene.title}</h3><span>{worldScene.baseline}</span></div><p>{worldScene.summary}</p><button onClick={() => setPaperDetail({ kicker: "World-model protocol", title: `${worldScene.title}: ${worldScene.metric} and ${worldScene.parameter}`, summary: worldScene.summary, items: [{ label: "Shared input", value: "Every model receives the same initial frame and standardized text prompt" }, { label: "Trajectory recovery", value: "SAM3 segmentation and centroid tracking recover motion directly from pixels" }, { label: "Primary signal", value: worldScene.metric }, { label: "Physical parameter", value: worldScene.parameter }, { label: "Real baseline", value: worldScene.baseline }] })}>Open scene method ↗</button></article>
          <div className="prompt-switch"><span>Generation condition</span><div><button className={promptMode === "standard" ? "active" : ""} onClick={() => setPromptMode("standard")}>Standard prompt</button><button className={promptMode === "negative" ? "active" : ""} onClick={() => setPromptMode("negative")}>+ negative prompt</button></div></div>
          <div className="world-table-panel"><table className="world-data-table"><thead><tr><th>Model</th><th>Condition</th><th>{worldScene.metric}</th><th>{worldScene.parameter}</th><th>Reading</th></tr></thead><tbody>{worldScene.rows.map((row) => { const values = promptMode === "standard" ? row[1] : row[2]; return <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{promptMode === "standard" ? "Standard" : row[2] ? "Negative" : "Unavailable"}</td><td>{values?.[0] === null || values === null ? "—" : values[0]}</td><td>{values?.[1] === null || values === null ? "—" : values[1]}</td><td><span className={values === null || values[0] === null ? "invalid" : "valid"}>{values === null || values[0] === null ? "No valid rollout" : worldScene.metric === "R²" && values[0] >= .95 ? "Strong form fit" : "Valid trajectory"}</span></td></tr>; })}</tbody></table></div>
          <div className="model-roster"><span>Evaluated models</span><p>Cosmos3-Nano · Cosmos3-Super-I2V · Wan-2.2 · Wan-2.7 · Seedance 2.0 · Genie 3</p><small>Five image-to-video models plus one interactive world model. Seedance 2.0 and Genie 3 do not report the negative-prompt condition.</small></div>
        </div>
      </section>

      <section className="section measurement">
        <div className="section-kicker">05 / Measurement language</div>
        <div className="section-title-grid"><h2>Different bodies need<br />different observables.</h2><p>“Observable” simply means the quantity GAUGE follows over time. A rigid object moves as one body; cloth bends as a surface; foam changes local shape. Each therefore needs a different measurement.</p></div>
        <div className="measurement-flow" aria-label="How camera measurements become comparable trajectories"><div><b>01</b><span>Infrared cameras track reflective markers</span></div><i>→</i><div><b>02</b><span>Markers describe the body’s geometry</span></div><i>→</i><div><b>03</b><span>Geometry becomes a trajectory over time</span></div></div>
        <div className="observable-grid">
          <article><div className="observable-icon position"><i /><b>tracked markers</b></div><span>RIGID BODY</span><h3>Position P(t)</h3><p className="observable-question">Question answered: where is the object at each moment?</p><p>The dots are motion-capture markers. Together they form a body-fixed frame that recovers millimeter-scale 3D position and pose.</p><button onClick={() => setPaperDetail({ kicker: "Rigid-body observable", title: "How tracked markers become position P(t)", summary: "A rigid object keeps the same internal shape, so a body-fixed marker frame can describe the motion of the whole object.", items: [{ label: "What the dots mean", value: "Reflective markers observed by the 16-camera motion-capture array" }, { label: "What is reconstructed", value: "A six-degree-of-freedom body pose for every captured frame" }, { label: "Generalized trajectory", value: "3D position and pose P(t), compared through trajectory error" }, { label: "Why it works", value: "The distances between markers remain fixed on a rigid body" }] })}>How P(t) is built <span>↗</span></button></article>
          <article><div className="observable-icon curvature"><i /><i /><i /><b>bending surface</b></div><span>TEXTILE + CABLE</span><h3>Curvature K(t)</h3><p className="observable-question">Question answered: how does the surface bend and fold?</p><p>The arcs represent local patches of a tracked marker mesh. Their Gaussian curvature records distributed deformation over time.</p><button onClick={() => setPaperDetail({ kicker: "Surface observable", title: "How a marker mesh becomes curvature K(t)", summary: "Cloth and cable cannot be reduced to one center point: their changing shape is the physical signal.", items: [{ label: "What the arcs mean", value: "Local patches of the triangulated marker surface" }, { label: "What is reconstructed", value: "The surface geometry around every tracked marker" }, { label: "Generalized trajectory", value: "Marker-wise Gaussian curvature K(t)" }, { label: "Why it works", value: "Curvature preserves bending and folding that a single position would discard" }] })}>How K(t) is built <span>↗</span></button></article>
          <article><div className="observable-icon area"><i /><b>marker triangle</b></div><span>VOLUMETRIC SOFT BODY</span><h3>Triangle area A(t)</h3><p className="observable-question">Question answered: where is the material stretching or compressing?</p><p>Three neighboring surface markers define a face. Its changing area is a local measure of strain and 3D deformation.</p><button onClick={() => setPaperDetail({ kicker: "Volumetric observable", title: "How marker faces become triangle area A(t)", summary: "A soft body changes shape throughout its volume, so GAUGE follows many local surface faces instead of one global point.", items: [{ label: "What the triangle means", value: "A face joining three neighboring tracked surface markers" }, { label: "What is reconstructed", value: "The area of every local face at every frame" }, { label: "Generalized trajectory", value: "Triangle area A(t), a local proxy for strain" }, { label: "Why it works", value: "Area changes expose stretching and compression even when the object remains in place" }] })}>How A(t) is built <span>↗</span></button></article>
        </div>
      </section>

      <section className="paper-cta" id="paper"><div><p className="eyebrow">GAUGE / Conclusion & citation</p><h2>Physical fidelity is mechanism-specific.</h2></div><div className="paper-cta-copy"><ol className="conclusion-list"><li><span>01</span><p>No simulation engine is uniformly faithful across every physical regime.</p></li><li><span>02</span><p>Dynamic contact, rapid cloth motion, and volumetric deformation expose the largest sim-to-real gaps.</p></li><li><span>03</span><p>Video world models can recover equation form while still missing the correct physical scale and timing.</p></li></ol><div className="paper-cta-actions"><a className="button primary" href="#benchmark">Browse the benchmark <span>↑</span></a><a className="button secondary" href="/gauge.pdf" target="_blank" rel="noreferrer">Read the paper <span>↗</span></a></div><div className="citation-box"><div className="citation-head"><span>BibTeX</span><button onClick={copyCitation}>{citationCopied ? "Copied" : "Copy"}</button></div><pre><code>{citationText}</code></pre></div></div></section>
      <footer className="site-footer"><a className="brand" href="#top"><MiniMark /><span>GAUGE</span></a><p>Measurement-grounded physical fidelity for simulation and video world models.</p><span>© 2026 Shanghai Artificial Intelligence Laboratory.</span></footer>
      {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />}
      {paperDetail && <PaperDetailModal detail={paperDetail} onClose={() => setPaperDetail(null)} />}
    </main>
  );
}
