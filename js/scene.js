import * as THREE from 'three';

export function createScene(shaders) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );

  const background = new THREE.Mesh(
    new THREE.SphereGeometry(140, 32, 20),
    new THREE.ShaderMaterial({
      vertexShader: shaders['background.vert'],
      fragmentShader: shaders['background.frag'],
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false
    })
  );
  background.renderOrder = -1000;
  scene.add(background);

  return { scene, camera };
}
