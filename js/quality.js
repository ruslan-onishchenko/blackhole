export function createAdaptiveQuality({
  initialPixelRatio,
  applyPixelRatio,
  reduceParticles,
  reduceStars,
  reduceResolution
}) {
  const stages = [];

  const midRatio = Math.max(1, initialPixelRatio * 0.75);
  if (midRatio < initialPixelRatio) stages.push(() => applyPixelRatio(midRatio));
  if (midRatio > 1) stages.push(() => applyPixelRatio(1));

  stages.push(() => reduceParticles(0.6));
  stages.push(() => {
    reduceParticles(0.35);
    reduceStars(0.6);
  });
  stages.push(() => reduceResolution(0.7));

  let stage = 0;
  let acc = 0;
  let frames = 0;
  let cooldownUntil = 0;

  return {
    frame(dt, elapsed) {
      if (dt <= 0 || dt >= 0.5 || elapsed < 3 || stage >= stages.length) return;

      acc += dt;
      frames++;
      if (acc < 2) return;

      const fps = frames / acc;
      acc = 0;
      frames = 0;

      if (fps >= 35 || elapsed < cooldownUntil) return;
      cooldownUntil = elapsed + 3;
      stages[stage++]();
    }
  };
}
