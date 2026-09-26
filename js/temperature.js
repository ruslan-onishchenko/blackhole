export const TEMPERATURE_PROFILES = [
  { id: 'default', name: 'Дефолт (текущие цвета)', tempK: 0 },
  { id: 'candle', name: 'Тёплый · 2600K', tempK: 2600 },
  { id: 'warm', name: 'Тёплый · 3400K', tempK: 3400 },
  { id: 'warmwhite', name: 'Тёпло-белый · 4500K', tempK: 4500 },
  { id: 'neutral', name: 'Нейтральный · 5800K', tempK: 5800 },
  { id: 'cold', name: 'Холодный · 8000K', tempK: 8000 },
  { id: 'ice', name: 'Ледяной · 12000K', tempK: 12000 }
];

// Blackbody color approximation (Tanner Helland fit).
// Injected before disk.frag / particles.frag; declares uTempK.
// uTempK = 0 bypasses the engine and keeps the original hardcoded palette.
export const BLACKBODY_GLSL = `
uniform float uTempK;

vec3 blackbody(float kelvin) {
  float t = clamp(kelvin, 1000.0, 40000.0) / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.292936186 * pow(t - 60.0, -0.1332047592), 0.0, 1.0);
  float g = t <= 66.0 ? clamp(0.39008157876 * log(t) - 0.63184144378, 0.0, 1.0)
                      : clamp(1.1298908609 * pow(t - 60.0, -0.0755148492), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432067891 * log(t - 10.0) - 1.1962540891, 0.0, 1.0));
  return vec3(r, g, b);
}

vec3 tempColor(float kelvin) {
  vec3 c = blackbody(kelvin);
  float cold = smoothstep(5500.0, 12000.0, kelvin);
  c = mix(c, vec3(c.r * 0.45, c.g * 0.7, min(1.0, c.b * 1.15)), cold);
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return clamp(mix(vec3(l), c, 3.0), 0.0, 1.0);
}
`;

export function createTemperatureEngine(disk, blackHole) {
  const setVeilTemp = (k) => {
    disk.materials.upper.uniforms.uTempK.value = k;
    disk.materials.lower.uniforms.uTempK.value = k;
  };

  const setParticlesTemp = (k) => {
    disk.materials.particles.uniforms.uTempK.value = k;
  };

  const setGlowTemp = (k) => {
    if (!blackHole) return;
    blackHole.materials.halo.uniforms.uTempK.value = k;
    blackHole.materials.photonRing.uniforms.uTempK.value = k;
  };

  return {
    profiles: TEMPERATURE_PROFILES,
    setVeilTemp,
    setParticlesTemp,
    setGlowTemp,
    setTemp(k) {
      setVeilTemp(k);
      setParticlesTemp(k);
      setGlowTemp(k);
    },
    getProfile(id) {
      return TEMPERATURE_PROFILES.find((p) => p.id === id) || TEMPERATURE_PROFILES[0];
    }
  };
}
