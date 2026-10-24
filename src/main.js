import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { profile } from './data.js';
import { renderUI, typeTerminal, rotateRoles, runBoot, setupReveal, setupCursorGlow, setupContactActions } from './ui.js';
import { COLORS, createStarfield } from './scene/utils.js';
import { createCluster } from './scene/cluster.js';
import { createSkills } from './scene/skills.js';
import { createPipeline } from './scene/pipeline.js';
import { createGlobe } from './scene/globe.js';
import { createAI } from './scene/ai.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// World positions of each scene "station" along the flight path
const AI_POS = v3(0, 0.5, -40);
const SKILLS_POS = v3(0, 1, -80);
const PIPELINE_POS = v3(0, 0, -120);
const GLOBE_POS = v3(0, 1, -160);

// Camera keyframe per <section id>. `shift` moves the 3D focus left/right
// of the screen centre (fraction of width) so it sits beside the text panel.
// `show` lists which scene modules are rendered for that section.
const KEYFRAMES = {
  hero: { pos: v3(0, 7, 21), look: v3(0, 2, 0), shift: 0.2, show: ['cluster'] },
  about: { pos: v3(13, 4.5, 8), look: v3(0, 1.5, 0), shift: -0.22, show: ['cluster'] },
  ai: { pos: v3(-2, 2.5, -11), look: AI_POS, shift: 0.28, show: ['ai'] },
  skills: { pos: v3(0, 8, -50), look: SKILLS_POS, shift: -0.25, show: ['skills'] },
  experience: { pos: v3(10, 2, -90), look: PIPELINE_POS, shift: 0.24, show: ['pipeline'] },
  projects: { pos: v3(0, 3, -139), look: GLOBE_POS, shift: -0.27, show: ['globe'] },
  contact: { pos: v3(0, 10, -146), look: v3(0, 14, -173), shift: 0, show: ['globe'] }, // globe as a horizon below the card
};
const INTRO_FROM = v3(0, 45, 75); // camera swoops in from here after the loader

function webglAvailable() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

