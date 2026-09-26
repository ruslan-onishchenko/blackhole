uniform float uReveal;

varying vec3 vColor;
varying float vTw;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, dist);
  gl_FragColor = vec4(vColor * vTw, a * uReveal * 0.7);
}
