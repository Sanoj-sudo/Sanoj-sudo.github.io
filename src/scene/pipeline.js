import * as THREE from 'three';
import { COLORS, glow, makeLabel, PacketFlow } from './utils.js';

const STAGES = [
  { name: 'commit', color: COLORS.purple, info: 'git push → webhook\nbranch: main' },
  { name: 'build', color: COLORS.cyan, info: 'docker buildx\ncache hit: 92%  2m14s' },
  { name: 'test', color: COLORS.cyan, info: 'unit + integration\n1,284 passed ✓' },
  { name: 'scan', color: COLORS.amber, info: 'trivy + tfsec\n0 critical ✓' },
  { name: 'deploy', color: COLORS.green, info: 'argocd sync\ncanary 10% → 100%' },
  { name: 'monitor', color: COLORS.pink, info: 'prometheus + grafana\nSLO 99.95% ✓' },
];

// A vertical CI/CD pipeline: stages along a tube, builds flowing through and lighting each stage.
export function createPipeline() {
  const group = new THREE.Group();
  group.rotation.z = -Math.PI / 2; // vertical: commit at the top, beside the experience timeline
  const hoverables = [];
  const spacing = 5;
  const n = STAGES.length;

  const points = STAGES.map((_, i) => new THREE.Vector3((i - (n - 1) / 2) * spacing, Math.sin(i * 1.3) * 0.6, 0));
  const curve = new THREE.CatmullRomCurve3([
    points[0].clone().add(new THREE.Vector3(-5, 0, 0)),
    ...points,
    points[n - 1].clone().add(new THREE.Vector3(5, 0, 0)),
  ]);

  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 300, 0.05, 8, false),
      new THREE.MeshBasicMaterial({ color: glow(COLORS.cyan, 1.2), transparent: true, opacity: 0.5 }),
    ),
  );

  const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const innerGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);

  const stages = STAGES.map((s, i) => {
    const stage = new THREE.Group();
    stage.position.copy(points[i]);

    const body = new THREE.Mesh(
      boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.55 }),
    );
    body.userData.tooltip = `stage: ${s.name}\n${s.info}`;
    const edgeMat = new THREE.LineBasicMaterial({ color: glow(s.color, 1.4) });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    const innerMat = new THREE.MeshBasicMaterial({ color: glow(s.color, 2) });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    const label = makeLabel(s.name, { border: `#${new THREE.Color(s.color).getHexString()}`, scale: 1.4 });
    label.center.set(0, 0.5); // anchor left edge so the label sits beside the box
    label.position.y = 1.2; // local +y becomes screen-right once the group is rotated


    stage.add(body, edges, inner, label);
    group.add(stage);
    hoverables.push(body);
    return { stage, inner, innerMat, base: glow(s.color, 2), hot: glow(s.color, 6) };
  });

  const builds = new PacketFlow([curve], { perCurve: 5, color: COLORS.green, size: 0.16, speed: 3 });
  group.add(builds.mesh);

  function update(t, dt) {
    builds.update(dt);
    stages.forEach((s) => {
      // Pulse when a build packet passes through the stage
      let heat = 0;
      for (const p of builds.packets) {
        const d = p.pos.distanceToSquared(s.stage.position);
        heat = Math.max(heat, Math.exp(-d / 0.6));
      }
      s.inner.rotation.x += dt * (0.6 + heat * 4);
      s.inner.rotation.y += dt * (0.8 + heat * 4);
      s.inner.scale.setScalar(1 + heat * 0.6);
      s.innerMat.color.lerpColors(s.base, s.hot, heat);
    });
  }

  return { group, update, hoverables };
}
