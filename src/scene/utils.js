import * as THREE from 'three';

export const COLORS = {
  bg: 0x030712,
  cyan: 0x22d3ee,
  purple: 0xa855f7,
  green: 0x4ade80,
  amber: 0xfbbf24,
  pink: 0xf472b6,
};

// Colors pushed above 1.0 so they pass the bloom threshold and glow.
export const glow = (color, k = 2.5) => new THREE.Color(color).multiplyScalar(k);

// Text label rendered to a canvas and shown as a camera-facing sprite.
export function makeLabel(text, { border = '#22d3ee', scale = 1 } = {}) {
  const size = 48;
  const font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width + size * 1.2);
  const h = Math.ceil(size * 1.8);
  canvas.width = w;
  canvas.height = h;

  ctx.font = font; // resizing the canvas resets context state
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, h * 0.3);
  ctx.fillStyle = 'rgba(3, 7, 18, 0.8)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = border;
  ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  // Slightly dimmed so text stays crisp instead of blooming.
  const mat = new THREE.SpriteMaterial({ map: tex, color: 0xb8b8b8, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const worldH = 0.55 * scale;
  sprite.scale.set((worldH * w) / h, worldH, 1);
  return sprite;
}

export function curveLine(curve, color, opacity = 0.4, segments = 64) {
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geo, mat);
}

// Glowing "packets" travelling along a set of curves at constant world speed.
export class PacketFlow {
  constructor(curves, { perCurve = 2, color = COLORS.cyan, size = 0.08, speed = [2, 4] } = {}) {
    this.curves = curves;
    this.lengths = curves.map((c) => c.getLength());
    const [min, max] = Array.isArray(speed) ? speed : [speed, speed];

    this.packets = [];
    curves.forEach((_, ci) => {
      const offset = Math.random();
      for (let k = 0; k < perCurve; k++) {
        this.packets.push({
          ci,
          t: (offset + k / perCurve) % 1,
          speed: min + Math.random() * (max - min),
          pos: new THREE.Vector3(),
        });
      }
    });

    this.mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(size, 10, 10),
      new THREE.MeshBasicMaterial({ color: glow(color, 3) }),
      this.packets.length,
    );
    this.mesh.frustumCulled = false;
    this._m = new THREE.Matrix4();
  }

  update(dt) {
    this.packets.forEach((p, i) => {
      p.t = (p.t + (dt * p.speed) / this.lengths[p.ci]) % 1;
      this.curves[p.ci].getPointAt(p.t, p.pos);
      this._m.makeTranslation(p.pos.x, p.pos.y, p.pos.z);
      this.mesh.setMatrixAt(i, this._m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export function createStarfield(count = 2500) {
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(150 + Math.random() * 100);
    positions.set([v.x, v.y, v.z - 60], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    fog: false,
  });
  return new THREE.Points(geo, mat);
}
