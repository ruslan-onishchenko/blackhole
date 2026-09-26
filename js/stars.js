import * as THREE from 'three';

export function createStarField(shaders, { isMobile, pixelRatio }) {
  const count = isMobile ? 700 : 2200;

  const positions = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  const palette = [
    [1.0, 1.0, 1.0],
    [0.78, 0.85, 1.0],
    [1.0, 0.92, 0.8]
  ];

  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 60 + Math.random() * 50;

    positions[i * 3] = s * Math.cos(phi) * r;
    positions[i * 3 + 1] = u * r;
    positions[i * 3 + 2] = s * Math.sin(phi) * r;

    aSize[i] = 0.9 + Math.pow(Math.random(), 2.5) * 2.3;
    aPhase[i] = Math.random() * Math.PI * 2;
    aSpeed[i] = Math.random() < 0.35 ? 0.3 + Math.random() * 1.4 : 0;

    const c = palette[(Math.random() * palette.length) | 0];
    const b = 0.15 + Math.random() * 0.2;
    aColor[i * 3] = c[0] * b;
    aColor[i * 3 + 1] = c[1] * b;
    aColor[i * 3 + 2] = c[2] * b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));

  const material = new THREE.ShaderMaterial({
    vertexShader: shaders['stars.vert'],
    fragmentShader: shaders['stars.frag'],
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: pixelRatio }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    count,
    update(time, reveal) {
      material.uniforms.uTime.value = time;
      material.uniforms.uReveal.value = reveal;
    },
    setPixelRatio(pr) {
      material.uniforms.uPixelRatio.value = pr;
    },
    setStarFraction(f) {
      geometry.setDrawRange(0, Math.max(1, Math.floor(count * f)));
    }
  };
}
