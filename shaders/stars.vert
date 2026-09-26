attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
attribute vec3 aColor;

uniform float uTime;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vTw;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio;
  vColor = aColor;
  vTw = 0.75 + 0.25 * sin(uTime * aSpeed + aPhase);
}
