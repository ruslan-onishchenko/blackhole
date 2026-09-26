uniform float uTime;
uniform float uReveal;
uniform float uInner;
uniform float uOuter;
uniform float uIntensity;
uniform float uBackOnly;
uniform float uSpeed;
uniform float uDoppler;
uniform float uHaze;
uniform float uRim;
uniform float uStreak;

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = clamp((vR - uInner) / (uOuter - uInner), 0.0, 1.0);

  float speed = uSpeed / pow(max(vR, 0.001), 1.5);
  float ang = vTheta - uTime * speed;
  vec2 rot = vec2(cos(ang), sin(ang));

  float n1 = fbm(rot * vR * 0.55 + vec2(0.0, uTime * 0.03));
  float n2 = fbm(rot * 2.4 + vec2(vR * 1.6 - uTime * 0.18, 0.0) + n1 * 1.3);

  vec3 base = vec3(0.012, 0.004, 0.001);

  vec3 emis;
  if (uTempK > 0.5) {
    float kk = uTempK * pow(uInner / max(vR, 0.001), 0.2);
    emis = tempColor(kk);
  } else {
    emis = mix(vec3(1.0, 0.72, 0.32), vec3(1.0, 0.55, 0.18), smoothstep(0.1, 0.7, t));
  }

  float fil = smoothstep(0.58, 0.94, n2 * (0.75 + 0.25 * n1));
  fil *= 0.55 + 0.45 * smoothstep(0.55, 0.15, t);
  float streak = smoothstep(0.60, 0.92, n1) * uStreak;
  float haze = uHaze * n1;

  float doppler = 1.0 + uDoppler * cos(vTheta + 0.8);

  float edgeIn = smoothstep(0.0, 0.0075, t) * (1.0 - smoothstep(0.0075, 0.045, t));
  float rim = edgeIn * uRim * (0.6 + 0.6 * n2);

  float light = (fil * 1.5 + streak) * doppler + haze + rim;

  float fadeIn = smoothstep(0.0, 0.03, t);
  float fadeOut = 1.0 - smoothstep(0.78, 1.0, t);
  float alpha = fadeIn * fadeOut * (0.30 + 0.70 * clamp(n1, 0.0, 1.0));
  alpha *= mix(1.0, vWrapMask, uBackOnly);
  alpha *= uReveal;

  gl_FragColor = vec4(base + emis * light * uIntensity, alpha);
}
