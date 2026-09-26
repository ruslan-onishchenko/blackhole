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

  vec3 nv = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
  vec3 f = normalize(core);
  float side = dot(nv, -core) >= 0.0 ? 1.0 : -1.0;
  vec3 lift = nv * side;
  lift -= f * dot(f, lift);
  lift /= max(length(lift), 1e-4);
  vec3 axis = cross(f, lift);
  axis /= max(length(axis), 1e-4);

  float angFade = smoothstep(0.05, 0.45, backness);
  float radFade = 1.0 - smoothstep(uWrapOuter * 0.7, uWrapOuter, r);
  float psi = angFade * radFade * uWrapAmount * uWrapDir;

  float sn = sin(psi);
  float cn = cos(psi);
  d = d * cn + cross(axis, d) * sn + axis * dot(axis, d) * (1.0 - cn);

  gl_Position = projectionMatrix * vec4(core + d, 1.0);
}
