varying vec3 vPos;

void main() {
  float h = normalize(vPos).y * 0.5 + 0.5;

  vec3 top = vec3(0.0, 0.0, 0.0);
  vec3 mid = vec3(0.0, 0.0, 0.0);
  vec3 bot = vec3(0.0, 0.0, 0.0);

  vec3 col = mix(bot, mid, smoothstep(0.15, 0.55, h));
  col = mix(col, top, smoothstep(0.55, 1.0, h));

  gl_FragColor = vec4(col, 1.0);
}
