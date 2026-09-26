uniform float uReveal;

varying vec2 vPos;

void main() {
  float r = length(vPos) / 4.5;

  float glow = exp(-r * 6.0) * 0.065 + exp(-pow((r - 0.34) / 0.4, 2.0)) * 0.02;
  glow *= smoothstep(0.22, 0.33, r);
  glow *= 1.0 - 0.4 * clamp(vPos.y / 4.5, 0.0, 1.0);
  vec3 col;
  if (uTempK > 0.5) {
    col = mix(tempColor(uTempK), tempColor(uTempK * 0.6), clamp(r * 1.6, 0.0, 1.0));
  } else {
    col = mix(vec3(1.0, 0.85, 0.6), vec3(0.91, 0.36, 0.02), clamp(r * 1.6, 0.0, 1.0));
  }

  gl_FragColor = vec4(col * glow * uReveal, 1.0);
}
