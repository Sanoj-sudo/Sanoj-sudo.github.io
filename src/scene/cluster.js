import * as THREE from 'three';
import { COLORS, glow, curveLine, PacketFlow } from './utils.js';

// A Kubernetes-style cluster: control-plane racks in the middle,
// worker racks in a ring, cables with packets flowing between them.
export function createCluster() {
  const group = new THREE.Group();
  const hoverables = [];

  const grid = new THREE.GridHelper(48, 48, 0x1e40af, 0x0f1d33);
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  grid.material.depthWrite = false;
  group.add(grid);

  const rings = [
    [2.6, COLORS.purple],
    [7.5, COLORS.cyan],
  ].map(([r, color]) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r, r + 0.06, 128),
      new THREE.MeshBasicMaterial({ color: glow(color, 1.6), transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
    return ring;
  });

  // ── Racks ──────────────────────────────────────────────
  const rackGeo = new THREE.BoxGeometry(1.1, 2.4, 1.1);
  const edgeGeo = new THREE.EdgesGeometry(rackGeo);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.7, roughness: 0.3 });
  const ledGeo = new THREE.BoxGeometry(0.16, 0.05, 0.02);
  const ledPalette = [glow(COLORS.green, 3), glow(COLORS.cyan, 3), glow(COLORS.amber, 3), new THREE.Color(0x111827)];
  const racks = [];

  function addRack(x, z, color, heightScale, tooltip) {
    const rack = new THREE.Group();
    rack.position.set(x, 0, z);

    const body = new THREE.Mesh(rackGeo, rackMat);
    body.scale.y = heightScale;
    body.position.y = 1.2 * heightScale;
    body.userData.tooltip = tooltip;
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: glow(color, 1.4) }));
    edges.scale.copy(body.scale);
    edges.position.copy(body.position);
    rack.add(body, edges);

    const rows = Math.round(8 * heightScale);
    const cols = 3;
    const leds = new THREE.InstancedMesh(ledGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), rows * cols);
    const m = new THREE.Matrix4();
    const top = 2.4 * heightScale - 0.35;
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.makeTranslation((c - 1) * 0.28, 0.35 + (r * (top - 0.35)) / (rows - 1), 0.56);
        leds.setMatrixAt(k, m);
        leds.setColorAt(k, ledPalette[Math.floor(Math.random() * ledPalette.length)]);
        k++;
      }
    }
    rack.add(leds);

    rack.lookAt(x * 2, 0, z * 2); // LED face points outward
    group.add(rack);
    hoverables.push(body);
    racks.push({ leds, count: rows * cols });
  }

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    addRack(Math.cos(a) * 1.4, Math.sin(a) * 1.4, COLORS.purple, 1.3, `control-plane-${i + 1}\nrole: etcd, api-server\nstatus: Ready ✓`);
  }

  const WORKERS = 8;
  const workerPos = [];
  for (let i = 0; i < WORKERS; i++) {
    const a = (i / WORKERS) * Math.PI * 2;
    const x = Math.cos(a) * 7.5;
    const z = Math.sin(a) * 7.5;
    workerPos.push(new THREE.Vector3(x, 0, z));
    const cpu = 20 + Math.floor(Math.random() * 60);
    addRack(x, z, COLORS.cyan, 1, `worker-0${i + 1}\npods: ${12 + i * 3}/110  cpu: ${cpu}%\nstatus: Ready ✓`);
  }

  // ── Cables ─────────────────────────────────────────────
  const hub = new THREE.Vector3(0, 3.6, 0);
  const uplinks = workerPos.map(
    (p) =>
      new THREE.CatmullRomCurve3([
        hub,
        new THREE.Vector3(p.x * 0.5, 4.6, p.z * 0.5),
        new THREE.Vector3(p.x, 2.5, p.z),
      ]),
  );
  const ringLinks = workerPos.map((p, i) => {
    const q = workerPos[(i + 1) % WORKERS];
    const mid = p.clone().add(q).multiplyScalar(0.5).setLength(8.2);
    return new THREE.CatmullRomCurve3([p.clone().setY(0.1), mid.setY(0.1), q.clone().setY(0.1)]);
  });

  uplinks.forEach((c) => group.add(curveLine(c, COLORS.cyan, 0.35)));
  ringLinks.forEach((c) => group.add(curveLine(c, COLORS.amber, 0.25)));

  const uplinkPackets = new PacketFlow(uplinks, { perCurve: 2, color: COLORS.green, size: 0.09, speed: [2, 4] });
  const ringPackets = new PacketFlow(ringLinks, { perCurve: 1, color: COLORS.amber, size: 0.07, speed: [1.5, 3] });
  group.add(uplinkPackets.mesh, ringPackets.mesh);

  // ── Ingress / load balancer hovering above ────────────
  const ingress = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.MeshBasicMaterial({ color: glow(COLORS.purple, 2.2), wireframe: true }),
  );
  ingress.position.set(0, 7, 0);
  ingress.userData.tooltip = 'ingress-nginx\nreq/s: 12.4k  p99: 84ms\nTLS: cert-manager ✓';
  hoverables.push(ingress);
  const beam = curveLine(new THREE.LineCurve3(ingress.position, hub), COLORS.purple, 0.6, 2);
  group.add(ingress, beam);

  function update(t, dt) {
    uplinkPackets.update(dt);
    ringPackets.update(dt);
    ingress.rotation.y += dt * 0.8;
    ingress.position.y = 7 + Math.sin(t * 1.5) * 0.2;
    rings.forEach((r, i) => (r.material.opacity = 0.45 + Math.sin(t * 2 + i) * 0.25));

    // Blink a few random LEDs each frame
    for (const r of racks) {
      if (Math.random() < 0.35) {
        r.leds.setColorAt(Math.floor(Math.random() * r.count), ledPalette[Math.floor(Math.random() * ledPalette.length)]);
        r.leds.instanceColor.needsUpdate = true;
      }
    }
  }

  return { group, update, hoverables };
}
