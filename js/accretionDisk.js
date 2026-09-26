import * as THREE from 'three';

export const INNER = 2.3;
export const OUTER = 5.4;

function makeDiskMesh(shaders, opts) {
  const material = new THREE.ShaderMaterial({
    vertexShader: shaders['disk.vert'],
    fragmentShader: shaders['disk.frag'],
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uInner: { value: INNER },
      uOuter: { value: OUTER },
      uWrapAmount: { value: opts.wrapAmount },
      uWrapDir: { value: opts.wrapDir },
      uWrapOuter: { value: opts.wrapOuter },
      uIntensity: { value: opts.intensity },
      uBackOnly: { value: opts.backOnly }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(opts.geometry, material);
}

function makeParticles(shaders, { isMobile, pixelRatio }) {
  const count = isMobile ? 1600 : 4200;

  const aRadius = new Float32Array(count);
  const aTheta = new Float32Array(count);
  const aY = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aSeed = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const rr = Math.pow(Math.random(), 1.5);
    aRadius[i] = INNER + 0.15 + rr * (OUTER - INNER - 0.3);
    aTheta[i] = Math.random() * Math.PI * 2;
    aY[i] = (Math.random() - Math.random()) * (0.05 + rr * 0.16);
    aSize[i] = 0.06 + Math.pow(Math.random(), 2.0) * 0.26;
    aSeed[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
  geometry.setAttribute('aTheta', new THREE.BufferAttribute(aTheta, 1));
  geometry.setAttribute('aY', new THREE.BufferAttribute(aY, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), OUTER + 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: shaders['particles.vert'],
    fragmentShader: shaders['particles.frag'],
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uInner: { value: INNER },
      uOuter: { value: OUTER },
      uWrapAmount: { value: 0.7 },
      uWrapOuter: { value: 3.7 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

export function createAccretionDisk(shaders, { isMobile, pixelRatio }) {
  const group = new THREE.Group();

  const geometry = new THREE.RingGeometry(
    INNER,
    OUTER,
    isMobile ? 200 : 320,
    isMobile ? 10 : 18
  );

  const upper = makeDiskMesh(shaders, {
    geometry,
    wrapAmount: 0.7,
    wrapDir: 1.0,
    wrapOuter: 3.7,
    intensity: 1.0,
    backOnly: 0
  });

  const lower = makeDiskMesh(shaders, {
    geometry,
    wrapAmount: 0.66,
    wrapDir: -0.62,
    wrapOuter: 3.3,
    intensity: 0.85,
    backOnly: 1
  });

  const particles = makeParticles(shaders, { isMobile, pixelRatio });

  group.add(upper, lower, particles);

  return {
    group,
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
    setParticleFraction(f) {
      const total = particles.geometry.getAttribute('aRadius').count;
      particles.geometry.setDrawRange(0, Math.max(1, Math.floor(total * f)));
    }
  };
}
