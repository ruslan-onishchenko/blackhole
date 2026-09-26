import { createTemperatureEngine, TEMPERATURE_PROFILES } from './temperature.js';

const DBG_BASE_CSS = `
#debug-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  font-family: Verdana, Geneva, 'DejaVu Sans', sans-serif;
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
#debug-panel .dbg-section.dbg-collapsed-margin { margin-bottom: 6px; }
#debug-panel .dbg-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(255, 140, 45, 0.75), rgba(170, 120, 255, 0.32) 55%, rgba(0, 0, 0, 0)) 1;
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 11px;
  color: #e8b07a;
  cursor: pointer;
  user-select: none;
}
#debug-panel .dbg-section-title:hover { color: #ffd9a3; }
#debug-panel .dbg-arrow {
  flex: none;
  width: 12px;
  font-size: 10px;
  line-height: 1;
}
#debug-panel .dbg-section.collapsed .dbg-section-content { display: none; }
#debug-panel .dbg-section.collapsed .dbg-section-title { margin-bottom: 0; padding-bottom: 6px; }
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
#debug-panel input[type='text'] {
  grid-area: input;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 7px;
  border: 1px solid rgba(170, 120, 255, 0.28);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #d8cfe8;
  font: inherit;
}
#debug-panel input[type='text']:focus {
  outline: none;
  border-color: rgba(255, 175, 80, 0.6);
}
#debug-panel input[type='color'] {
  grid-area: input;
  width: 100%;
  height: 26px;
  padding: 0;
  border: 1px solid rgba(170, 120, 255, 0.28);
  border-radius: 4px;
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
#debug-panel .dbg-actions {
  display: flex;
  gap: 8px;
}
#debug-panel .dbg-btn {
  flex: 1;
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
#debug-panel .dbg-btn:hover {
  border-color: rgba(255, 175, 80, 0.8);
  box-shadow: 0 0 12px rgba(255, 130, 40, 0.35);
}
#debug-panel .dbg-btn.dbg-btn-violet {
  border-color: rgba(170, 120, 255, 0.35);
  background: linear-gradient(180deg, rgba(30, 16, 55, 0.55), rgba(10, 6, 20, 0.55));
  color: #c9b0ff;
}
#debug-panel .dbg-btn.dbg-btn-violet:hover {
  border-color: rgba(195, 160, 255, 0.8);
  box-shadow: 0 0 12px rgba(160, 110, 255, 0.35);
}
#debug-overlay {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 3, 8, 0.7);
  backdrop-filter: blur(3px);
  font-family: Verdana, Geneva, 'DejaVu Sans', sans-serif;
  font-size: 12px;
  color: #d8cfe8;
}
#debug-overlay.hidden { display: none; }
#debug-modal {
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid rgba(170, 120, 255, 0.25);
  border-radius: 12px;
  background:
    radial-gradient(130% 90% at 20% 0%, rgba(255, 110, 25, 0.05) 0%, rgba(0, 0, 0, 0) 55%),
    linear-gradient(180deg, rgba(11, 7, 24, 0.98) 0%, rgba(5, 3, 12, 0.98) 100%);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 80px rgba(255, 110, 25, 0.08);
}
#debug-modal .dbg-modal-title {
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc27a;
  text-shadow: 0 0 12px rgba(255, 140, 40, 0.45);
}
#debug-modal textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 260px;
  resize: vertical;
  padding: 12px;
  border: 1px solid rgba(170, 120, 255, 0.25);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #d8cfe8;
  font-family: Verdana, Geneva, 'DejaVu Sans', sans-serif;
  font-size: 12px;
  line-height: 1.65;
  user-select: text;
  white-space: pre;
}
#debug-modal textarea:focus {
  outline: none;
  border-color: rgba(255, 175, 80, 0.6);
  box-shadow: 0 0 14px rgba(255, 130, 40, 0.15);
}
#debug-modal .dbg-modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
`;

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = DBG_BASE_CSS;
  document.head.appendChild(style);
}

const PARAMS_FILE = 'params.json';

