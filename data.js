const GAUGE_TASKS = [
  { id: 1, category: 'rigid', title: 'Slope Contact', description: 'A tri-rectangular tetrahedron falls and collides along a sloped contact surface.', physics: ['Slope collision'], materials: ['Wood', 'Plastic'], video: 'task video/slope contact/1.mp4' },
  { id: 2, category: 'rigid', title: 'Nonsmooth Contact', description: 'Wedges and pyramids fall into groove-shaped bases with non-smooth geometry.', physics: ['Codimensional collision'], materials: ['Wood', 'Plastic'], video: 'task video/nonsmooth contact/1.mp4' },
  { id: 3, category: 'rigid', title: 'Slope Slider', description: 'A cube slides down an inclined wooden plank.', physics: ['Static friction', 'Kinetic friction'], materials: ['Wood', 'Plastic', 'Metal'], video: 'task video/slope slider/1.mp4' },
  { id: 4, category: 'rigid', title: 'Turntable', description: 'An off-center cube moves on a rotating circular platform.', physics: ['Friction', 'Non-inertial frame'], materials: ['Wood', 'Plastic', 'Metal'], video: 'task video/turntable/1.mp4' },
  { id: 5, category: 'rigid', title: 'Bouncing Ball', description: 'A rubber ball falls, impacts a plank, and undergoes diminishing bounces.', physics: ['Rapid impact', 'Restitution'], materials: ['Rubber'], video: 'task video/bouncing ball/1.mp4' },
  { id: 6, category: 'rigid', title: "Newton's Cradle", description: 'Closely fitted balls transfer momentum through repeated collisions.', physics: ['Momentum transfer'], materials: ['Metal'], video: "task video/newton's cradle/1.mp4" },
  { id: 7, category: 'rigid', title: 'Wall Breaking', description: 'A wrecking ball collides with and breaks a block wall.', physics: ['Dense collision'], materials: ['Wood'], video: 'task video/wall breaking/1.mp4' },
  { id: 8, category: 'rigid', title: 'Pendulum', description: 'A ball attached to a rigid rod oscillates around a pivot.', physics: ['Periodic motion', 'Energy behavior'], materials: ['Metal'], video: 'task video/pendulum/1.mp4' },
  { id: 9, category: 'cable', title: 'Rope Winding', description: 'A flexible rope winds around supports while contacting itself.', physics: ['Self-collision', 'Stretch modulus'], materials: ['Rubber'], video: 'task video/rope winding/1.mp4' },
  { id: 10, category: 'textile', title: 'Textile Stretching', description: 'A textile sheet is pulled to produce tensile deformation.', physics: ['Stretch modulus'], materials: ['Six fabric types'], video: 'task video/textile stretching/1.mp4' },
  { id: 11, category: 'textile', title: 'Textile Bending', description: 'A textile sheet sags naturally under gravity.', physics: ['Bending modulus'], materials: ['Six fabric types'], video: 'task video/textile bending/1.mp4' },
  { id: 12, category: 'textile', title: 'Textile Flinging', description: 'A textile is rapidly accelerated and allowed to flutter.', physics: ['High-acceleration cloth dynamics'], materials: ['Six fabric types'], video: 'task video/textile flinging/2.mp4' },
  { id: 13, category: 'textile', title: 'Funnel', description: 'A textile passes through a constrained opening.', physics: ['Collision', 'Friction'], materials: ['Six fabric types'], video: 'task video/funnel/1.mp4' },
  { id: 14, category: 'textile', title: 'Rotating Ball', description: 'A rotating ball drives motion in a textile sheet.', physics: ['Static friction', 'Kinetic friction'], materials: ['Rayon', 'Satin', 'Uniform cloth'], video: 'task video/rotating ball/1.mp4' },
  { id: 15, category: 'textile', title: 'Tablecloth Pulling', description: 'A textile is pulled from beneath rigid objects.', physics: ['Static friction', 'Kinetic friction'], materials: ['Wood', 'Plastic', 'Metal'], video: 'task video/tablecloth pulling/1.mp4' },
  { id: 16, category: 'soft-body', title: 'Foam Stretching', description: 'An elastic cuboid is stretched along one axis.', physics: ['Stretching modulus'], materials: ['Soft', 'Hard'], video: 'task video/foam stretching/1.mp4' },
  { id: 17, category: 'soft-body', title: 'Foam Compressing', description: 'An elastic cuboid is compressed.', physics: ['Compression modulus'], materials: ['Soft', 'Hard'], video: 'task video/foam compressing/1.mp4' },
  { id: 18, category: 'soft-body', title: 'Foam Shearing', description: 'An elastic cuboid undergoes shear deformation.', physics: ['Shear modulus'], materials: ['Soft', 'Hard'], video: 'task video/foam shearing/1.mp4' },
  { id: 19, category: 'soft-body', title: 'Foam Twisting', description: 'An elastic cuboid is twisted around its long axis.', physics: ['Twisting modulus'], materials: ['Soft', 'Hard'], video: 'task video/foam twisting/1.mp4' },
  { id: 20, category: 'soft-body', title: 'Foam Bending', description: 'An elastic cuboid bends under imposed motion.', physics: ['Bending modulus'], materials: ['Soft', 'Hard'], video: 'task video/foam bending/1.mp4' },
  { id: 21, category: 'soft-body', title: 'Stick-stack', description: 'An elastic rod slides on a planar surface.', physics: ['Static friction', 'Kinetic friction'], materials: ['Soft', 'Hard'], video: 'task video/stick-stack/1.mp4' },
  { id: 22, category: 'soft-body', title: 'Cantilever Beam', description: 'A soft cantilever hangs freely under a large stiffness contrast.', physics: ['Large-stiffness-ratio coupling'], materials: ['Soft', 'Hard'], video: 'task video/cantilever beam/1.mp4' }
];

