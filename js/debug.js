function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
#debug-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  color: #d8cfe8;
  user-select: none;
}
#debug-toggle {
  pointer-events: auto;
  position: absolute;
  top: 12px;
  left: 12px;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 150, 50, 0.45);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 42%, #1a0e04 0%, #060309 62%, #02050a 100%);
  color: #ffb35c;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 140, 40, 0.35), inset 0 0 8px rgba(255, 120, 30, 0.18);
  text-shadow: 0 0 6px rgba(255, 150, 60, 0.8);
}
#debug-toggle:hover {
  border-color: rgba(255, 175, 80, 0.9);
  box-shadow: 0 0 16px rgba(255, 150, 50, 0.55), inset 0 0 10px rgba(255, 130, 40, 0.3);
}
#debug-panel {
  pointer-events: auto;
  position: absolute;
  top: 54px;
  left: 12px;
  width: 300px;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid rgba(170, 120, 255, 0.16);
  border-radius: 12px;
  background:
    radial-gradient(130% 90% at 20% 0%, rgba(255, 110, 25, 0.055) 0%, rgba(0, 0, 0, 0) 55%),
    linear-gradient(180deg, rgba(11, 7, 24, 0.95) 0%, rgba(5, 3, 12, 0.95) 100%);
  backdrop-filter: blur(8px);
  box-shadow:
    0 0 24px rgba(0, 0, 0, 0.7),
    0 0 60px rgba(255, 110, 25, 0.06),
    inset 0 0 24px rgba(35, 12, 55, 0.4);
}
#debug-panel.hidden { display: none; }
#debug-panel::-webkit-scrollbar { width: 8px; }
#debug-panel::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.03); border-radius: 4px; }
#debug-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(255, 130, 40, 0.4), rgba(170, 120, 255, 0.3));
  border-radius: 4px;
}
#debug-panel .dbg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ffc27a;
  text-shadow: 0 0 12px rgba(255, 140, 40, 0.45);
}
#debug-panel .dbg-close {
  border: none;
  background: none;
  color: #a08fc4;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  text-shadow: none;
}
#debug-panel .dbg-close:hover { color: #ffb35c; }
#debug-panel .dbg-stats {
  margin-bottom: 12px;
  padding: 7px 9px;
  border-radius: 6px;
  border: 1px solid rgba(170, 120, 255, 0.14);
  background:
    linear-gradient(90deg, rgba(255, 120, 30, 0.07) 0%, rgba(48, 22, 78, 0.28) 60%, rgba(0, 0, 0, 0.1) 100%);
  color: #c29dff;
}
#debug-panel .dbg-stats #dbg-fps { color: #ffc27a; text-shadow: 0 0 8px rgba(255, 140, 40, 0.5); }
#debug-panel .dbg-section { margin-bottom: 12px; }
#debug-panel .dbg-section-title {
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(255, 140, 45, 0.75), rgba(170, 120, 255, 0.32) 55%, rgba(0, 0, 0, 0)) 1;
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 11px;
  color: #e8b07a;
}
#debug-panel .dbg-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: 'label value' 'input input';
  gap: 3px 8px;
  margin-bottom: 9px;
}
#debug-panel .dbg-label {
  grid-area: label;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #b8a8d0;
}
#debug-panel .dbg-value {
  grid-area: value;
  color: #ffc27a;
  text-align: right;
  text-shadow: 0 0 8px rgba(255, 140, 40, 0.4);
}
#debug-panel input[type='range'] {
  grid-area: input;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 18px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
