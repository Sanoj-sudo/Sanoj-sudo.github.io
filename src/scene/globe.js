import * as THREE from 'three';
import { COLORS, glow, curveLine, PacketFlow } from './utils.js';

const REGIONS = [
  ['us-east-1', 38.9, -77.4],
  ['us-west-2', 45.5, -122.7],
  ['eu-west-1', 53.3, -6.3],
  ['eu-central-1', 50.1, 8.7],
  ['ap-south-1', 19.1, 72.9],
  ['ap-southeast-1', 1.35, 103.8],
  ['ap-northeast-1', 35.7, 139.7],
  ['sa-east-1', -23.5, -46.6],
  ['ap-southeast-2', -33.9, 151.2],
];
const LINKS = [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1], [0, 7], [5, 8], [3, 5], [7, 2]];

const R = 5;

function latLonToVec3(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Multi-region "global infrastructure" globe with traffic arcs.
export function createGlobe() {
  const group = new THREE.Group();
  group.rotation.z = 0.25;
  const spinner = new THREE.Group();
  group.add(spinner);
  const hoverables = [];

  // Fibonacci-sphere dot cloud
  const COUNT = 1800;
  const dots = new Float32Array(COUNT * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    dots.set([Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R], i * 3);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dots, 3));
  spinner.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: COLORS.cyan, size: 0.06, transparent: true, opacity: 0.75 })));

  // Dark occluder so back-side dots are hidden
  spinner.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshBasicMaterial({ color: COLORS.bg })));

  // Fresnel atmosphere
  group.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          varying vec3 vNormal; varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal; varying vec3 vView;
          void main() {
            float i = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
            gl_FragColor = vec4(0.13, 0.75, 0.95, 1.0) * i * 0.9;
          }`,
      }),
    ),
  );

  // Region markers
  const markerGeo = new THREE.SphereGeometry(0.11, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: glow(COLORS.amber, 3) });
  const pulseGeo = new THREE.RingGeometry(0.15, 0.22, 32);
  const zAxis = new THREE.Vector3(0, 0, 1);
  const pulses = [];
  const positions = REGIONS.map(([name, lat, lon], i) => {
    const p = latLonToVec3(lat, lon, R);
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(p);
    marker.userData.tooltip = `region: ${name}\nstatus: healthy ✓`;
    hoverables.push(marker);

    const pulse = new THREE.Mesh(
      pulseGeo,
      new THREE.MeshBasicMaterial({ color: glow(COLORS.amber, 2), transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    );
    pulse.position.copy(p).multiplyScalar(1.005);
    pulse.quaternion.setFromUnitVectors(zAxis, p.clone().normalize());
    pulses.push({ mesh: pulse, phase: i * 0.37 });
    spinner.add(marker, pulse);
    return p;
  });

  // Traffic arcs
  const arcs = LINKS.map(([a, b]) => {
    const pa = positions[a];
    const pb = positions[b];
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    mid.setLength(R + pa.distanceTo(pb) * 0.35);
    return new THREE.QuadraticBezierCurve3(pa, mid, pb);
  });
  arcs.forEach((c) => spinner.add(curveLine(c, COLORS.purple, 0.55)));
  const traffic = new PacketFlow(arcs, { perCurve: 2, color: COLORS.cyan, size: 0.06, speed: [2, 3.5] });
  spinner.add(traffic.mesh);

  function update(t, dt) {
    spinner.rotation.y += dt * 0.12;
    traffic.update(dt);
    pulses.forEach((p) => {
      const k = (t * 0.6 + p.phase) % 1;
      p.mesh.scale.setScalar(1 + k * 3);
      p.mesh.material.opacity = 1 - k;
    });
  }

  return { group, update, hoverables };
}