export function createDebugPanel({ disk, blackHole, stars, label, setSize, setCamYaw, setCamPitch, setCamRoll, setHorizon, setPhotonRing, setDiskRadii }) {
  const isDebug = new URLSearchParams(window.location.search).has('debug');

  if (isDebug) {
    document.getElementById('debug-root')?.remove();
    injectStyles();
  }

  const MAX_PARTICLES = disk.particleCount;
  const MAX_STARS = stars.count;
  const registry = new Map();

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

  function section(labelText) {
    const el = document.createElement('div');
    el.className = 'dbg-section';

    const h = document.createElement('div');
    h.className = 'dbg-section-title';

    const arrow = document.createElement('span');
    arrow.className = 'dbg-arrow';
    arrow.textContent = '▾';

    const txt = document.createElement('span');
    txt.textContent = labelText;

    h.append(arrow, txt);

    const content = document.createElement('div');
    content.className = 'dbg-section-content';

    h.addEventListener('click', () => {
      el.classList.toggle('collapsed');
      arrow.textContent = el.classList.contains('collapsed') ? '▸' : '▾';
    });

    el.append(h, content);
    panel.appendChild(el);
    return content;
  }

  function slider(parent, labelText, min, max, step, value, onChange, fmt) {
    const row = document.createElement('div');
    row.className = 'dbg-row';

    const name = document.createElement('span');
    name.className = 'dbg-label';
    name.textContent = labelText;

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

  function control(parent, labelText, inputEl) {
    const row = document.createElement('div');
    row.className = 'dbg-row';
    const name = document.createElement('span');
    name.className = 'dbg-label';
    name.textContent = labelText;
    inputEl.style.gridArea = 'input';
    row.append(name, inputEl);
    parent.appendChild(row);
    return inputEl;
  }

  function textInput(parent, labelText, value, onChange) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.addEventListener('input', () => onChange(input.value));
    return control(parent, labelText, input);
  }

  function colorInput(parent, labelText, value, onChange) {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.addEventListener('input', () => onChange(input.value));
    return control(parent, labelText, input);
  }

  function registerParam(key, input, defaultValue) {
    registry.set(key, { input, defaultValue });
  }

  function getParams() {
    const out = {};
    for (const [key, { input }] of registry) {
      out[key] = input.type === 'range' ? parseFloat(input.value) : input.value;
    }
    return out;
  }

  function applyParams(data) {
    if (!data || typeof data !== 'object') return;
    for (const [key, { input }] of registry) {
      if (!(key in data)) continue;
      input.value = String(data[key]);
      input.dispatchEvent(new Event('input'));
    }
  }

  function resetAll() {
    for (const [, { input, defaultValue }] of registry) {
      input.value = String(defaultValue);
      input.dispatchEvent(new Event('input'));
    }
  }

  function copyText(text, btn) {
    const done = () => {
      const old = btn.textContent;
      btn.textContent = 'Скопировано ✓';
      setTimeout(() => { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch { /* noop */ }
    ta.remove();
  }

  function showJsonPopup() {
    let overlay = document.getElementById('debug-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.querySelector('textarea').value = JSON.stringify(getParams(), null, 2);
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'debug-overlay';

    const modal = document.createElement('div');
    modal.id = 'debug-modal';

    const modalTitle = document.createElement('div');
    modalTitle.className = 'dbg-modal-title';
    modalTitle.textContent = 'Параметры (JSON)';

    const ta = document.createElement('textarea');
    ta.readOnly = true;
    ta.spellcheck = false;
    ta.value = JSON.stringify(getParams(), null, 2);

    const actions = document.createElement('div');
    actions.className = 'dbg-modal-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'dbg-btn';
    copyBtn.textContent = 'Копировать';
    copyBtn.addEventListener('click', () => copyText(ta.value, copyBtn));

    const closeBtn2 = document.createElement('button');
    closeBtn2.className = 'dbg-btn dbg-btn-violet';
    closeBtn2.textContent = 'Закрыть';
    closeBtn2.addEventListener('click', () => overlay.classList.add('hidden'));

    actions.append(copyBtn, closeBtn2);
    modal.append(modalTitle, ta, actions);
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
    document.body.appendChild(overlay);
  }

  // --- Particles ---

  const sp = section('Частицы диска');

  const countInput = slider(
    sp, 'Количество', 0, MAX_PARTICLES, 50, disk.particleDefault,
    (v) => disk.setParticleCount(v),
    (v) => String(v | 0)
  );
  registerParam('particles.count', countInput, disk.particleDefault);

  const sizeInput = slider(
    sp, 'Размер', 0.1, 3, 0.05, 1,
    (v) => { disk.materials.particles.uniforms.uSizeScale.value = v; }
  );
  registerParam('particles.size', sizeInput, 1);

  const pWrapInput = slider(
    sp, 'Заворот вверх', 0, 1.5, 0.01, 0.7,
    (v) => { disk.materials.particles.uniforms.uWrapAmount.value = v; }
  );
  registerParam('particles.wrap', pWrapInput, 0.7);

  const pWrapOuterInput = slider(
    sp, 'Заворот: зона', 1.5, 5.0, 0.01, 3.7,
    (v) => { disk.materials.particles.uniforms.uWrapOuter.value = v; }
  );
  registerParam('particles.wrapZone', pWrapOuterInput, 3.7);

  const pSpeedInnerInput = slider(
    sp, 'Скорость: у центра (внутр. край)', 0, 2, 0.01, 0.41,
    (v) => { disk.materials.particles.uniforms.uSpeedInner.value = v; }
  );
  registerParam('particles.speedInner', pSpeedInnerInput, 0.41);

  const pSpeedOuterInput = slider(
    sp, 'Скорость: у края (внешн. край)', 0, 2, 0.01, 0.23,
    (v) => { disk.materials.particles.uniforms.uSpeedOuter.value = v; }
  );
  registerParam('particles.speedOuter', pSpeedOuterInput, 0.23);

  const starsInput = slider(
    sp, 'Звёзды: кол-во', 0, MAX_STARS, 1, MAX_STARS,
    (v) => stars.setStarFraction(v / MAX_STARS),
    (v) => String(v | 0)
  );
  registerParam('stars.count', starsInput, MAX_STARS);

  // --- Scene ---

  if (setSize) {
    const ss = section('Сцена');
    const sizeInput = slider(
      ss, 'Размер объекта (% ширины)', 10, 100, 1, 80,
      (v) => setSize(v / 100),
      (v) => `${v | 0}%`
    );
    registerParam('scene.size', sizeInput, 80);

    if (setCamYaw) {
      const yawInput = slider(
        ss, 'Азимут камеры', -180, 180, 1, 0,
        setCamYaw,
        (v) => `${v | 0}°`
      );
      registerParam('cam.yaw', yawInput, 0);
    }

    if (setCamPitch) {
      const pitchInput = slider(
        ss, 'Наклон камеры', -85, 85, 1, 5,
        setCamPitch,
        (v) => `${v | 0}°`
      );
      registerParam('cam.pitch', pitchInput, 5);
    }

    if (setCamRoll) {
      const rollInput = slider(
        ss, 'Наклон горизонта (лево/право)', -90, 90, 1, 0,
        setCamRoll,
        (v) => `${v | 0}°`
      );
      registerParam('cam.roll', rollInput, 0);
    }
  }

  // --- Core & disk radii ---

  if (setHorizon || setPhotonRing || setDiskRadii) {
    const sc = section('Ядро и диск');

    if (setHorizon) {
      const hInput = slider(
        sc, 'Радиус горизонта', 0.6, 2.0, 0.01, 1.1,
        setHorizon
      );
      registerParam('core.horizon', hInput, 1.1);
    }

    if (setPhotonRing) {
      const prInput = slider(
        sc, 'Фотонное кольцо (внешн.)', 1.2, 2.5, 0.01, 1.75,
        setPhotonRing
      );
      registerParam('core.photonRing', prInput, 1.75);
    }

    if (setDiskRadii) {
      let diskInner = 2.3;
      let diskOuter = 5.4;

      const diInput = slider(
        sc, 'Диск: внутр. радиус', 1.6, 3.5, 0.01, diskInner,
        (v) => {
          diskInner = v;
          setDiskRadii(diskInner, diskOuter);
        }
      );
      registerParam('disk.inner', diInput, 2.3);

      const doInput = slider(
        sc, 'Диск: внешн. радиус', 4.0, 12.0, 0.01, diskOuter,
        (v) => {
          diskOuter = v;
          setDiskRadii(diskInner, diskOuter);
        }
      );
      registerParam('disk.outer', doInput, 5.4);
    }
  }

  // --- Label ---

  if (label) {
    const sl = section('Надпись');

    const textEl = textInput(sl, 'Текст', 'ведутся работы', (v) => label.setText(v));
    registerParam('label.text', textEl, 'ведутся работы');

    const sizeInput = slider(sl, 'Размер шрифта', 10, 64, 1, 22, (v) => label.setSize(v), (v) => `${v | 0}px`);
    registerParam('label.size', sizeInput, 22);

    const offsetInput = slider(sl, 'Отступ снизу', 0, 200, 1, 24, (v) => label.setOffset(v), (v) => `${v | 0}px`);
    registerParam('label.offset', offsetInput, 24);

    const colorEl = colorInput(sl, 'Цвет', '#ffc27a', (v) => label.setColor(v));
    registerParam('label.color', colorEl, '#ffc27a');

    const glowInput = slider(sl, 'Свечение', 0, 40, 0.5, 12, (v) => label.setGlow(v), (v) => `${v.toFixed(1)}px`);
    registerParam('label.glow', glowInput, 12);

    const spacingInput = slider(sl, 'Разрядка', 0, 0.6, 0.01, 0.18, (v) => label.setSpacing(v), (v) => `${v.toFixed(2)}em`);
    registerParam('label.spacing', spacingInput, 0.18);
  }

  // --- Veil ---

  const sv = section('Вуаль (диск-меш)');

  const veilSliders = [
    ['veil.intensityUpper', 'Яркость верх', 'uIntensity', 'upper', 0, 2, 0.01, 1.0],
    ['veil.intensityLower', 'Яркость низ', 'uIntensity', 'lower', 0, 2, 0.01, 0.85],
    ['veil.speed', 'Скорость вращения', 'uSpeed', 'both', 0, 1.2, 0.01, 0.41],
    ['veil.doppler', 'Доплер', 'uDoppler', 'both', 0, 0.6, 0.01, 0.18],
    ['veil.haze', 'Дымка (haze)', 'uHaze', 'both', 0, 0.3, 0.005, 0.05],
    ['veil.rim', 'Кромка (rim)', 'uRim', 'both', 0, 3, 0.05, 1.3],
    ['veil.streak', 'Прожилки (streak)', 'uStreak', 'both', 0, 1, 0.01, 0.35],
    ['veil.wrapUpper', 'Заворот верх', 'uWrapAmount', 'upper', 0, 1.5, 0.01, 0.7],
    ['veil.wrapLower', 'Заворот низ', 'uWrapAmount', 'lower', 0, 1.5, 0.01, 0.66]
  ];

  for (const [key, labelText, uniform, target, min, max, step, def] of veilSliders) {
    const targets =
      target === 'both' ? ['upper', 'lower'] : [target];
    const input = slider(sv, labelText, min, max, step, def, (v) => {
      for (const t of targets) {
        disk.materials[t].uniforms[uniform].value = v;
      }
    });
    registerParam(key, input, def);
  }

  const wrapDirInput = slider(
    sv, 'Направление заворота (низ)', -1, 1, 0.01, -0.62,
    (v) => { disk.materials.lower.uniforms.uWrapDir.value = v; }
  );
  registerParam('veil.wrapDirLower', wrapDirInput, -0.62);

  // --- Temperature ---

  const temp = createTemperatureEngine(disk, blackHole);

  const tsec = section('Температура');

  const fmtK = (v) => (v < 1 ? 'дефолт' : `${v | 0} K`);

  const ptInput = slider(
    tsec, 'Частицы: температура', 0, 15000, 50, 0,
    (v) => temp.setParticlesTemp(v),
    fmtK
  );
  registerParam('temp.particles', ptInput, 0);

  const vtInput = slider(
    tsec, 'Вуаль: температура', 0, 15000, 50, 0,
    (v) => temp.setVeilTemp(v),
    fmtK
  );
  registerParam('temp.veil', vtInput, 0);

  const gtInput = slider(
    tsec, 'Свечение (halo+кольцо): температура', 0, 15000, 50, 0,
    (v) => temp.setGlowTemp(v),
    fmtK
  );
  registerParam('temp.glow', gtInput, 0);

  const tempSelect = document.createElement('select');
  tempSelect.style.gridArea = 'input';
  for (const p of TEMPERATURE_PROFILES) {
    const opt = document.createElement('option');
    opt.value = String(p.tempK);
    opt.textContent = p.name;
    tempSelect.appendChild(opt);
  }
  tempSelect.value = '0';
  tempSelect.addEventListener('change', () => {
    const k = parseFloat(tempSelect.value);
    for (const input of [ptInput, vtInput, gtInput]) {
      input.value = String(k);
      input.dispatchEvent(new Event('input'));
    }
  });
  control(tsec, 'Профиль температуры', tempSelect);

  // --- Actions ---

  const actions = document.createElement('div');
  actions.className = 'dbg-actions';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'dbg-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', resetAll);

  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'dbg-btn dbg-btn-violet';
  jsonBtn.textContent = 'JSON';
  jsonBtn.title = 'Показать параметры в формате JSON';
  jsonBtn.addEventListener('click', showJsonPopup);

  actions.append(resetBtn, jsonBtn);
  panel.appendChild(actions);

  if (isDebug) {
    root.append(panel, toggle);
    document.body.appendChild(root);
  }

  const fpsEl = root.querySelector('#dbg-fps');
  const msEl = root.querySelector('#dbg-ms');

  function setVisible(v) {
    panel.classList.toggle('hidden', !v);
  }

  toggle.addEventListener('click', () => {
    setVisible(panel.classList.contains('hidden'));
  });
  closeBtn.addEventListener('click', () => setVisible(false));
  if (isDebug) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote') {
        e.preventDefault();
        setVisible(panel.classList.contains('hidden'));
      } else if (e.code === 'Escape') {
        document.getElementById('debug-overlay')?.classList.add('hidden');
      }
    });
  }

  fetch(PARAMS_FILE)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data) applyParams(data);
    })
    .catch(() => {});

  let acc = 0;
  let frames = 0;

  return {
    frame(dt) {
      if (!isDebug || dt <= 0) return;
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