#debug-panel input[type='range']:focus { outline: none; }
#debug-panel input[type='range']::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #120a2e 0%, #3a2560 30%, #7a4a1a 70%, #ff8c2a 100%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 6px rgba(255, 120, 35, 0.12);
}
#debug-panel input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  margin-top: -4px;
  border-radius: 50%;
  border: 1px solid rgba(255, 200, 130, 0.85);
  background: radial-gradient(circle at 38% 32%, #fff3dd 0%, #ffc06a 42%, #b1571a 100%);
  box-shadow: 0 0 8px rgba(255, 150, 50, 0.85), 0 0 18px rgba(255, 110, 25, 0.45);
  transition: box-shadow 0.15s ease;
}
#debug-panel input[type='range']:hover::-webkit-slider-thumb {
  box-shadow: 0 0 12px rgba(255, 170, 70, 1), 0 0 26px rgba(255, 120, 30, 0.65);
}
#debug-panel input[type='range']::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #120a2e 0%, #3a2560 30%, #7a4a1a 70%, #ff8c2a 100%);
}
#debug-panel input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 200, 130, 0.85);
  background: radial-gradient(circle at 38% 32%, #fff3dd 0%, #ffc06a 42%, #b1571a 100%);
  box-shadow: 0 0 8px rgba(255, 150, 50, 0.85), 0 0 18px rgba(255, 110, 25, 0.45);
}
#debug-panel .dbg-reset {
  width: 100%;
  padding: 6px 0;
  border: 1px solid rgba(255, 150, 50, 0.35);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(50, 25, 8, 0.55), rgba(15, 8, 4, 0.55));
  color: #ffc27a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 11px;
  cursor: pointer;
}
#debug-panel .dbg-reset:hover {
  border-color: rgba(255, 175, 80, 0.8);
  box-shadow: 0 0 12px rgba(255, 130, 40, 0.35);
}
`;
  document.head.appendChild(style);
}

export function createDebugPanel({ disk, stars, setSize, setCamYaw, setCamPitch }) {
  if (!new URLSearchParams(window.location.search).has('debug')) return null;

  document.getElementById('debug-root')?.remove();

  injectStyles();

  const MAX_PARTICLES = disk.particleCount;
  const MAX_STARS = stars.count;
  const resetFns = [];

  const root = document.createElement('div');
  root.id = 'debug-root';

  const toggle = document.createElement('button');
  toggle.id = 'debug-toggle';
  toggle.textContent = '⚙';
  toggle.title = 'Debug panel (Backquote)';

  const panel = document.createElement('div');
  panel.id = 'debug-panel';

  const header = document.createElement('div');
  header.className = 'dbg-header';

  const title = document.createElement('span');
  title.textContent = 'Debug';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dbg-close';
  closeBtn.textContent = '×';

  header.append(title, closeBtn);
  panel.appendChild(header);

  const stats = document.createElement('div');
  stats.className = 'dbg-stats';
  stats.innerHTML = '<span id="dbg-fps">--</span> fps · <span id="dbg-ms">--</span> ms';
  panel.appendChild(stats);

  function section(label) {
    const el = document.createElement('div');
    el.className = 'dbg-section';
    const h = document.createElement('div');
    h.className = 'dbg-section-title';
    h.textContent = label;
    el.appendChild(h);
    panel.appendChild(el);
    return el;
  }

  function slider(parent, label, min, max, step, value, onChange, fmt) {
    const row = document.createElement('div');
    row.className = 'dbg-row';

    const name = document.createElement('span');
    name.className = 'dbg-label';
    name.textContent = label;

    const val = document.createElement('span');
    val.className = 'dbg-value';
    const format = fmt || ((v) => v.toFixed(2));
    val.textContent = format(value);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      val.textContent = format(v);
      onChange(v);
    });

    row.append(name, val, input);
    parent.appendChild(row);
    return input;
  }

  function registerReset(input, defaultValue) {
    resetFns.push(() => {
      input.value = String(defaultValue);
      input.dispatchEvent(new Event('input'));
    });
  }

  function addResetButton() {
    const btn = document.createElement('button');
    btn.className = 'dbg-reset';
    btn.textContent = 'Reset';
    btn.addEventListener('click', () => resetFns.forEach((fn) => fn()));
    panel.appendChild(btn);
  }

  // --- Particles ---

  const sp = section('Частицы диска');

  const countInput = slider(
    sp, 'Количество', 0, MAX_PARTICLES, 50, disk.particleDefault,
    (v) => disk.setParticleCount(v),
    (v) => String(v | 0)
  );
  registerReset(countInput, disk.particleDefault);

  const sizeInput = slider(
    sp, 'Размер', 0.1, 3, 0.05, 1,
    (v) => { disk.materials.particles.uniforms.uSizeScale.value = v; }
  );
  registerReset(sizeInput, 1);

  const starsInput = slider(
    sp, 'Звёзды: кол-во', 0, MAX_STARS, 1, MAX_STARS,
    (v) => stars.setStarFraction(v / MAX_STARS),
    (v) => String(v | 0)
  );
  registerReset(starsInput, MAX_STARS);

  // --- Scene ---

  if (setSize) {
    const ss = section('Сцена');
    const sizeInput = slider(
      ss, 'Размер объекта (% ширины)', 10, 100, 1, 80,
      (v) => setSize(v / 100),
      (v) => `${v | 0}%`
    );
    registerReset(sizeInput, 80);

    if (setCamYaw) {
      const yawInput = slider(
        ss, 'Азимут камеры', -180, 180, 1, 0,
        setCamYaw,
        (v) => `${v | 0}°`
      );
      registerReset(yawInput, 0);
    }

    if (setCamPitch) {
      const pitchInput = slider(
        ss, 'Наклон камеры', -85, 85, 1, 5,
        setCamPitch,
        (v) => `${v | 0}°`
      );
      registerReset(pitchInput, 5);
    }
  }

  // --- Veil ---

  const sv = section('Вуаль (диск-меш)');

  const veilSliders = [
    ['Яркость верх', 'uIntensity', 'upper', 0, 2, 0.01, 1.0],
    ['Яркость низ', 'uIntensity', 'lower', 0, 2, 0.01, 0.85],
    ['Скорость вращения', 'uSpeed', 'both', 0, 1.2, 0.01, 0.41],
    ['Доплер', 'uDoppler', 'both', 0, 0.6, 0.01, 0.18],
    ['Дымка (haze)', 'uHaze', 'both', 0, 0.3, 0.005, 0.05],
    ['Кромка (rim)', 'uRim', 'both', 0, 3, 0.05, 1.3],
    ['Прожилки (streak)', 'uStreak', 'both', 0, 1, 0.01, 0.35],
    ['Заворот верх', 'uWrapAmount', 'upper', 0, 1.5, 0.01, 0.7],
    ['Заворот низ', 'uWrapAmount', 'lower', 0, 1.5, 0.01, 0.66]
  ];

  for (const [label, uniform, target, min, max, step, def] of veilSliders) {
    const targets =
      target === 'both' ? ['upper', 'lower'] : [target];
    const input = slider(sv, label, min, max, step, def, (v) => {
      for (const t of targets) {
        disk.materials[t].uniforms[uniform].value = v;
      }
    });
    registerReset(input, def);
  }

  const wrapDirInput = slider(
    sv, 'Направление заворота (низ)', -1, 1, 0.01, -0.62,
    (v) => { disk.materials.lower.uniforms.uWrapDir.value = v; }
  );
  registerReset(wrapDirInput, -0.62);

  addResetButton();

  root.append(panel, toggle);
  document.body.appendChild(root);

  const fpsEl = root.querySelector('#dbg-fps');
  const msEl = root.querySelector('#dbg-ms');

  function setVisible(v) {
    panel.classList.toggle('hidden', !v);
  }

  toggle.addEventListener('click', () => {
    setVisible(panel.classList.contains('hidden'));
  });
  closeBtn.addEventListener('click', () => setVisible(false));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote') {
      e.preventDefault();
      setVisible(panel.classList.contains('hidden'));
    }
  });

  let acc = 0;
  let frames = 0;

  return {
    frame(dt) {
      if (dt <= 0) return;
      acc += dt;
      frames++;
      if (acc >= 0.5) {
        fpsEl.textContent = (frames / acc).toFixed(1);
        msEl.textContent = ((acc / frames) * 1000).toFixed(1);
        acc = 0;
        frames = 0;
      }
    }
  };
}
