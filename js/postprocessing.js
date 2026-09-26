import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const MASK_RADIUS = 1.1;
const MASK_FEATHER = 0.12;

const CoreMaskShader = {
  uniforms: {
    tDiffuse: { value: null },
    uCamPos: { value: new THREE.Vector3() },
    uInvViewProj: { value: new THREE.Matrix4() },
    uCoreRadius: { value: MASK_RADIUS },
    uFeather: { value: MASK_FEATHER },
    uDiskNormal: { value: new THREE.Vector3(0, 1, 0) },
    uDiskInner: { value: 2.3 },
    uDiskOuter: { value: 5.4 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uCamPos;
    uniform mat4 uInvViewProj;
    uniform float uCoreRadius;
    uniform float uFeather;
    uniform vec3 uDiskNormal;
    uniform float uDiskInner;
    uniform float uDiskOuter;
    varying vec2 vUv;

    void main() {
      vec4 col = texture2D(tDiffuse, vUv);

      vec2 ndc = vUv * 2.0 - 1.0;
      vec4 w = uInvViewProj * vec4(ndc, 1.0, 1.0);
      vec3 world = w.xyz / w.w;
      vec3 rd = normalize(world - uCamPos);

      float b = length(cross(rd, uCamPos));
      float silhouette = 1.0 - smoothstep(uCoreRadius, uCoreRadius + uFeather, b);

      float tc = dot(-uCamPos, rd);
      float disc = sqrt(max(uCoreRadius * uCoreRadius - b * b, 0.0));
      float tHit = tc - disc;

      float dn = dot(rd, uDiskNormal);
      float tPlane = dot(-uCamPos, uDiskNormal) / dn;
      vec3 hp = uCamPos + rd * tPlane;
      float rPlane = length(hp - uDiskNormal * dot(hp, uDiskNormal));

      float diskInFront = 0.0;
      if (abs(dn) > 1e-4 && tPlane > 0.0 && tPlane < tHit - 0.02 &&
          rPlane > uDiskInner && rPlane < uDiskOuter) {
        diskInFront = 1.0;
      }

      float inside = silhouette * (1.0 - diskInFront);

      gl_FragColor = vec4(col.rgb * (1.0 - inside), col.a);
    }
  `
};

export function createPostProcessing(renderer, scene, camera, { isMobile, diskNormal, diskInner, diskOuter }) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.32 : 0.42,
    0.3,
    0.62
  );
  composer.addPass(bloom);

  const coreMask = new ShaderPass(CoreMaskShader);
  coreMask.uniforms.uDiskNormal.value.copy(diskNormal);
  coreMask.uniforms.uDiskInner.value = diskInner;
  coreMask.uniforms.uDiskOuter.value = diskOuter;
  const renderCoreMask = coreMask.render.bind(coreMask);
  coreMask.render = (passRenderer, writeBuffer, readBuffer, deltaTime, maskActive) => {
    camera.updateMatrixWorld();
    coreMask.uniforms.uCamPos.value.copy(camera.position);
    coreMask.uniforms.uInvViewProj.value
      .copy(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)
      .invert();
    renderCoreMask(passRenderer, writeBuffer, readBuffer, deltaTime, maskActive);
  };
  composer.addPass(coreMask);

  composer.addPass(new OutputPass());

  return { composer, bloom, coreMask };
}
