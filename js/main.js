import * as THREE from 'three';
import { createScene } from './scene.js';
import { createBlackHole } from './blackHole.js';
import { createAccretionDisk, INNER, OUTER } from './accretionDisk.js';
import { createStarField } from './stars.js';
import { createPostProcessing } from './postprocessing.js';
import { createAdaptiveQuality } from './quality.js';
import { createDebugPanel } from './debug.js';
import { createWorkLabel } from './label.js';

const canvas = document.getElementById('scene');

const isMobile =
  window.matchMedia('(pointer: coarse)').matches ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SHADER_FILES = [
  'blackHole.vert',
  'blackHole.frag',
  'photonRing.vert',
  'photonRing.frag',
  'halo.vert',
  'halo.frag',
  'disk.vert',
  'disk.frag',
  'particles.vert',
  'particles.frag',
  'stars.vert',
  'stars.frag',
  'background.vert',
  'background.frag'
];

const BASE_DIR = new THREE.Vector3(0, Math.tan(THREE.MathUtils.degToRad(5)) * 4.02, 4.02).normalize();
const UP = new THREE.Vector3(0, 1, 0);
const DISK_OUTER_RADIUS = 5.4;
const DISK_WIDTH_FIT = 0.8;
const DISK_TILT_ANGLE = THREE.MathUtils.degToRad(20);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function showStaticFallback() {
  document.documentElement.classList.add('no-webgl');
}

async function loadShaders() {
  const entries = await Promise.all(
    SHADER_FILES.map(async (name) => {
      const res = await fetch(`shaders/${name}`);
      if (!res.ok) throw new Error(`Failed to load shaders/${name}`);
      return [name, await res.text()];
    })
  );
  return Object.fromEntries(entries);
}

function smoothstep01(x) {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
}

let shaders = null;

function build() {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });

  const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const { scene, camera } = createScene(shaders);

  const disk = createAccretionDisk(shaders, { isMobile, pixelRatio });
  disk.group.quaternion.setFromAxisAngle(BASE_DIR, DISK_TILT_ANGLE);
  scene.add(disk.group);

  const diskNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(disk.group.quaternion);

  const blackHole = createBlackHole(shaders);
  scene.add(blackHole.group);

  const stars = createStarField(shaders, { isMobile, pixelRatio });
  scene.add(stars.points);

  const { composer, coreMask } = createPostProcessing(renderer, scene, camera, {
    isMobile,
    diskNormal,
    diskInner: INNER,
    diskOuter: OUTER
  });
  composer.setPixelRatio(pixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);

  const clock = new THREE.Clock();
  let animTime = 0;
  const motionScale = reducedMotion ? 0.05 : 1;
  let widthFit = DISK_WIDTH_FIT;
  let camYaw = 0;
  let camPitch = 5;
  let camRoll = 0;

  const label = createWorkLabel();

  const debug = createDebugPanel({
    disk,
    blackHole,
    stars,
    label,
    setSize: (v) => { widthFit = v; },
    setCamYaw: (v) => { camYaw = v; },
    setCamPitch: (v) => { camPitch = v; },
    setCamRoll: (v) => { camRoll = v; },
    setHorizon: (v) => {
      blackHole.setHorizon(v);
      coreMask.uniforms.uCoreRadius.value = v;
    },
    setPhotonRing: (v) => blackHole.setPhotonRing(v),
    setDiskRadii: (inner, outer) => {
      disk.setRadii(inner, outer);
      coreMask.uniforms.uDiskInner.value = inner;
      coreMask.uniforms.uDiskOuter.value = outer;
    }
  });

  function fitDistance() {
    const tanHalfH =
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    return (DISK_OUTER_RADIUS / (widthFit * tanHalfH)) * 1.02;
  }

  function updateCamera(t) {
    const dist = fitDistance();
    const yaw = THREE.MathUtils.degToRad(camYaw);
    const pitch = THREE.MathUtils.degToRad(camPitch);

    camera.position
      .set(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
      )
      .multiplyScalar(dist);

    if (!reducedMotion) {
      camera.position.applyAxisAngle(UP, Math.sin(t * 0.05) * 0.05);
      camera.position.y += Math.sin(t * 0.037) * 0.16;
    }

    camera.lookAt(0, 0, 0);

    if (camRoll !== 0) {
      camera.rotateZ(THREE.MathUtils.degToRad(camRoll));
    }
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  function applyPixelRatio(pr) {
    renderer.setPixelRatio(pr);
    composer.setPixelRatio(pr);
    disk.setPixelRatio(pr);
    stars.setPixelRatio(pr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  const quality = createAdaptiveQuality({
    initialPixelRatio: pixelRatio,
    applyPixelRatio,
    reduceParticles: (f) => disk.setParticleFraction(f),
    reduceStars: (f) => stars.setStarFraction(f),
    reduceResolution: (f) => composer.setPixelRatio(renderer.getPixelRatio() * f)
  });

  updateCamera(0);
  canvas.classList.add('is-ready');

  renderer.setAnimationLoop(() => {
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const elapsed = clock.elapsedTime;
    animTime += dt * motionScale;

    const starsReveal = smoothstep01(elapsed / 0.7);
    const holeReveal = smoothstep01((elapsed - 0.5) / 0.8);
    const diskReveal = smoothstep01((elapsed - 1.0) / 1.2);

    blackHole.update(animTime, holeReveal, camera);
    disk.update(animTime, diskReveal);
    stars.update(animTime, starsReveal);

    updateCamera(animTime);
    composer.render();

    quality.frame(rawDt, elapsed);
    if (debug) debug.frame(rawDt);
  });

  return {
    stop() {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
    },
    dispose() {
      this.stop();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of materials) m.dispose();
        }
      });
      if (typeof composer.dispose === 'function') composer.dispose();
      renderer.dispose();
    }
  };
}

async function init() {
  try {
    shaders = await loadShaders();
  } catch (err) {
    console.error(err);
    showStaticFallback();
    return;
  }

  let current;
  try {
    current = build();
  } catch (err) {
    console.error(err);
    showStaticFallback();
    return;
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    if (current) current.stop();
  });

  canvas.addEventListener('webglcontextrestored', () => {
    if (!current) return;
    current.dispose();
    try {
      current = build();
    } catch (err) {
      console.error(err);
      current = null;
      showStaticFallback();
    }
  });
}

if (!hasWebGL()) {
  showStaticFallback();
} else {
  init().catch((err) => {
    console.error(err);
    showStaticFallback();
  });
}
