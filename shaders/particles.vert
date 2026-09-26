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
  float r = aRadius;
  float y = aY;

  vec3 pos = vec3(cos(th) * r, y, -sin(th) * r);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec3 core = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 d = mv.xyz - core;

  float wrapW = 1.0 - smoothstep(uInner, uWrapOuter, r);
  float backness = clamp(-d.z / max(length(d), 1e-4), 0.0, 1.0);
  float psi = backness * backness * wrapW * uWrapAmount;
  float s = sin(psi);
  float c = cos(psi);
  d = vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);
  mv.xyz = core + d;
  gl_PointSize = aSize * uSizeScale * uPixelRatio * (150.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;

  vT = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  vTw = 0.6 + 0.4 * sin(uTime * (0.6 + fract(aSeed * 7.31)) + aSeed * 90.0);
}
