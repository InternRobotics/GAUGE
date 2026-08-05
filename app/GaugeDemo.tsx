"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MarkGithubIcon } from "@primer/octicons-react";
import katex from "katex";

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
  metrics: [EngineMetric, EngineMetric];
};

type PaperDetail = {
  kicker: string;
  title: string;
  summary: string;
  items: { label: string; value: ReactNode }[];
  footnote?: string;
};

const observableFormula = {
  position: String.raw`P(t) \in \mathbb{R}^{3}`,
  curvature: String.raw`K(t) \in \mathbb{R}^{N_m}`,
  area: String.raw`A(t) \in \mathbb{R}^{N_f}`,
} as const;

function InlineMath({ tex, label }: { tex: string; label?: string }) {
  const html = katex.renderToString(tex, {
    displayMode: false,
    output: "htmlAndMathml",
    strict: "error",
    throwOnError: true,
  });

  return <span className="math-inline" aria-label={label} dangerouslySetInnerHTML={{ __html: html }} />;
}

const assetUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const categoryLabels: Record<TaskCategory, string> = {
  rigid: "Rigid body",
  cable: "Cable",
  textile: "Textile",
  soft: "Soft body",
};

const tasks: TrialTask[] = [
  { id: 1, slug: "slope-contact", category: "rigid", title: "Slope Contact", description: "A tri-rectangular tetrahedron falls and collides along a sloped contact surface.", physics: ["Slope collision"], materials: "Wood · Plastic" },
  { id: 2, slug: "nonsmooth-contact", category: "rigid", title: "Nonsmooth Contact", description: "Wedges and pyramids fall into groove-shaped bases with nonsmooth geometry.", physics: ["Codimensional collision"], materials: "Wood · Plastic" },
  { id: 3, slug: "slope-slider", category: "rigid", title: "Slope Slider", description: "A cube slides down an inclined wooden plane under different conditions.", physics: ["Static friction", "Kinetic friction"], materials: "Wood · Plastic · Metal" },
  { id: 4, slug: "turntable", category: "rigid", title: "Turntable", description: "An off-center cube moves on a non-inertial rotating platform", physics: ["Friction", "Non-inertial frame"], materials: "Wood · Plastic · Metal" },
  { id: 5, slug: "bouncing-ball", category: "rigid", title: "Bouncing Ball", description: "A rubber ball repeatedly impacts the ground with diminishing bounce height.", physics: ["Rapid impact", "Restitution"], materials: "Rubber" },
  { id: 6, slug: "newtons-cradle", category: "rigid", title: "Newton’s Cradle", description: "Closely fitted metal balls transfer momentum through successive collisions.", physics: ["Momentum transfer"], materials: "Metal" },
  { id: 7, slug: "wall-breaking", category: "rigid", title: "Wall Breaking", description: "A wrecking ball collides with and breaks a wall assembled from blocks.", physics: ["Dense collision"], materials: "Wood" },
  { id: 8, slug: "pendulum", category: "rigid", title: "Pendulum", description: "A ball on a rigid rod oscillates while gradually losing energy.", physics: ["Periodic motion", "Energy behavior"], materials: "Metal" },
  { id: 9, slug: "rope-winding", category: "cable", title: "Rope Winding", description: "A flexible rope winds while repeatedly making self-contact.", physics: ["Self-collision", "Stretch modulus"], materials: "Rubber" },
  { id: 10, slug: "textile-stretching", category: "textile", title: "Textile Stretching", description: "A fabric sheet is pulled to reveal its local tensile response.", physics: ["Stretch modulus"], materials: "Six fabric types" },
  { id: 11, slug: "textile-bending", category: "textile", title: "Textile Bending", description: "A supported textile sags naturally under gravity and bending resistance.", physics: ["Bending modulus"], materials: "Six fabric types" },
  { id: 12, slug: "textile-flinging", category: "textile", title: "Textile Flinging", description: "Rapid acceleration drives flutter, folding, and air-resistance cloth motion.", physics: ["High-acceleration cloth"], materials: "Six fabric types" },
  { id: 13, slug: "funnel", category: "textile", title: "Funnel", description: "A textile is drawn through a hole.", physics: ["Collision", "Friction"], materials: "Six fabric types" },
  { id: 14, slug: "rotating-ball", category: "textile", title: "Rotating Ball", description: "A rotating ball drives a sheet through distributed surface friction.", physics: ["Static friction", "Kinetic friction"], materials: "Rayon · Satin · Uniform cloth" },
  { id: 15, slug: "tablecloth-pulling", category: "textile", title: "Tablecloth Pulling", description: "A textile is pulled beneath rigid objects.", physics: ["Static friction", "Kinetic friction"], materials: "Wood · Plastic · Metal" },
  { id: 16, slug: "foam-stretching", category: "soft", title: "Foam Stretching", description: "An elastic cuboid is stretched to expose volumetric tensile response.", physics: ["Stretch modulus"], materials: "Soft · Hard foam" },
  { id: 17, slug: "foam-compressing", category: "soft", title: "Foam Compressing", description: "A foam block is compressed while markers measure local deformation.", physics: ["Compression modulus"], materials: "Soft · Hard foam" },
  { id: 18, slug: "foam-shearing", category: "soft", title: "Foam Shearing", description: "Opposing motion shears a foam block and reveals off-axis strain.", physics: ["Shear modulus"], materials: "Soft · Hard foam" },
  { id: 19, slug: "foam-twisting", category: "soft", title: "Foam Twisting", description: "A foam sample twists around its long axis under controlled loading.", physics: ["Twisting modulus"], materials: "Soft · Hard foam" },
  { id: 20, slug: "foam-bending", category: "soft", title: "Foam Bending", description: "A foam beam bends while its surface marker mesh tracks strain.", physics: ["Bending modulus"], materials: "Soft · Hard foam" },
  { id: 21, slug: "stick-stack", category: "soft", title: "Stick-stack", description: "An elastic rod slides and settles against a plane through frictional contact.", physics: ["Static friction", "Kinetic friction"], materials: "Soft · Hard rubber" },
  { id: 22, slug: "cantilever-beam", category: "soft", title: "Cantilever Beam", description: "A cantilever couples materials with strongly contrasting stiffness.", physics: ["Large-stiffness-ratio coupling"], materials: "Soft · Hard foam" },
];

const filterOptions: { key: TaskFilter; label: string; count: number }[] = [
  { key: "all", label: "All", count: 22 },
  { key: "rigid", label: "Rigid body", count: 8 },
  { key: "cable", label: "Cable", count: 1 },
  { key: "textile", label: "Textile", count: 6 },
  { key: "soft", label: "Soft body", count: 7 },
];

