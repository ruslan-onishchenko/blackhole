uniform float uTime;
uniform float uInner;
uniform float uOuter;
uniform float uWrapAmount;
uniform float uWrapDir;
uniform float uWrapOuter;

varying float vR;
varying float vTheta;
varying float vWrapMask;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 p = position.xy;
  float r = length(p);
  float theta = atan(p.y, p.x);
  vR = r;
  vTheta = theta;

  float y = 0.0;

  vec3 pos = vec3(p.x, y, -p.y);

  float backness = clamp(-pos.z / max(r, 1e-4), 0.0, 1.0);
  float wrapW = 1.0 - smoothstep(uInner, uWrapOuter, r);
  vWrapMask = backness * backness * wrapW;
  float psi = vWrapMask * uWrapAmount * uWrapDir;
  float s = sin(psi);
  float c = cos(psi);
  pos = vec3(pos.x, pos.y * c - pos.z * s, pos.y * s + pos.z * c);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
