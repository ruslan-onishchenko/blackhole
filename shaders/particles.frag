uniform float uReveal;

varying float vT;
varying float vTw;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float shape = smoothstep(0.5, 0.05, dist);

  vec3 col = mix(vec3(1.0, 0.92, 0.75), vec3(1.0, 0.70, 0.28), smoothstep(0.05, 0.5, vT));
  col = mix(col, vec3(0.91, 0.36, 0.02), smoothstep(0.45, 1.0, vT));

  float b = mix(1.4, 0.5, vT) * vTw;
  float alpha = shape * uReveal * mix(0.9, 0.3, vT);

  gl_FragColor = vec4(col * b, alpha);
}