const engineResults: EngineResult[] = [
  { task: "Slope contact", category: "rigid", material: "Plastic", frames: "10", metrics: [{ label: "RMSE", baseline: "12.31 (7.62)", target: "low", values: [1.26, 1.60, 1.75] }, { label: "DTW", baseline: "5.30 (1.84)", target: "low", values: [1.83, 2.57, 3.07] }] },
  { task: "Nonsmooth contact", category: "rigid", material: "Plastic", frames: "20", metrics: [{ label: "RMSE", baseline: "17.67 (6.19)", target: "low", values: [1.53, 10.04, 6.05] }, { label: "DTW", baseline: "8.92 (2.44)", target: "low", values: [1.90, 14.37, 8.01] }] },
  { task: "Slope slider", category: "rigid", material: "Metal", frames: "60", metrics: [{ label: "RMSE", baseline: "38.01 (28.53)", target: "low", values: [0.61, 0.58, 1.95] }, { label: "DTW", baseline: "9.54 (8.52)", target: "low", values: [0.71, 0.69, 2.93] }] },
  { task: "Turntable", category: "rigid", material: "Metal", frames: "95", metrics: [{ label: "RMSE", baseline: "13.26 (7.43)", target: "low", values: [0.17, 0.57, 20.04] }, { label: "DTW", baseline: "3.33 (0.81)", target: "low", values: [0.61, 2.01, 66.72] }] },
  { task: "Bouncing ball", category: "rigid", material: "Rubber", frames: "18", metrics: [{ label: "RMSE", baseline: "5.29 (3.60)", target: "low", values: [15.63, 22.50, 22.71] }, { label: "DTW", baseline: "4.23 (2.87)", target: "low", values: [5.58, 14.58, 14.89] }] },
  { task: "Newton’s cradle", category: "rigid", material: "Metal", frames: "1,027", metrics: [{ label: "LSD", baseline: "0.38 (0.015)", target: "one", values: [0.00, null, 0.00] }, { label: "MTE", baseline: "93.02 (2.47)", target: "one", values: [0.20, null, 0.26] }] },
  { task: "Pendulum", category: "rigid", material: "Metal", frames: "300 / 3,000", metrics: [{ label: "PD", baseline: "1.14 (0.066)", target: "one", values: [1.10, 2.47, 1.09] }, { label: "EL", baseline: "0.00", target: "zero", values: [11.01, -1.67, 6.87] }] },
  { task: "Textile stretching", category: "textile", material: "Satin", frames: "380", metrics: [{ label: "RMSE", baseline: "0.21 (0.42)", target: "low", values: [0.73, 1.51, 0.73] }, { label: "DTW", baseline: "0.21 (0.42)", target: "low", values: [0.76, 1.56, 0.75] }] },
  { task: "Textile bending", category: "textile", material: "Satin", frames: "335", metrics: [{ label: "RMSE", baseline: "1.92 (0.69)", target: "low", values: [7.94, 11.73, 19.90] }, { label: "DTW", baseline: "1.20 (0.17)", target: "low", values: [11.78, 17.35, 18.82] }] },
  { task: "Textile flinging", category: "textile", material: "Satin", frames: "562", metrics: [{ label: "RMSE", baseline: "0.016 (0.0056)", target: "low", values: [128.26, 8.54, 9.25] }, { label: "DTW", baseline: "0.012 (0.0014)", target: "low", values: [167.31, 11.27, 12.12] }] },
  { task: "Foam stretching", category: "soft", material: "Soft", frames: "30", metrics: [{ label: "RMSE", baseline: "8.72 (6.94)", target: "low", values: [16.15, 10.05, 15.46] }, { label: "DTW", baseline: "8.19 (6.93)", target: "low", values: [17.18, 10.65, 16.45] }] },
  { task: "Foam shearing", category: "soft", material: "Soft", frames: "37", metrics: [{ label: "RMSE", baseline: "5.60 (0.70)", target: "low", values: [26.13, 15.26, 26.57] }, { label: "DTW", baseline: "5.07 (0.59)", target: "low", values: [28.85, 16.74, 29.34] }] },
  { task: "Foam twisting", category: "soft", material: "Soft", frames: "65", metrics: [{ label: "RMSE", baseline: "8.07 (0.53)", target: "low", values: [17.14, 10.86, 16.78] }, { label: "DTW", baseline: "7.48 (0.39)", target: "low", values: [18.47, 11.67, 18.07] }] },
  { task: "Foam bending", category: "soft", material: "Soft", frames: "35", metrics: [{ label: "RMSE", baseline: "7.00 (4.39)", target: "low", values: [10.71, 14.43, 10.37] }, { label: "DTW", baseline: "3.52 (1.05)", target: "low", values: [21.28, 27.51, 20.53] }] },
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

const worldMaterialReadings = {
  slope: {
    title: "Slope slider across materials",
    note: "The videos above use the wood condition. Table 4 additionally reports plastic and metal, revealing that both equation-form fit and recovered acceleration change with material.",
    columns: "QFI · acceleration (m/s²)",
    materials: [
      { material: "Wood", baseline: "Real baseline · 0 · 2.58", rows: [
        ["Cosmos3-Nano", "64.89 · 2.06", "26.65 · 0.90"], ["Cosmos3-Super-I2V", "13.61 · 0.13", "569.36 · 0.12"], ["Wan-2.2", "393.00 · 0.43", "15.74 · 0.091"], ["Wan-2.7", "1201.08 · 0.061", "558.97 · 0.038"], ["Seedance 2.0", "781.51 · 0.23", "—"], ["Genie 3", "40.11 · 0.62", "—"],
      ] },
      { material: "Plastic", baseline: "Real baseline · 0 · 2.57", rows: [
        ["Cosmos3-Nano", "129.76 · 0.58", "276.49 · 0.22"], ["Cosmos3-Super-I2V", "25.60 · 0.36", "330.31 · 0.030"], ["Wan-2.2", "14.24 · 0.75", "40.12 · 0.16"], ["Wan-2.7", "1164.59 · 0.055", "942.08 · 0.063"], ["Seedance 2.0", "8.69 · 0.20", "—"], ["Genie 3", "67.07 · 0.58", "—"],
      ] },
      { material: "Metal", baseline: "Real baseline · 0 · 2.67", rows: [
        ["Cosmos3-Nano", "4.41 · 0.36", "184.09 · 0.15"], ["Cosmos3-Super-I2V", "1266.40 · 0.056", "924.39 · 0.068"], ["Wan-2.2", "116.64 · 0.24", "6.96 · 0.40"], ["Wan-2.7", "60.70 · 0.046", "1145.94 · 0.038"], ["Seedance 2.0", "730.22 · 0.074", "—"], ["Genie 3", "70.37 · 0.43", "—"],
      ] },
    ],
  },
  turntable: {
    title: "Turntable across materials",
    note: "The videos above use the wood condition. Table 4 reports deviation error (DE) for the same scene instantiated in wood, plastic, and metal.",
    columns: "Deviation error (DE)",
    materials: [
      { material: "Wood", baseline: "Real baseline · 0", rows: [
        ["Cosmos3-Nano", "0.078", "0.10"], ["Cosmos3-Super-I2V", "0.092", "0.00"], ["Wan-2.2", "0.00", "0.00"], ["Wan-2.7", "0.18", "0.00037"], ["Seedance 2.0", "0.00", "—"], ["Genie 3", "0.00", "—"],
      ] },
      { material: "Plastic", baseline: "Real baseline · 0", rows: [
        ["Cosmos3-Nano", "0.11", "0.17"], ["Cosmos3-Super-I2V", "0.0029", "0.11"], ["Wan-2.2", "0.00", "0.00"], ["Wan-2.7", "0.032", "0.050"], ["Seedance 2.0", "0.00", "—"], ["Genie 3", "0.00", "—"],
      ] },
      { material: "Metal", baseline: "Real baseline · 0", rows: [
        ["Cosmos3-Nano", "0.0064", "0.19"], ["Cosmos3-Super-I2V", "0.040", "0.25"], ["Wan-2.2", "0.00048", "0.00"], ["Wan-2.7", "0.12", "0.78"], ["Seedance 2.0", "0.0024", "—"], ["Genie 3", "0.00", "—"],
      ] },
    ],
  },
} as const;

const worldModelCatalog = [
  { id: "cosmos3-nano", name: "Cosmos3-Nano", resolution: "832×480 · 24 fps", hasPhysicsPrompt: true },
  { id: "cosmos3-super-i2v", name: "Cosmos3-Super-I2V", resolution: "832×480 · 24 fps", hasPhysicsPrompt: true },
  { id: "wan-2-2", name: "Wan-2.2", resolution: "832×464 · 16 fps", hasPhysicsPrompt: true },
  { id: "wan-2-7", name: "Wan-2.7", resolution: "1264×728 · 30 fps", hasPhysicsPrompt: true },
  { id: "seedance-2", name: "Seedance 2.0", resolution: "864×496 · 24 fps", hasPhysicsPrompt: false },
  { id: "genie-3", name: "Genie 3", resolution: "1280×704 · 20 fps", hasPhysicsPrompt: false },
] as const;

const worldSceneVideoSlugs: Record<(typeof worldScenes)[number]["id"], string> = {
  slope: "slope-slider",
  turntable: "turntable",
  bounce: "bouncing-ball",
  cradle: "newtons-cradle",
  pendulum: "pendulum",
};

const worldScenePrompts: Record<(typeof worldScenes)[number]["id"], string> = {
  slope: "Static frontal camera view: A 90g wood cube sits near the upper end of a 477g fixed wooden plank. The steep incline of the blank is 30 degree. A linear ruler and digital protractor are placed beside the assembly, all resting on a black perforated optical table. Coefficient of friction between wood and wood is 0.27; coefficient of restitution for the cube is 0.22. Upon release, the cube slides down the inclined surface, and finally lands on the table surface. The wooden plank remains fully stationary for the entire duration of the motion. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.",
  turntable: "Static top camera view: A 90g wood cube is positioned off-center atop a 722g wooden circular turntable driven by an electric motor undergoing a counterclockwise rotation with a constant angular velocity; the full assembly rests on an optical table. Coefficient of friction between the cube and turntable is 0.38; coefficient of restitution is 0.29. During rotation, the wood cube slides on the turntable surface. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.",
  bounce: "Static frontal camera view: A 121g black ball is suspended high above a wooden plank, which is fixed on a black perforated optical table. Coefficient of friction is 0.81; coefficient of restitution is 0.58. When released, the ball undergoes free fall, followed by a sequence of successive bounces with diminishing peak heights, before finally coming to rest on the plank. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.",
  cradle: "Static frontal camera view: A Newton’s cradle assembly is consist of five identical 33g metal balls, and rests atop a black perforated optical table. Four balls hang in contact forming a stationary aligned row; the leftmost ball is pulled back to a nearly horizontal position on its individual suspension string and held propped against the tip of an independent lever mounted to a sliding rail. Upon release, the ball swings back to collide with the stationary row. Momentum transfers sequentially through the chain of balls, launching the terminal ball outward into a swing. The collisions are moderately inelastic, which visibly suppresses the ideal Newton’s cradle behavior across successive oscillation cycles. The coefficient of restitution between balls is 0.20. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.",
  pendulum: "Static frontal camera view: A 318g black metal ball is fixed to the tip of a lightweight rigid rod, which rotates freely about a stationary horizontal axle mounted between two vertical posts atop a black perforated optical table. Initially, the rod angle is 10 degree, with the ball extending out to one side. Upon release, the ball follows pendulum motion: it accelerates downward past the black vertical posts, ascends on the opposite side, and continues oscillating back and forth over numerous cycles, its amplitude slowly and gradually diminishing due to friction. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.",
};

const physicsNegativePrompt = "No adherence to physical laws. Objects defy gravity, pass through solid surfaces, and change mass and momentum without cause. Broken fluid dynamics, cloth simulation, rigid-body physics and conservation of energy; objects gain or lose kinetic energy spontaneously. Elastic collisions produce inelastic results and vice versa. Surface friction is inconsistent: objects slide on rough surfaces or stick to smooth ones. Air resistance affects some objects while others move through air unimpeded.";

const citationText = `@article{wang2026gauge,
  title   = {GAUGE: A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models},
  author  = {Wang, Shuai and Feng, Yaxin and Jiang, Xuekun and Tian, Shihan and Yan, Ningyu and Shen, Xing and Lyu, Chaoyang and Wang, Hui and Zhou, Yunsong and Wang, Hanqing and Pang, Jiangmiao and Xiang, Yang and Gao, Xing and Shen, Chunhua and Zhang, Weinan},
  year    = {2026},
  note    = {Manuscript}
}`;

const taskVariants = (task: TrialTask) => task.id >= 2 && task.id <= 4 ? 3 : 1;
const taskObservable = (task: TrialTask) => task.category === "rigid" ? "6-DoF position P(t)" : task.category === "textile" || task.category === "cable" ? "Gaussian curvature K(t)" : "Triangle area A(t)";
const ENABLE_TRIAL_GALLERY_DETAILS = true;

const heroEngineNames = ["Isaac Sim", "Genesis", "Newton"] as const;
const heroEngineColors = ["#7652c8", "#7185a3", "#d46a3a"] as const;

function metricGap(value: number | null, target: EngineMetric["target"]) {
  if (value === null) return null;
  if (target === "one") return Math.abs(value - 1);
  if (target === "zero") return Math.abs(value);
  return Math.abs(value);
}

// Retained for a future results view after complete per-task coverage is verified.
export function EngineGapChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartMetricIndex, setChartMetricIndex] = useState<0 | 1>(0);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(9);
  const [visibleEngines, setVisibleEngines] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const selectedResult = engineResults[selectedTaskIndex];
  const selectedMetric = selectedResult.metrics[chartMetricIndex];
  const selectedGaps = selectedMetric.values.map((value) => metricGap(value, selectedMetric.target));
  const bestGap = Math.min(...selectedGaps.filter((value): value is number => value !== null));

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
      const inset = { top: 16, right: 12, bottom: 14, left: 43 };
      const plotWidth = w - inset.left - inset.right;
      const plotHeight = h - inset.top - inset.bottom;
      const taskX = (index: number) => inset.left + ((index + 0.5) / engineResults.length) * plotWidth;
      const minLog = -1.3;
      const maxLog = 2.35;
      const gapY = (gap: number) => {
        const log = Math.max(minLog, Math.min(maxLog, Math.log10(Math.max(gap, 0.05))));
        return inset.top + (1 - (log - minLog) / (maxLog - minLog)) * plotHeight;
      };

      const domains = [
        { start: 0, end: 7, fill: "rgba(118, 82, 200, .055)" },
        { start: 7, end: 10, fill: "rgba(43, 102, 214, .045)" },
        { start: 10, end: 14, fill: "rgba(65, 142, 58, .05)" },
      ];
      domains.forEach((domain) => {
        const x = inset.left + (domain.start / engineResults.length) * plotWidth;
        const width = ((domain.end - domain.start) / engineResults.length) * plotWidth;
        ctx.fillStyle = domain.fill;
        ctx.fillRect(x, inset.top, width, plotHeight);
      });

      ctx.font = "11px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      [0.1, 1, 10, 100].forEach((tick) => {
        const y = gapY(tick);
        ctx.beginPath();
        ctx.strokeStyle = tick === 1 ? "rgba(21, 27, 38, .24)" : "rgba(21, 27, 38, .09)";
        ctx.setLineDash(tick === 1 ? [4, 4] : []);
        ctx.moveTo(inset.left, y);
        ctx.lineTo(w - inset.right, y);
        ctx.stroke();
        ctx.fillStyle = "#68717e";
        ctx.fillText(`${tick}x`, inset.left - 7, y);
      });

      [7, 10].forEach((boundary) => {
        const x = inset.left + (boundary / engineResults.length) * plotWidth;
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(21, 27, 38, .18)";
        ctx.moveTo(x, inset.top);
        ctx.lineTo(x, h - inset.bottom);
        ctx.stroke();
      });

      const selectedX = taskX(selectedTaskIndex);
      ctx.fillStyle = "rgba(21, 27, 38, .055)";
      ctx.fillRect(selectedX - plotWidth / engineResults.length / 2, inset.top, plotWidth / engineResults.length, plotHeight);
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(21, 27, 38, .34)";
      ctx.moveTo(selectedX, inset.top);
      ctx.lineTo(selectedX, h - inset.bottom);
      ctx.stroke();

      heroEngineNames.forEach((_, engineIndex) => {
        if (!visibleEngines[engineIndex]) return;
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = heroEngineColors[engineIndex];
        ctx.lineWidth = engineIndex === 0 ? 2.6 : 2.2;
        let drawing = false;
        engineResults.forEach((result, resultIndex) => {
          const gap = metricGap(result.metrics[chartMetricIndex].values[engineIndex], result.metrics[chartMetricIndex].target);
          if (gap === null) { drawing = false; return; }
          const x = taskX(resultIndex);
          const y = gapY(gap);
          if (drawing) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          drawing = true;
        });
        ctx.stroke();

        engineResults.forEach((result, resultIndex) => {
          const gap = metricGap(result.metrics[chartMetricIndex].values[engineIndex], result.metrics[chartMetricIndex].target);
          if (gap === null) return;
          const selected = resultIndex === selectedTaskIndex;
          ctx.beginPath();
          ctx.fillStyle = selected ? "#f8f7f2" : heroEngineColors[engineIndex];
          ctx.strokeStyle = heroEngineColors[engineIndex];
          ctx.lineWidth = selected ? 3 : 1.5;
          ctx.arc(taskX(resultIndex), gapY(gap), selected ? 5.2 : 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      });
      ctx.setLineDash([]);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [chartMetricIndex, selectedTaskIndex, visibleEngines]);

  const setTaskFromPointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const left = 43;
    const right = 12;
    const plotWidth = rect.width - left - right;
    const relative = Math.max(0, Math.min(plotWidth - 1, clientX - rect.left - left));
    setSelectedTaskIndex(Math.floor((relative / plotWidth) * engineResults.length));
  };

  const toggleEngine = (engineIndex: number) => {
    setVisibleEngines((current) => {
      if (current[engineIndex] && current.filter(Boolean).length === 1) return current;
      const next = [...current] as [boolean, boolean, boolean];
      next[engineIndex] = !next[engineIndex];
      return next;
    });
  };

  const directionLabel = selectedMetric.target === "low" ? "lower is better" : selectedMetric.target === "one" ? "closer to 1 is better" : "closer to 0 is better";

  return (
    <>
      <div className="gap-toolbar">
        <div className="gap-metric-switch" role="tablist" aria-label="Metric set">
          <button className={chartMetricIndex === 0 ? "active" : ""} role="tab" aria-selected={chartMetricIndex === 0} onClick={() => setChartMetricIndex(0)}>Primary metric</button>
          <button className={chartMetricIndex === 1 ? "active" : ""} role="tab" aria-selected={chartMetricIndex === 1} onClick={() => setChartMetricIndex(1)}>Secondary metric</button>
        </div>
        <div className="gap-engine-switch" aria-label="Visible simulators">
          {heroEngineNames.map((name, index) => <button key={name} className={visibleEngines[index] ? "active" : ""} aria-pressed={visibleEngines[index]} onClick={() => toggleEngine(index)}><i style={{ backgroundColor: heroEngineColors[index] }} />{name}</button>)}
        </div>
      </div>
      <div className="gap-chart-panel">
        <span className="gap-axis-label">metric-aware gap · log scale</span>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label={`Simulator gap across 14 tasks. Selected ${selectedResult.task}, ${selectedMetric.label}. Use left and right arrow keys to change task.`}
          onMouseMove={(event) => setTaskFromPointer(event.clientX)}
          onClick={(event) => setTaskFromPointer(event.clientX)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); setSelectedTaskIndex((current) => Math.max(0, current - 1)); }
            if (event.key === "ArrowRight") { event.preventDefault(); setSelectedTaskIndex((current) => Math.min(engineResults.length - 1, current + 1)); }
          }}
        />
        <div className="gap-domain-axis" aria-hidden="true"><span>Rigid body · 7</span><span>Textile · 3</span><span>Soft body · 4</span></div>
      </div>
      <div className="gap-readout" aria-live="polite">
        <div className="gap-task-copy"><span>{selectedResult.category} / {selectedMetric.label}</span><strong>{selectedResult.task}</strong><small>{directionLabel} · source: Table 3 in the manuscript</small></div>
        <div className="gap-values">
          {heroEngineNames.map((name, index) => {
            const value = selectedMetric.values[index];
            const gap = selectedGaps[index];
            const best = gap !== null && Math.abs(gap - bestGap) < 1e-9;
            return <div key={name} className={best ? "best" : ""}><span><i style={{ backgroundColor: heroEngineColors[index] }} />{name}</span><strong>{value === null ? "—" : value.toFixed(2)}</strong><small>{best ? "closest" : gap === null ? "no rollout" : `gap ${gap.toFixed(2)}`}</small></div>;
          })}
        </div>
      </div>
      <p className="gap-method">Gap index uses normalized RMSE/DTW directly, |score - 1| for LSD/MTE/PD, and |EL| for energy loss. Lower is better.</p>
    </>
  );
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
      {ready && <source src={assetUrl(`trials/${task.slug}.mp4`)} type="video/mp4" />}
    </video>
  );
}

