export function createWorkLabel() {
  document.getElementById('work-label')?.remove();

  const style = document.createElement('style');
  style.textContent = `
#work-label {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 2147482000;
  margin: 0;
  padding: 0 0 0.18em;
  font-family: Verdana, Geneva, 'DejaVu Sans', sans-serif;
  font-size: 22px;
  letter-spacing: 0.18em;
  color: #ffc27a;
  text-shadow: 0 0 12px currentColor, 0 0 26px currentColor;
  pointer-events: none;
  white-space: nowrap;
  user-select: none;
}
`;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'work-label';
  el.textContent = 'ведутся работы';
  document.body.appendChild(el);

  return {
    setText(t) {
      el.textContent = t;
    },
    setSize(px) {
      el.style.fontSize = `${px}px`;
    },
    setOffset(px) {
      el.style.bottom = `${px}px`;
    },
    setColor(c) {
      el.style.color = c;
    },
    setGlow(px) {
      el.style.textShadow =
        px < 0.5
          ? 'none'
          : `0 0 ${px}px currentColor, 0 0 ${Math.round(px * 2.2)}px currentColor`;
    },
    setSpacing(em) {
      el.style.letterSpacing = `${em}em`;
    }
  };
}