const NEGATIVE_PROMPT = 'No adherence to physical laws. Objects defy gravity, pass through solid surfaces, and change mass and momentum without cause. Broken fluid dynamics, cloth simulation, rigid-body physics and conservation of energy; objects gain or lose kinetic energy spontaneously. Elastic collisions produce inelastic results and vice versa. Surface friction is inconsistent: objects slide on rough surfaces or stick to smooth ones. Air resistance affects some objects while others move through air unimpeded.';

const GAUGE_SCENES = [
  {
    id: 'C3', title: 'Slope Slider', token: { wood: 'C3_wood', plastic: 'C3_plastic', metal: 'C3_metal' }, materials: ['wood', 'plastic', 'metal'], metric: 'QFI ↓ · acceleration (closer to baseline)',
    frame: { wood: 'C3/C3_wood.png', plastic: 'C3/C3_plastic.png', metal: 'C3/C3_mental.png' },
    metadata: {
      wood: [['Object', '90 g wood cube'], ['Incline', '30°'], ['Friction', '0.27'], ['Restitution', '0.22']],
      plastic: [['Object', '147 g plastic cube'], ['Incline', '30°'], ['Friction', '0.28'], ['Restitution', '0.38']],
      metal: [['Object', '340 g metal cube'], ['Incline', '30°'], ['Friction', '0.26'], ['Restitution', '0.33']]
    },
    prompt: {
      wood: 'Static frontal camera view: A 90g wood cube sits near the upper end of a 477g fixed wooden plank. The steep incline of the blank is 30 degree. A linear ruler and digital protractor are placed beside the assembly, all resting on a black perforated optical table. Coefficient of friction between wood and wood is 0.27; coefficient of restitution for the cube is 0.22. Upon release, the cube slides down the inclined surface, and finally lands on the table surface. The wooden plank remains fully stationary for the entire duration of the motion. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.',
      plastic: 'Static frontal camera view: A 147g black plastic cube sits near the upper end of a 477g fixed wooden plank. The steep incline of the blank is 30 degree. A linear ruler and digital protractor are placed beside the assembly, all resting on a black perforated optical table. Coefficient of friction between plastic and wood is 0.28; coefficient of restitution for the cube is 0.38. Upon release, the cube slides down the inclined surface, and finally lands on the table surface. The wooden plank remains fully stationary for the entire duration of the motion. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.',
      metal: 'Static frontal camera view: A 340g silver metal cube sits near the upper end of a 477g fixed wooden plank. The steep incline of the blank is 30 degree. A linear ruler and digital protractor are placed beside the assembly, all resting on a black perforated optical table. Coefficient of friction between plastic and wood is 0.26; coefficient of restitution for the cube is 0.33. Upon release, the cube slides down the inclined surface, and finally lands on the table surface. The wooden plank remains fully stationary for the entire duration of the motion. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.'
    }
  },
  {
    id: 'C4', title: 'Turntable', token: { wood: 'C4_wood', plastic: 'C4_plastic', metal: 'C4_metal' }, materials: ['wood', 'plastic', 'metal'], metric: 'Dynamic Error ↓ · radial sliding flag',
    frame: { wood: 'C4/C4_wood.png', plastic: 'C4/C4_plastic.png', metal: 'C4/C4_mental.png' },
    metadata: {
      wood: [['Object', '90 g wood cube'], ['Turntable', '722 g wood'], ['Friction', '0.38'], ['Restitution', '0.29']],
      plastic: [['Object', '147 g plastic cube'], ['Turntable', '722 g wood'], ['Friction', '0.32'], ['Restitution', '≈0.32']],
      metal: [['Object', '340 g metal cube'], ['Turntable', '722 g wood'], ['Friction', '0.33'], ['Restitution', '≈0.23']]
    },
    prompt: {
      wood: 'Static top camera view: A 90g wood cube is positioned off-center atop a 722g wooden circular turntable driven by an electric motor undergoing a counterclockwise rotation with a constant angular velocity; the full assembly rests on an optical table. Coefficient of friction between the cube and turntable is 0.38; coefficient of restitution is 0.29. During rotation, the wood cube slides on the turntable surface. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.',
      plastic: 'Static top camera view: A 147g black plastic cube is positioned off-center atop a 722g wooden circular turntable driven by an electric motor undergoing a counterclockwise rotation with a constant angular velocity; the full assembly rests on an optical table. Coefficient of friction between the cube and turntable is 0.32; coefficient of restitution is approximately 0.32. During rotation, the wood cube slides on the turntable surface. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.',
      metal: 'Static top camera view: A 340g silver metal cube is positioned off-center atop a 722g wooden circular turntable driven by an electric motor undergoing a counterclockwise rotation with a constant angular velocity; the full assembly rests on an optical table. Coefficient of friction between the cube and turntable is 0.33; coefficient of restitution is approximately 0.23. During rotation, the wood cube slides on the turntable surface. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.'
    }
  },
  {
    id: 'C5', title: "Newton's Cradle", token: 'C5-3', materials: [], metric: 'Momentum Transfer Efficiency ↑', frame: 'C5/frame_0_first_frame.png',
    metadata: [['Assembly', 'Five 33 g metal balls'], ['Restitution', '0.20'], ['Observable', 'Transfer events']],
    prompt: 'Static frontal camera view: A Newton’s cradle assembly is consist of five identical 33g metal balls, and rests atop a black perforated optical table. Four balls hang in contact forming a stationary aligned row; the leftmost ball is pulled back to a nearly horizontal position on its individual suspension string and held propped against the tip of an independent lever mounted to a sliding rail. Upon release, the ball swings back to collide with the stationary row. Momentum transfers sequentially through the chain of balls, launching the terminal ball outward into a swing. The collisions are moderately inelastic, which visibly suppresses the ideal Newton’s cradle behavior across successive oscillation cycles. The coefficient of restitution between balls is 0.20. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.'
  },
  {
    id: 'C7', title: 'Pendulum', token: 'C7-1', materials: [], metric: 'R² ↑ · period (closer to 1.06 s)', frame: 'C7/frame_0_first_frame.png',
    metadata: [['Object', '318 g metal ball'], ['Initial angle', '10°'], ['Real period', '1.06 s']],
    prompt: 'Static frontal camera view: A 318g black metal ball is fixed to the tip of a lightweight rigid rod, which rotates freely about a stationary horizontal axle mounted between two vertical posts atop a black perforated optical table. Initially, the rod angle is 10 degree, with the ball extending out to one side. Upon release, the ball follows pendulum motion: it accelerates downward past the black vertical posts, ascends on the opposite side, and continues oscillating back and forth over numerous cycles, its amplitude slowly and gradually diminishing due to friction. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.'
  },
  {
    id: 'C19', title: 'Bouncing Ball', token: 'C19', materials: [], metric: 'QFI ↓ · acceleration (closer to 9.81 m/s²)', frame: 'C19/frame_0_first_frame.png',
    metadata: [['Object', '121 g black ball'], ['Friction', '0.81'], ['Restitution', '0.58'], ['Real acceleration', '9.81 m/s²']],
    prompt: 'Static frontal camera view: A 121g black ball is suspended high above a wooden plank, which is fixed on a black perforated optical table. Coefficient of friction is 0.81; coefficient of restitution is 0.58. When released, the ball undergoes free fall, followed by a sequence of successive bounces with diminishing peak heights, before finally coming to rest on the plank. Maintain structural integrity and object consistency throughout: no changing shapes, no blending, and no flashing background.'
  }
];

