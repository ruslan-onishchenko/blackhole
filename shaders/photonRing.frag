uniform float uTime;
uniform float uReveal;

varying vec2 vPos;

void main() {
  float r = length(vPos);

  float core = exp(-pow((r - 1.28) / 0.018, 2.0));
  float wide = exp(-pow((r - 1.28) / 0.05, 2.0)) * 0.10;
  float shimmer = 0.92 + 0.08 * sin(r * 46.0 - uTime * 1.4);

  vec3 emis = vec3(1.0, 0.72, 0.32);
  vec3 ring = emis * (core * 1.5 + wide) * shimmer * uReveal;

  gl_FragColor = vec4(ring, 1.0);
}
