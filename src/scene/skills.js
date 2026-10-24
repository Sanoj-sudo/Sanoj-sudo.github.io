import * as THREE from 'three';
import { COLORS, glow, makeLabel } from './utils.js';

// Each skill category is a tilted orbit ring around a glowing core.
export function createSkills(categories) {
  const group = new THREE.Group();
  const hoverables = [];

  const core = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshBasicMaterial({ color: glow(COLORS.cyan, 1.5), wireframe: true, transparent: true, opacity: 0.7 }),
  );
  const heart = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9, 2),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 2, flatShading: true }),
  );
  core.add(shell, heart);
  group.add(core);

  const orbits = categories.map((cat, i) => {
    const r = 3.4 + i * 1.75;
    const orbit = new THREE.Group();
    orbit.rotation.x = (i % 2 ? 1 : -1) * (0.25 + i * 0.07);
    orbit.rotation.z = (i - categories.length / 2) * 0.12;

    const ringPts = new THREE.EllipseCurve(0, 0, r, r).getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y));
    orbit.add(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color: cat.color, transparent: true, opacity: 0.4 }),
      ),
    );

    const spinner = new THREE.Group();
    orbit.add(spinner);
    const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: glow(cat.color, 2.5) });
    const items = cat.items.slice(0, 6); // keep orbits readable; the HTML panel lists everything
    items.forEach((item, k) => {
      const a = (k / items.length) * Math.PI * 2 + i;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      node.userData.tooltip = `${item}\ncategory: ${cat.category}`;
      const label = makeLabel(item, { border: cat.color, scale: 0.9 });
      label.position.y = 0.6;
      node.add(label);
      spinner.add(node);
      hoverables.push(node);
    });

    group.add(orbit);
    return { spinner, speed: (0.14 - i * 0.015) * (i % 2 ? -1 : 1) };
  });

  function update(t, dt) {
    core.rotation.y += dt * 0.3;
    shell.rotation.x += dt * 0.2;
    heart.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    orbits.forEach((o) => (o.spinner.rotation.y += dt * o.speed));
  }

  return { group, update, hoverables };
}