const WORLD_MODELS = [
  { id: 'cosmos-nano', name: 'Cosmos3-Nano', prefix: 'cosmos3_nano_', base: 'Traj_Lab_video_results/Traj_Lab/cosmos3-nano', standard: 'outputs', physics: 'outputs_phys500', resolution: '832×480 · 24 fps' },
  { id: 'cosmos-super', name: 'Cosmos3-Super-I2V', prefix: 'cosmos3_superi2v_', base: 'Traj_Lab_video_results/Traj_Lab/cosmos3-superi2v', standard: 'outputs', physics: 'outputs_phys500', resolution: '832×480 · 24 fps' },
  { id: 'wan22', name: 'Wan-2.2', prefix: 'wan22_', base: 'Traj_Lab_video_results/Traj_Lab/wan22', standard: 'outputs', physics: 'outputs_phys500', resolution: '832×464 · 16 fps' },
  { id: 'wan27', name: 'Wan-2.7', prefix: 'output_', base: 'Traj_Lab_video_results/Traj_Lab/wan27', standard: 'outputs', physics: 'outputs_phys500', resolution: '1264×728 · 30 fps' },
  { id: 'seedance', name: 'Seedance 2.0', prefix: '', base: 'Traj_Lab_video_results/Traj_Lab/seedance2', standard: 'outputs', physics: null, resolution: '864×496 · 24 fps' },
  { id: 'genie', name: 'Genie 3', prefix: '', base: 'Traj_Lab_video_results/Traj_Lab/genie3', standard: 'outputs', physics: null, resolution: '1280×704 · 20 fps' }
];

function getWorldModelVideo(model, scene, material, mode) {
  if (mode === 'physics' && !model.physics) return null;
  const token = typeof scene.token === 'string' ? scene.token : scene.token[material];
  const directory = mode === 'physics' ? model.physics : model.standard;
  return `${model.base}/${directory}/${model.prefix}${token}.mp4`;
}
