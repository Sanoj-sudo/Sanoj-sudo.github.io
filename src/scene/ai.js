import * as THREE from 'three';
import { glow, makeLabel, PacketFlow } from './utils.js';

const LAYERS = [3, 6, 8, 6, 3];
const INPUTS = [
  ['pull request', 'GitHub PR diff → Claude skill'],
  ['merged commits', 'main branch history → release workflow'],
  ['data products', 'Databricks tables & metadata'],
];
const OUTPUTS = [
  ['PR review', 'inline review comments\nbugs · security · style'],
  ['release notes', 'changelog + version tag\npublished by GitHub Actions'],
  ['insights', 'Data Product Workbench\nanswers & recommendations'],
];
const MODELS = [
  ['Claude', '#d97757', 'Anthropic Claude\nPR review & release skills'],
  ['Gemini', '#60a5fa', 'Google Gemini\nData Product Workbench'],
  ['Databricks', '#ff5a36', 'Databricks\ndata & AI platform'],
];
const ORBIT_R = 10.5;
const LAYER_COLORS = ['#22d3ee', '#38bdf8', '#a855f7', '#e879f9', '#fb7185'];

// A neural network with signals firing input → output, and the AI
// platforms (Claude, Gemini, Databricks) orbiting around it.
export function createAI() {
  const group = new THREE.Group();
  const hoverables = [];
  const spacingX = 3;
  const spacingY = 1.3;

  const nodeGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const layers = LAYERS.map((count, li) => {
    const x = (li - (LAYERS.length - 1) / 2) * spacingX;
    const base = glow(LAYER_COLORS[li], 1.1);
    const hot = glow(LAYER_COLORS[li], 3.5);
    return Array.from({ length: count }, (_, ni) => {
      const y = (ni - (count - 1) / 2) * spacingY;
      const mat = new THREE.MeshBasicMaterial({ color: base.clone() });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set(x, y, Math.sin(li * 2 + ni) * 0.8);
      group.add(mesh);
      return { mesh, mat, base, hot, heat: 0 };
    });
  });

  const labelSide = (nodes, items, dir) =>
    nodes.forEach((n, i) => {
      const [text, tip] = items[i];
      const label = makeLabel(text, { border: LAYER_COLORS[dir < 0 ? 0 : LAYER_COLORS.length - 1], scale: 0.9 });
      label.center.set(dir < 0 ? 1 : 0, 0.5);
      label.position.set(dir * 0.5, 0, 0);
      n.mesh.add(label);
      n.mesh.userData.tooltip = `${text}\n${tip}`;
      hoverables.push(n.mesh);
    });
  labelSide(layers[0], INPUTS, -1);
  labelSide(layers[layers.length - 1], OUTPUTS, 1);

  // Fully-connected edges + a subset carrying signals
  const edgePts = [];
  const signals = [];
  const signalEnds = [];
  for (let li = 0; li < layers.length - 1; li++) {
    for (const a of layers[li]) {
      for (const b of layers[li + 1]) {
        edgePts.push(a.mesh.position, b.mesh.position);
        if (Math.random() < 0.4) {
          signals.push(new THREE.LineCurve3(a.mesh.position, b.mesh.position));
          signalEnds.push(b);
        }
      }
    }
  }
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(edgePts),
      new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.16 }),
    ),
  );
  const flow = new PacketFlow(signals, { perCurve: 1, color: 0xf0abfc, size: 0.07, speed: [3, 6] });
  group.add(flow.mesh);

  // Orbiting AI platforms
  const orbit = new THREE.Group();
  orbit.rotation.x = 0.18;
  group.add(orbit);
  const modelGeo = new THREE.IcosahedronGeometry(0.6, 0);
  const models = MODELS.map(([name, color, tip], i) => {
    const holder = new THREE.Group();
    holder.rotation.y = (i / MODELS.length) * Math.PI * 2;
    const mesh = new THREE.Mesh(modelGeo, new THREE.MeshBasicMaterial({ color: glow(color, 2.6), wireframe: true }));
    mesh.position.set(ORBIT_R, 0, 0);
    mesh.userData.tooltip = tip;
    const label = makeLabel(name, { border: color, scale: 1.4 });
    label.position.y = 1.1;
    mesh.add(label);
    holder.add(mesh);
    orbit.add(holder);
    hoverables.push(mesh);
    return mesh;
  });
  const ringPts = new THREE.EllipseCurve(0, 0, ORBIT_R, ORBIT_R).getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y));
  orbit.add(
    new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: 0xd97757, transparent: true, opacity: 0.3 }),
    ),
  );

  const allNodes = layers.flat();
  function update(t, dt) {
    flow.update(dt);
    // Light up a node when a signal reaches it
    flow.packets.forEach((p) => {
      if (p.t > 0.92) signalEnds[p.ci].heat = 1;
    });
    for (const n of allNodes) {
      n.heat *= Math.exp(-dt * 3);
      n.mat.color.lerpColors(n.base, n.hot, n.heat);
      n.mesh.scale.setScalar(1 + n.heat * 0.5);
    }
    orbit.rotation.y += dt * 0.15;
    models.forEach((m, i) => {
      m.rotation.x += dt * 0.6;
      m.rotation.y += dt * 0.8;
      m.position.y = Math.sin(t * 1.2 + i * 2) * 0.6;
    });
  }

  return { group, update, hoverables };
}