function TaskCard({ task, onOpen }: { task: TrialTask; onOpen: (task: TrialTask) => void }) {
  const media = <><TrialVideo task={task} /><span className="trial-badge">Real trial · {String(task.id).padStart(2, "0")}</span>{ENABLE_TRIAL_GALLERY_DETAILS && <span className="trial-open">Details <i>↗</i></span>}</>;
  return (
    <article className="trial-card">
      {ENABLE_TRIAL_GALLERY_DETAILS ? <button className="trial-media" onClick={() => onOpen(task)} aria-label={`Open ${task.title} trial`}>{media}</button> : <div className="trial-media trial-media-static" aria-label={`${task.title} trial preview`}>{media}</div>}
      <div className="trial-meta"><span>{categoryLabels[task.category]}</span><span>{taskVariants(task)} {taskVariants(task) === 1 ? "subtask" : "subtasks"}</span></div>
      <h3>{ENABLE_TRIAL_GALLERY_DETAILS ? <button onClick={() => onOpen(task)}>{task.title}</button> : task.title}</h3>
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
  return <svg className="mini-mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="27" y="4" width="10" height="8" rx="3" fill="currentColor" /><path d="M13 20l-5-5M51 20l5-5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><circle cx="32" cy="36" r="21" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M19 39a14 14 0 0 1 26 0" fill="none" stroke="#8d6bd8" strokeWidth="4" strokeLinecap="round" /><path d="M32 36l9-12" fill="none" stroke="#8d6bd8" strokeWidth="4" strokeLinecap="round" /><circle cx="32" cy="36" r="4" fill="currentColor" /></svg>;
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
  const worldVideoGridRef = useRef<HTMLDivElement>(null);
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
  const worldMaterialReading = worldScene.id === "slope" ? worldMaterialReadings.slope : worldScene.id === "turntable" ? worldMaterialReadings.turntable : null;

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCitationCopied(true);
      window.setTimeout(() => setCitationCopied(false), 2200);
    } catch {
      setCitationCopied(false);
    }
  };

  const controlWorldVideos = (action: "play" | "pause" | "restart") => {
    const videos = worldVideoGridRef.current?.querySelectorAll("video") ?? [];
    videos.forEach((video) => {
      if (action === "pause") video.pause();
      if (action === "restart") video.currentTime = 0;
      if (action !== "pause") video.play().catch(() => undefined);
    });
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GAUGE home"><MiniMark /><span>GAUGE</span></a>
        <nav aria-label="Primary navigation"><a href="#protocol">Protocol</a><a href="#benchmark">Benchmark</a><a href="#results">Results</a><a href="#conclusion">Conclusion</a></nav>
        <div className="header-actions"><a className="header-cta" href={assetUrl("gauge.pdf")} target="_blank" rel="noreferrer">Read paper <span>↗</span></a><a className="github-link" href="#github-coming-soon" aria-disabled="true" aria-label="GitHub repository coming soon" title="GitHub repository coming soon" onClick={(event) => event.preventDefault()}><MarkGithubIcon size={24} /></a></div>
      </header>

      <section className="academic-hero" id="top">
        <h1>GAUGE</h1>
        <h2 aria-label="A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models"><span>A Measurement-Grounded Benchmark for Physical Fidelity</span><span>in Simulation Engines and Video World Models</span></h2>
        <p className="academic-deck">Measure physical fidelity against the real world—not only visual plausibility.</p>
        <div className="academic-authors"><p className="author-list"><span className="author-name">Shuai Wang<sup>*</sup></span> · <span className="author-name">Yaxin Feng<sup>*</sup></span> · <span className="author-name">Xuekun Jiang<sup>*</sup></span> · <span className="author-name">Shihan Tian<sup>*</sup></span> · <span className="author-name">Ningyu Yan<sup>*</sup></span> · <span className="author-name">Xing Shen</span> · <span className="author-name">Chaoyang Lyu</span> · <span className="author-name">Hui Wang</span> · <span className="author-name">Yunsong Zhou</span> · <span className="author-name">Hanqing Wang</span> · <span className="author-name">Jiangmiao Pang</span> · <span className="author-name">Yang Xiang</span> · <span className="author-name">Xing Gao<sup title="Corresponding author">✉️</sup></span> · <span className="author-name">Chunhua Shen</span> · <span className="author-name">Weinan Zhang</span></p><span className="affiliations">Shanghai Artificial Intelligence Laboratory · Hong Kong University of Science and Technology · Shanghai Jiao Tong University · Zhejiang University</span><span className="author-note"><b>*</b> Equal contribution · <b>✉️</b> Corresponding author</span></div>
        <div className="academic-actions"><a className="button primary" href={assetUrl("gauge.pdf")} target="_blank" rel="noreferrer">Read the paper <span>↗</span></a><span className="button secondary code-disabled">Code · Coming soon</span><span className="button secondary code-disabled">Dataset · Coming soon</span></div>
        <figure className="academic-framework">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetUrl("paper/overview-hd.png")} alt="GAUGE benchmark framework connecting real-world experiments to simulation-engine and video world-model evaluation tracks" />
          <figcaption><span><strong>Benchmark framework</strong> · both evaluation tracks share the same real-world experimental foundation.</span><a href={assetUrl("paper/overview.pdf")} target="_blank" rel="noreferrer">Open full figure ↗</a></figcaption>
        </figure>
      </section>

      <section className="benchmark-composition" aria-labelledby="composition-title">
        <div className="composition-intro"><p className="section-kicker">Benchmark composition</p><h2 id="composition-title">Benchmark Overview</h2><p>GAUGE comprises approximately 1,560 real-world experimental measurements spanning 22 task families, four physical regimes, and two evaluation tracks.</p></div>
        <div className="composition-grid">
          <article><div className="composition-ring task-ring"><div><strong>22</strong><span>task families</span></div></div><div className="composition-copy"><h3>Four physical regimes</h3><ul className="ring-legend"><li><i className="rigid" />Rigid body <b>8</b></li><li><i className="cable" />Cable <b>1</b></li><li><i className="textile" />Textile <b>6</b></li><li><i className="soft" />Soft body <b>7</b></li></ul></div></article>
          <article><div className="capture-apparatus" aria-label="Sixteen-camera real-world experimental measurement volume at 180 hertz"><i className="capture-node node-a" /><i className="capture-node node-b" /><i className="capture-node node-c" /><i className="capture-node node-d" /><div className="capture-volume-mark"><span>16</span><b>CAMERAS</b></div><small>180 HZ</small></div><div className="composition-copy"><h3>Real-world experimental measurements</h3><p><b>≈1,560 real measurements</b> are captured by 16 infrared cameras within a calibrated volume at <b>180 Hz</b>.</p></div></article>
          <article><div className="composition-ring track-ring"><div><strong>2</strong><span>evaluation tracks</span></div></div><div className="composition-copy"><h3>Shared real-world foundation</h3><ul className="ring-legend track-legend"><li><i className="engine" />Simulation engines <b>14 tasks</b></li><li><i className="world" />Video world models <b>5 tasks</b></li></ul></div></article>
        </div>
      </section>

      <section className="section intro" id="protocol">
        <div className="section-kicker">01 / Evaluation protocol</div>
        <div className="section-title-grid"><h2>One ground truth for<br />two complementary tracks</h2><p>GAUGE starts from repeated real-world experiments, calibrated metadata, and uncertainty—not visual preference. The same foundation diagnoses numerical simulators and generative video models.</p></div>
        <div className="protocol-track-pair">
          <article className="engine-track"><header><span>Track A</span><div><h3>Simulation-engine track</h3><p>Measured states and calibrated materials are reconstructed in Isaac Sim, Genesis, and Newton, then compared through task-specific trajectories.</p></div></header><div className="track-flow"><b>Reconstruct</b><i>→</i><b>Simulate</b><i>→</i><b>Evaluate</b></div><small>14 task families · generalized trajectory metrics</small></article>
          <article className="world-track"><header><span>Track B</span><div><h3>Video world-model track</h3><p>A shared first frame and verified prompt produce rollouts whose recovered trajectories are tested for law form and physical parameters.</p></div></header><div className="track-flow"><b>Condition</b><i>→</i><b>Generate</b><i>→</i><b>Evaluate</b></div><small>5 rigid-body tasks · 6 video models</small></article>
        </div>
      </section>

      <section className="section measurement">
        <div className="section-kicker">02 / Measurement language</div>
        <div className="section-title-grid"><h2>Different bodies need<br />different observables</h2><p>All experiments are captured with reflective markers, but GAUGE does not force every body into the same state description. It derives a regime-specific generalized trajectory according to geometry: position for rigid bodies, curvature for textiles, and local face area for volumetric deformable bodies.</p></div>
        <div className="measurement-map" aria-label="Marker representations mapped to regime-specific generalized trajectories"><div><b>Rigid marker frame</b><span>Object-centre position <strong>P(t)</strong></span></div><i>→</i><div><b>Textile marker mesh</b><span>Marker-wise curvature <strong>K(t)</strong></span></div><i>→</i><div><b>Soft-body surface mesh</b><span>Triangular-face area <strong>A(t)</strong></span></div></div>
        <div className="observable-grid">
          <article><div className="observable-icon position"><i /><b>marker observations → fitted position</b></div><span>RIGID BODY</span><h3>Position P(t)</h3><p className="observable-definition">Generalized trajectory · <InlineMath tex={observableFormula.position} label="P of t belongs to R cubed" /></p><p>Markers fixed to the object define a body-fixed frame at its geometric centre. Motion capture traces the 6-DoF pose; GAUGE uses the frame centre’s 3D position P(t) for trajectory comparison.</p><button onClick={() => setPaperDetail({ kicker: "Rigid-body generalized trajectory", title: "From a marker frame to position P(t)", summary: "The marker dots are not the trajectory themselves: their rigid arrangement lets motion capture fit a body-fixed coordinate frame at the object’s geometric centre.", items: [{ label: "Measured representation", value: "Reflective markers rigidly attached to the object and observed by the 16-camera array" }, { label: "Reconstruction", value: "A 6-DoF body pose is calculated at every time step from the marker configuration" }, { label: "Generalized trajectory", value: <>The reconstructed frame-centre position <InlineMath tex={observableFormula.position} label="P of t belongs to R cubed" /></> }, { label: "Evaluation role", value: "Real and simulated P(t) trajectories are compared through generalized trajectory error" }] })}>How P(t) is derived <span>↗</span></button></article>
          <article><div className="observable-icon curvature"><i /><i /><i /><b>marker mesh → curvature</b></div><span>TEXTILE + CABLE</span><h3>Curvature K(t)</h3><p className="observable-definition">Generalized trajectory · <InlineMath tex={observableFormula.curvature} label="K of t belongs to R to the power N sub m" /></p><p>Neighboring textile markers form a tracked surface mesh. GAUGE computes Gaussian curvature at each marker, preserving distributed bending that a single centre position would discard.</p><button onClick={() => setPaperDetail({ kicker: "Textile generalized trajectory", title: "From a marker mesh to curvature K(t)", summary: "Textile motion is represented by a field over the tracked surface rather than by one object centre.", items: [{ label: "Measured representation", value: "3D positions of markers connected into a tracked surface mesh" }, { label: "Per-marker quantity", value: "Discrete Gaussian curvature computed from the local mesh geometry" }, { label: "Generalized trajectory", value: <><InlineMath tex={observableFormula.curvature} label="K of t belongs to R to the power N sub m" />, with one curvature value for each tracked textile marker</> }, { label: "Evaluation role", value: "The field retains bending and folding patterns across the textile" }] })}>How K(t) is derived <span>↗</span></button></article>
          <article><div className="observable-icon area"><i /><b>mesh faces → area</b></div><span>VOLUMETRIC SOFT BODY</span><h3>Triangle area A(t)</h3><p className="observable-definition">Generalized trajectory · <InlineMath tex={observableFormula.area} label="A of t belongs to R to the power N sub f" /></p><p>Adjacent surface markers form triangular mesh faces. Their areas over time provide a local deformation representation for the volumetric body instead of collapsing it to one point.</p><button onClick={() => setPaperDetail({ kicker: "Deformable-body generalized trajectory", title: "From mesh faces to area A(t)", summary: "Local face areas preserve spatially distributed deformation on the tracked soft-body surface.", items: [{ label: "Measured representation", value: "3D marker positions connected into a triangulated surface mesh" }, { label: "Per-face quantity", value: "Area of every triangular face formed by neighboring markers" }, { label: "Generalized trajectory", value: <><InlineMath tex={observableFormula.area} label="A of t belongs to R to the power N sub f" />, with one area value for each triangular mesh face</> }, { label: "Evaluation role", value: "Area changes expose local deformation throughout the motion" }] })}>How A(t) is derived <span>↗</span></button></article>
        </div>
      </section>

      <section className="section benchmark" id="benchmark">
        <div className="section-kicker light">03 / Benchmark task demonstrations</div>
        <div className="section-title-grid light"><h2>22 task families across<br />four physical regimes</h2><p>Approximately 1,560 real trials span rigid bodies, flexible cables, textiles, and volumetric soft bodies. Each task isolates a measurable mechanism—from collision and friction to bending, strain, and large deformation.</p></div>
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
          <button onClick={() => setPaperDetail({ kicker: "Calibration detail", title: "The scene is measured, not visually approximated", summary: "Each asset carries task-matched physical metadata so simulator and model outputs can be diagnosed against the same apparatus.", items: [{ label: "Every asset", value: "Dimensions, mass, and density" }, { label: "Rigid contact", value: "Friction and restitution measured for task-specific material pairs" }, { label: "Textiles", value: "Stretch stiffness, Shear stiffness, Bending stiffness" }, { label: "Soft bodies", value: "Young's modulus, Poisson's ratio" }] })}><span>Calibration</span><strong>Mass · friction · restitution</strong><small>Open parameter detail ↗</small></button>
          <button onClick={() => setPaperDetail({ kicker: "Representation detail", title: "One benchmark, three generalized trajectories", summary: "The benchmark does not force different bodies into a single perceptual representation.", items: [{ label: "Rigid", value: "Body-fixed marker frame recovers 3D position" }, { label: "Textile", value: "Triangulated surface tracking yields Gaussian curvature K(t)" }, { label: "Volumetric soft body", value: "Neighboring marker faces yield triangle area A(t) as local strain" }, { label: "Comparison", value: "RMSE and DTW operate on the regime-appropriate generalized trajectory" }] })}><span>Observables</span><strong>P(t) · K(t) · A(t)</strong><small>Open representation detail ↗</small></button>
        </div>
      </section>

      <section className="section results" id="results">
        <div className="section-kicker">04 / Simulation-engine diagnosis</div>
        <div className="section-title-grid"><h2>Physical fidelity is<br />mechanism-specific</h2><p>No engine stays uniformly faithful across every regime. Dynamic contact, rapid cloth motion, and volumetric deformation expose the widest sim-to-real gaps, while the leading simulator changes from task to task.</p></div>
        <div className="result-filter-bar">
          <div role="tablist" aria-label="Filter engine results">{([{"key":"all","label":"All","count":14},{"key":"rigid","label":"Rigid","count":7},{"key":"textile","label":"Textile","count":3},{"key":"soft","label":"Soft body","count":4}] as const).map((option) => <button key={option.key} className={engineFilter === option.key ? "active" : ""} onClick={() => { setEngineFilter(option.key); const first = option.key === "all" ? 0 : engineResults.findIndex((result) => result.category === option.key); if (first >= 0) setSelectedEngineIndex(first); }} role="tab" aria-selected={engineFilter === option.key}>{option.label} <span>{option.count}</span></button>)}</div>
          <label>Order<select value={resultSort} onChange={(event) => setResultSort(event.target.value as "order" | "regime")}><option value="order">Paper order</option><option value="regime">Physical regime</option></select></label>
        </div>
        <div className="result-workbench">
          <div className="diagnostic-shell">
            <div className="metric-switch" role="tablist" aria-label="Select reported metric">{selectedEngine.metrics.map((metric, index) => <button key={metric.label} className={metricIndex === index ? "active" : ""} onClick={() => setMetricIndex(index as 0 | 1)} role="tab" aria-selected={metricIndex === index}>{metric.label}<small>Baseline {metric.baseline}</small></button>)}</div>
          <div className="diagnostic-main">
              <div className="diagnostic-copy"><p className="micro">{selectedEngine.material} · {selectedEngine.frames} frames · {selectedEngine.category}</p><h3>{selectedEngine.task}</h3><div className="legend-note"><b>{selectedMetric.target === "low" ? "↓ Lower is better" : selectedMetric.target === "one" ? "→ Closer to 1 is better" : "→ Closer to 0 is better"}</b><span>Real mean (σ): {selectedMetric.baseline}</span></div></div>
              <div className="bar-plot">{selectedMetric.values.map((value, index) => { const width = value === null ? 0 : 14 + (Math.log10(Math.abs(value) + 1) / maxMetricLog) * 86; const isBest = metricScore(value, selectedMetric.target) === bestEngineScore; return <div className={`bar-item ${isBest ? "best" : ""}`} key={engineNames[index]}><div className="bar-meta"><span>{engineNames[index]} {isBest && <i>BEST</i>}</span><strong>{value === null ? "—" : value.toFixed(2)}</strong></div><div className="bar-track"><i style={{ width: `${width}%`, background: engineColors[index] }} /></div></div>; })}</div>
            </div>
            <div className="diagnostic-footer"><span>NORMALIZED BY REAL-WORLD BASELINE</span><button onClick={() => setPaperDetail({ kicker: "Metric interpretation", title: `${selectedMetric.label} on ${selectedEngine.task}`, summary: "Manuscript-reported values for the selected evaluation task and metric.", items: [{ label: "Real baseline", value: selectedMetric.baseline }, { label: "Interpretation", value: selectedMetric.target === "low" ? "RMSE and DTW are normalized trajectory errors; lower values indicate closer motion." : selectedMetric.target === "one" ? "This task-specific normalized metric is best when it approaches one." : "Pendulum energy loss is reported raw because its baseline is zero; zero is ideal." }, { label: "Evaluation material", value: selectedEngine.material }, { label: "Recorded frames", value: selectedEngine.frames }] })}>How to read this metric ↗</button></div>
          </div>
          <div className="engine-table-panel">
            <table className="engine-data-table"><thead><tr><th>Task / setup</th><th>{metricIndex === 0 ? "Primary metric" : "Secondary metric"}</th><th>Isaac</th><th>Genesis</th><th>Newton</th></tr></thead><tbody>{visibleEngineResults.map(({ result, index }) => { const metric = result.metrics[metricIndex]; const scores = metric.values.map((value) => metricScore(value, metric.target)); const best = Math.min(...scores); return <tr key={result.task} className={selectedEngineIndex === index ? "active" : ""} onClick={() => setSelectedEngineIndex(index)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedEngineIndex(index); }}><td><strong>{result.task}</strong><small>{result.material} · {result.frames} f</small></td><td><b>{metric.label}</b><small>base {metric.baseline}</small></td>{metric.values.map((value, valueIndex) => <td key={valueIndex} className={scores[valueIndex] === best ? "best" : ""}>{value === null ? "—" : value.toFixed(2)}</td>)}</tr>; })}</tbody></table>
          </div>
        </div>
      </section>

      <section className="section world-models">
        <div className="world-copy"><div className="section-kicker light">05 / Video world-model diagnosis</div><h2 aria-label="Generated videos can look plausible yet still predict the wrong physics"><span>Generated videos</span><span>can look plausible</span><span>yet still predict</span><span>the wrong physics</span></h2><p>GAUGE tracks the moving object of each generated video, fits the expected law, then checks whether its law form and physical parameters match reality.</p><a href="#world-model-lab">Compare all model readings <span>↓</span></a></div>
        <div className="evidence-stack">
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="metadata"><source src={assetUrl("world-model-results/slope-slider/standard/cosmos3-super-i2v.mp4")} type="video/mp4" /></video><div className="world-video-label"><span>Cosmos3-Super-I2V · Standard prompt</span><b>Slope slider</b></div><div className="world-video-reading"><h3>The slide accelerates, but at the wrong rate.</h3><p><strong>0.13 m/s²</strong><span>Recovered acceleration · Real: 2.58 m/s² · QFI: 13.61</span></p></div></article>
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="metadata"><source src={assetUrl("world-model-results/pendulum/physics/wan-2-2.mp4")} type="video/mp4" /></video><div className="world-video-label"><span>Wan-2.2 · Negative prompt</span><b>Pendulum</b></div><div className="world-video-reading"><h3>The swing trend fits, but the period is wrong.</h3><p><strong>1.93 s</strong><span>Recovered period · Real: 1.06 s · R²: 0.99</span></p></div></article>
          <article className="world-video-card"><video autoPlay muted loop playsInline preload="auto"><source src={assetUrl("world-model-results/bouncing-ball/standard/seedance-2.mp4")} type="video/mp4" /></video><div className="world-video-label"><span>Seedance 2.0 · Standard prompt</span><b>Bouncing ball</b></div><div className="world-video-reading"><h3>The ball falls and rebounds, but gravity is still too weak.</h3><p><strong>1.84 m/s²</strong><span>Recovered free-fall acceleration · Real: 9.81 m/s² · QFI: 65.16</span></p></div></article>
          <div className="law-callout"><span>KEY FINDING</span><p>Equation-form agreement does not guarantee correct physical parameters.</p></div>
        </div>
        <div className="world-lab" id="world-model-lab">
          <div className="world-scene-tabs" role="tablist" aria-label="World-model evaluation scene">{worldScenes.map((scene) => <button key={scene.id} className={worldScene.id === scene.id ? "active" : ""} onClick={() => setWorldSceneId(scene.id)} role="tab" aria-selected={worldScene.id === scene.id}><span>{scene.title}</span><small>{scene.metric} · {scene.parameter}</small></button>)}</div>
          <article className="world-scene-summary"><div><p>Selected scene</p><h3>{worldScene.title}</h3><span>{worldScene.baseline}</span></div><p>{worldScene.summary}</p><button onClick={() => setPaperDetail({ kicker: "World-model protocol", title: `${worldScene.title}: ${worldScene.metric} and ${worldScene.parameter}`, summary: worldScene.summary, items: [{ label: "Shared input", value: "Every model receives the same initial frame and standardized text prompt" }, { label: "Trajectory recovery", value: "SAM3 segmentation and centroid tracking recover motion directly from pixels" }, { label: "Primary signal", value: worldScene.metric }, { label: "Physical parameter", value: worldScene.parameter }, { label: "Real baseline", value: worldScene.baseline }] })}>Open scene method ↗</button></article>
          <div className="world-explorer-toolbar"><div className="prompt-switch"><span>Generation condition</span><div><button className={promptMode === "standard" ? "active" : ""} onClick={() => setPromptMode("standard")}>Standard prompt</button><button className={promptMode === "negative" ? "active" : ""} onClick={() => setPromptMode("negative")}>Physics-negative prompt</button></div></div><div className="playback-controls" aria-label="Video playback controls"><button onClick={() => controlWorldVideos("play")}>Play all</button><button onClick={() => controlWorldVideos("pause")}>Pause</button><button onClick={() => controlWorldVideos("restart")}>Restart</button></div></div>
          <div className="world-result-grid" ref={worldVideoGridRef}>
            {worldModelCatalog.map((model, modelIndex) => {
              const row = worldScene.rows[modelIndex];
              const values = promptMode === "standard" ? row[1] : row[2];
              const available = promptMode === "standard" || model.hasPhysicsPrompt;
              const videoPath = available ? assetUrl(`world-model-results/${worldSceneVideoSlugs[worldScene.id]}/${promptMode === "standard" ? "standard" : "physics"}/${model.id}.mp4`) : null;
              const hasTrajectory = values !== null && values[0] !== null;
              const promptId = `prompt-${worldScene.id}-${promptMode}-${model.id}`;
              return <article className={`world-result-card ${available ? "" : "unavailable"}`} key={`${worldScene.id}-${promptMode}-${model.id}`}><header><div><span>Video world model</span><h3>{model.name}</h3></div><small>{model.resolution}</small></header>{videoPath ? <div className="world-result-media" tabIndex={0} aria-describedby={promptId}><video key={videoPath} src={videoPath} controls muted loop playsInline preload="auto" aria-label={`${model.name} ${promptMode} output for ${worldScene.title}`} /><div className="world-prompt-popover" id={promptId} role="tooltip"><span>Prompt used</span><p>{worldScenePrompts[worldScene.id]}</p>{promptMode === "negative" && <><b>Physics-negative addition</b><p>{physicsNegativePrompt}</p></>}</div><span className="world-prompt-hint" aria-hidden="true">Hover for prompt</span></div> : <div className="world-video-unavailable"><strong>—</strong><p>No separate negative-prompt rollout</p></div>}<div className="world-result-reading"><div><span>{worldScene.metric}</span><strong>{values === null || values[0] === null ? "—" : values[0]}</strong></div><div><span>{worldScene.parameter}</span><strong>{values === null || values[1] === null ? "—" : values[1]}</strong></div><small className={hasTrajectory ? "valid" : "invalid"}>{!available ? "Condition unavailable" : hasTrajectory ? worldScene.metric === "R²" && Number(values?.[0]) >= .95 ? "Strong equation-form fit" : "Valid recovered trajectory" : "No valid trajectory"}</small></div></article>;
            })}
          </div>
          <details className="world-data-disclosure"><summary>Exact reported values <span>Open table ↓</span></summary><div className="world-table-panel"><table className="world-data-table"><thead><tr><th>Model</th><th>Condition</th><th>{worldScene.metric}</th><th>{worldScene.parameter}</th></tr></thead><tbody>{worldScene.rows.map((row) => { const values = promptMode === "standard" ? row[1] : row[2]; return <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{promptMode === "standard" ? "Standard" : row[2] ? "Physics-negative" : "Unavailable"}</td><td>{values?.[0] === null || values === null ? "—" : values[0]}</td><td>{values?.[1] === null || values === null ? "—" : values[1]}</td></tr>; })}</tbody></table></div></details>
          {worldMaterialReading && <details className="world-material-disclosure"><summary><span><b>Complete material readings</b><small>Table 4 · Wood, plastic, and metal</small></span><em>Open matrix ↗</em></summary><div className="world-material-body"><header><div><span>Material-level results</span><h3>{worldMaterialReading.title}</h3></div><p>{worldMaterialReading.note}</p></header><div className="world-material-grid">{worldMaterialReading.materials.map((material) => <article className="world-material-card" key={material.material}><header><div><h4>{material.material}</h4><span>{material.baseline}</span></div><small>{worldMaterialReading.columns}</small></header><div className="world-material-columns"><span>Model</span><span>Standard</span><span>Physics-negative</span></div>{material.rows.map((row) => <div className="world-material-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span></div>)}</article>)}</div><p className="world-material-footnote">A dash marks an unavailable physics-negative generation. Lower is better for QFI and DE; acceleration is compared with the measured real-world baseline.</p></div></details>}
          <p className="world-explorer-note">Six models are compared on the same scene and first frame. Seedance 2.0 and Genie 3 do not expose a separate physics-negative condition.</p>
        </div>
      </section>

      <section className="paper-cta" id="conclusion"><div><p className="eyebrow">GAUGE / Conclusion</p><h2>Physical fidelity is mechanism-specific</h2></div><div className="paper-cta-copy"><ol className="conclusion-list"><li><span>01</span><p>No simulation engine is uniformly faithful across every physical regime.</p></li><li><span>02</span><p>Dynamic contact, rapid cloth motion, and volumetric deformation expose the largest sim-to-real gaps.</p></li><li><span>03</span><p>Video world models can recover equation form while still missing the correct physical parameters.</p></li></ol><div className="paper-cta-actions"><a className="button primary" href="#benchmark">Browse the benchmark <span>↑</span></a><a className="button secondary" href={assetUrl("gauge.pdf")} target="_blank" rel="noreferrer">Read the paper <span>↗</span></a></div></div></section>

      <section className="citation-section" id="citation"><div className="citation-shell"><header className="citation-intro"><h2>Citation</h2><p>If you use GAUGE or its benchmark in your research, please cite the work below.</p></header><div className="citation-box"><div className="citation-head"><span>BibTeX</span><button onClick={copyCitation}>{citationCopied ? "Copied" : "Copy"}</button></div><pre><code>{citationText}</code></pre></div></div></section>
      <footer className="site-footer"><a className="brand" href="#top"><MiniMark /><span>GAUGE</span></a><p>Measurement-grounded physical fidelity for simulation and video world models.</p><span>© 2026 Shanghai Artificial Intelligence Laboratory.</span></footer>
      {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />}
      {paperDetail && <PaperDetailModal detail={paperDetail} onClose={() => setPaperDetail(null)} />}
    </main>
  );
}
