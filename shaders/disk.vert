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

  vec3 pos = vec3(p.x, 0.0, -p.y);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec3 core = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 d = mv.xyz - core;

  float wrapW = 1.0 - smoothstep(uInner, uWrapOuter, r);
  float backness = clamp(-d.z / max(length(d), 1e-4), 0.0, 1.0);
  vWrapMask = backness * backness * wrapW;

  float psi = vWrapMask * uWrapAmount * uWrapDir;
  float s = sin(psi);
  float c = cos(psi);
  d = vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);

  gl_Position = projectionMatrix * vec4(core + d, 1.0);
}
