attribute float aRadius;
attribute float aTheta;
attribute float aY;
attribute float aSize;
attribute float aSeed;

uniform float uTime;
uniform float uPixelRatio;
uniform float uSizeScale;
uniform float uInner;
uniform float uOuter;
uniform float uWrapAmount;
uniform float uWrapOuter;

varying float vT;
varying float vTw;

void main() {
  float speed = 0.41 / pow(aRadius, 1.5);
  float th = aTheta + uTime * speed;
  float wob = sin(uTime * 0.35 + aSeed * 87.0) * 0.10 + sin(uTime * 0.13 + aSeed * 31.0) * 0.06;
  float r = aRadius + wob;
  float y = aY;

  vec3 pos = vec3(cos(th) * r, y, -sin(th) * r);

  float backness = clamp(-pos.z / max(r, 1e-4), 0.0, 1.0);
  float wrapW = 1.0 - smoothstep(uInner, uWrapOuter, r);
  float psi = backness * backness * wrapW * uWrapAmount;
  float s = sin(psi);
  float c = cos(psi);
  pos = vec3(pos.x, pos.y * c - pos.z * s, pos.y * s + pos.z * c);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * uSizeScale * uPixelRatio * (150.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;

  vT = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  vTw = 0.6 + 0.4 * sin(uTime * (0.6 + fract(aSeed * 7.31)) + aSeed * 90.0);
}