function initScene() {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bg);
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.008);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);

  scene.add(new THREE.AmbientLight(0x8899bb, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(10, 20, 10);
  scene.add(sun);
  const clusterLight = new THREE.PointLight(COLORS.cyan, 40, 30);
  clusterLight.position.set(0, 6, 0);
  scene.add(clusterLight);

  const cluster = createCluster();
  const ai = createAI();
  ai.group.position.copy(AI_POS);
  const skills = createSkills(profile.skills);
  skills.group.position.copy(SKILLS_POS);
  const pipeline = createPipeline();
  pipeline.group.position.copy(PIPELINE_POS);
  const globe = createGlobe();
  globe.group.position.copy(GLOBE_POS);
  const modules = { cluster, ai, skills, pipeline, globe };
  Object.values(modules).forEach((m) => scene.add(m.group));
  const hoverables = Object.values(modules).flatMap((m) => m.hoverables);

  const stars = createStarfield();
  scene.add(stars);

  // ── Post-processing (bloom for the neon look) ─────────
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.9, 0.5, 0.75);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ── Scroll → camera ───────────────────────────────────
  // Only sections with a camera keyframe drive the camera (a typo'd id is skipped, not fatal)
  const sections = [...document.querySelectorAll('main > section')].filter((s) => KEYFRAMES[s.id]);
  const frames = sections.map((s) => KEYFRAMES[s.id]);
  let ranges = [];
  // Camera holds on a keyframe while its section fills the viewport,
  // and transitions while scrolling between sections.
  const measure = () => {
    ranges = sections.map((s) => ({ start: s.offsetTop, end: Math.max(s.offsetTop, s.offsetTop + s.offsetHeight - innerHeight) }));
  };
  measure();

  const ease = (t) => t * t * (3 - 2 * t);
  const target = { pos: new THREE.Vector3(), look: new THREE.Vector3(), shift: 0 };
  const current = { pos: INTRO_FROM.clone(), look: frames[0].look.clone(), shift: frames[0].shift };
  let introAt = Infinity; // camera holds at INTRO_FROM until the loader lifts

  function computeTarget() {
    const s = scrollY;
    let a = frames[frames.length - 1];
    let b = a;
    let t = 0;
    for (let i = 0; i < ranges.length; i++) {
      if (s <= ranges[i].end) {
        a = b = frames[i];
        break;
      }
      if (i < ranges.length - 1 && s < ranges[i + 1].start) {
        a = frames[i];
        b = frames[i + 1];
        t = ease((s - ranges[i].end) / (ranges[i + 1].start - ranges[i].end));
        break;
      }
    }
    target.pos.lerpVectors(a.pos, b.pos, t);
    target.look.lerpVectors(a.look, b.look, t);
    target.shift = THREE.MathUtils.lerp(a.shift, b.shift, t);
    for (const [name, m] of Object.entries(modules)) m.group.visible = a.show.includes(name) || b.show.includes(name);

    // Portrait / mobile: pull back and keep the scene centred
    if (innerWidth / innerHeight < 0.9) {
      target.pos.sub(target.look).multiplyScalar(1.4).add(target.look);
      target.shift = 0;
    }
  }

  // ── Pointer: parallax + hover tooltips ────────────────
  const pointer = new THREE.Vector2();
  const parallax = new THREE.Vector2();
  let pointerOnCanvas = false;
  let px = 0;
  let py = 0;
  window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    pointerOnCanvas = e.target === canvas;
    px = e.clientX;
    py = e.clientY;
  });
  const raycaster = new THREE.Raycaster();
  const isVisible = (obj) => {
    for (let o = obj; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  const tooltip = document.getElementById('tooltip');

  function updateHover() {
    let hit = null;
    if (pointerOnCanvas) {
      raycaster.setFromCamera(pointer, camera);
      hit = raycaster.intersectObjects(hoverables.filter(isVisible), false)[0];
    }
    if (hit) {
      tooltip.textContent = hit.object.userData.tooltip;
      tooltip.style.transform = `translate(${px + 16}px, ${py + 16}px)`;
      tooltip.classList.add('show');
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.classList.remove('show');
      canvas.style.cursor = '';
    }
  }

  // ── Resize ────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth, innerHeight);
    measure();
  });
  new ResizeObserver(measure).observe(document.getElementById('content'));

  // ── Loop ──────────────────────────────────────────────
  const clock = new THREE.Clock();
  const motion = reducedMotion ? 0.2 : 1;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    // Slow swoop for the first seconds after the intro starts, snappier afterwards
    const k = t < introAt ? 0 : 1 - Math.exp(-dt * (t - introAt < 2.5 ? 1.6 : 4));

    computeTarget();
    current.pos.lerp(target.pos, k);
    current.look.lerp(target.look, k);
    current.shift += (target.shift - current.shift) * k;
    parallax.lerp(pointer, 1 - Math.exp(-dt * 4));

    camera.position.copy(current.pos);
    camera.lookAt(current.look);
    camera.translateX(parallax.x * 0.8 * motion);
    camera.translateY(parallax.y * 0.5 * motion);
    camera.lookAt(current.look);
    camera.setViewOffset(innerWidth, innerHeight, -current.shift * innerWidth, 0, innerWidth, innerHeight);

    for (const m of Object.values(modules)) if (m.group.visible) m.update(t, dt * motion);
    stars.rotation.y += dt * 0.004 * motion;

    updateHover();
    composer.render();
  });

  return {
    startIntro: () => {
      introAt = reducedMotion ? -Infinity : clock.elapsedTime;
      if (reducedMotion) current.pos.copy(target.pos);
    },
  };
}

function setupProgress() {
  const bar = document.getElementById('progress-bar');
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

async function start() {
  renderUI(profile);
  setupReveal();
  setupProgress();
  setupCursorGlow();
  setupContactActions(profile);

  const boot = runBoot(document.getElementById('boot'));
  await Promise.all([document.fonts.load('600 48px "JetBrains Mono"').catch(() => {}), sleep(600)]);

  let scene3d = null;
  if (webglAvailable()) {
    try {
      scene3d = initScene();
    } catch (err) {
      console.error(err);
      document.body.classList.add('no-webgl');
    }
  } else {
    document.body.classList.add('no-webgl');
  }

  await boot;
  document.getElementById('loader').classList.add('done');
  scene3d?.startIntro();

  rotateRoles(document.getElementById('role-rotator'), profile.roles);
  typeTerminal(document.getElementById('hero-term'), [
    { cmd: 'whoami', out: profile.name.toLowerCase() },
    {
      cmd: `kubectl get engineer ${profile.handle} -o wide`,
      out:
        'NAME    EXPERIENCE   CLOUDS          AI               STATUS\n' +
        `${profile.handle.padEnd(8)}5y           aws,azure,gcp   claude,gemini    ${profile.openToWork ? 'OPEN-TO-WORK' : 'READY'}`,
    },
  ]);
}

start();
