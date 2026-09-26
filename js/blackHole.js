import * as THREE from 'three';

export function createBlackHole(shaders) {
  const group = new THREE.Group();

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 64, 48),
    new THREE.ShaderMaterial({
      vertexShader: shaders['blackHole.vert'],
      fragmentShader: shaders['blackHole.frag'],
      uniforms: {
        uReveal: { value: 0 }
      }
    })
  );
  group.add(horizon);

  const photonRing = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.75, 128),
    new THREE.ShaderMaterial({
      vertexShader: shaders['photonRing.vert'],
      fragmentShader: shaders['photonRing.frag'],
      uniforms: {
        uTime: { value: 0 },
        uReveal: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  group.add(photonRing);

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.ShaderMaterial({
      vertexShader: shaders['halo.vert'],
      fragmentShader: shaders['halo.frag'],
      uniforms: {
        uReveal: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  group.add(halo);

  return {
    group,
    update(time, reveal, camera) {
      horizon.material.uniforms.uReveal.value = reveal;
      photonRing.material.uniforms.uTime.value = time;
      photonRing.material.uniforms.uReveal.value = reveal;
      halo.material.uniforms.uReveal.value = reveal;
      photonRing.lookAt(camera.position);
      halo.lookAt(camera.position);
    }
  };
}
