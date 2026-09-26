import * as THREE from 'three';
import { BLACKBODY_GLSL } from './temperature.js';

export const INNER = 2.3;
export const OUTER = 5.4;

function makeDiskMesh(shaders, opts) {
  const material = new THREE.ShaderMaterial({
    vertexShader: shaders['disk.vert'],
    fragmentShader: BLACKBODY_GLSL + shaders['disk.frag'],
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uInner: { value: opts.inner },
      uOuter: { value: opts.outer },
      uTempK: { value: 0 },
      uWrapAmount: { value: opts.wrapAmount },
      uWrapDir: { value: opts.wrapDir },
      uWrapOuter: { value: opts.wrapOuter },
      uIntensity: { value: opts.intensity },
      uBackOnly: { value: opts.backOnly },
      uSpeed: { value: 0.41 },
      uDoppler: { value: 0.18 },
      uHaze: { value: 0.05 },
      uRim: { value: 1.3 },
      uStreak: { value: 0.35 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(opts.geometry, material);
}

function makeParticles(shaders, { isMobile, pixelRatio, inner, outer }) {
  const capacity = 10000;
  const defaultCount = isMobile ? 1600 : 4200;

  const aRadius = new Float32Array(capacity);
  const aTheta = new Float32Array(capacity);
  const aY = new Float32Array(capacity);
  const aSize = new Float32Array(capacity);
  const aSeed = new Float32Array(capacity);

  for (let i = 0; i < capacity; i++) {
    const rr = Math.pow(Math.random(), 1.5);
    aRadius[i] = inner + 0.15 + rr * (outer - inner - 0.3);
    aTheta[i] = Math.random() * Math.PI * 2;
    aY[i] = (Math.random() - Math.random()) * (0.05 + rr * 0.16);
    aSize[i] = 0.03 + Math.pow(Math.random(), 2.0) * 0.13;
    aSeed[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(capacity * 3), 3));
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
  geometry.setAttribute('aTheta', new THREE.BufferAttribute(aTheta, 1));
  geometry.setAttribute('aY', new THREE.BufferAttribute(aY, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  geometry.setDrawRange(0, defaultCount);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), OUTER + 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: shaders['particles.vert'],
    fragmentShader: BLACKBODY_GLSL + shaders['particles.frag'],
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uInner: { value: INNER },
      uOuter: { value: OUTER },
      uTempK: { value: 0 },
      uSpeedInner: { value: 0.41 },
      uSpeedOuter: { value: 0.23 },
      uWrapAmount: { value: 0.7 },
      uWrapOuter: { value: 3.7 },
      uSizeScale: { value: 1.0 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

export function createAccretionDisk(shaders, { isMobile, pixelRatio }) {
  const group = new THREE.Group();
  let inner = INNER;
  let outer = OUTER;

  const geometry = new THREE.RingGeometry(
    inner,
    outer,
    isMobile ? 200 : 320,
    isMobile ? 10 : 18
  );

  const upper = makeDiskMesh(shaders, {
    geometry,
    inner,
    outer,
    wrapAmount: 0.7,
    wrapDir: 1.0,
    wrapOuter: 3.7,
    intensity: 1.0,
    backOnly: 0
  });

  const lower = makeDiskMesh(shaders, {
    geometry,
    inner,
    outer,
    wrapAmount: 0.66,
    wrapDir: -0.62,
    wrapOuter: 3.3,
    intensity: 0.85,
    backOnly: 1
  });

  const particles = makeParticles(shaders, { isMobile, pixelRatio, inner, outer });
  const particleCount = particles.geometry.getAttribute('aRadius').count;
  const particleDefault = isMobile ? 1600 : 4200;

  group.add(upper, lower, particles);

  return {
    group,
    particleCount,
    particleDefault,
    materials: {
      upper: upper.material,
      lower: lower.material,
      particles: particles.material
    },
    update(time, reveal) {
      for (const mesh of [upper, lower]) {
        mesh.material.uniforms.uTime.value = time;
        mesh.material.uniforms.uReveal.value = reveal;
      }
      const u = particles.material.uniforms;
      u.uTime.value = time;
      u.uReveal.value = reveal;
    },
    setPixelRatio(pr) {
      particles.material.uniforms.uPixelRatio.value = pr;
    },
    setParticleCount(n) {
      particles.geometry.setDrawRange(0, Math.max(0, Math.min(particleCount, Math.floor(n))));
    },
    setParticleFraction(f) {
      particles.geometry.setDrawRange(0, Math.max(1, Math.floor(particleDefault * f)));
    },
    setRadii(newInner, newOuter) {
      const prevInner = inner;
      const prevOuter = outer;
      const span = Math.max(1e-4, prevOuter - prevInner - 0.3);

      inner = newInner;
      outer = newOuter;

      for (const m of [upper, lower, particles]) {
        m.material.uniforms.uInner.value = inner;
        m.material.uniforms.uOuter.value = outer;
      }

      const nextGeometry = new THREE.RingGeometry(
        inner,
        outer,
        isMobile ? 200 : 320,
        isMobile ? 10 : 18
      );
      const oldGeometry = upper.geometry;
      upper.geometry = nextGeometry;
      lower.geometry = nextGeometry;
      oldGeometry.dispose();

      const aR = particles.geometry.getAttribute('aRadius');
      const nextSpan = Math.max(0, outer - inner - 0.3);
      for (let i = 0; i < aR.count; i++) {
        const t = (aR.array[i] - prevInner - 0.15) / span;
        aR.array[i] = inner + 0.15 + t * nextSpan;
      }
      aR.needsUpdate = true;
      particles.geometry.boundingSphere.radius = outer + 1;
    }
  };
}
