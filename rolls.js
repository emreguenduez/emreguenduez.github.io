// Rolls of film from _data/rolls.json ({ id, title, subtitle, frames: [{ src, alt }] }), shown as strips of negatives.
// Used by the home page, the photography page and the admin's roll editor.

function rollEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// One strip of film between two rows of sprocket holes. `frameEl(f, i)` makes the clickable frame.
function rollStrip(frames, start, frameEl) {
  const film = rollEl('div', 'film'), row = rollEl('div', 'frames');
  frames.forEach((f, i) => {
    const el = frameEl(f, start + i), neg = rollEl('span', 'neg'), img = rollEl('img');
    img.src = f.src; img.alt = f.alt; img.loading = 'lazy';
    neg.append(img);
    // Edge print as on 35 mm film: the frame number, then an arrow and the half-frame number.
    const n = String(start + i + 1).padStart(2, '0'), num = rollEl('span', 'num');
    num.append(rollEl('span', '', n), rollEl('span', '', '▸ ' + n + 'A'));
    num.setAttribute('aria-hidden', 'true');
    el.classList.add('frame');
    el.append(neg, num);
    row.append(el);
  });
  film.append(row);
  return film;
}

// The lightbox: one photo at a time, large, with previous/next, arrow keys and swipe.
// Shared by the home page and the photography page; returns open(frames, index).
function rollLightbox() {
  const T_ = window.T || {};
  const lb = rollEl('dialog', 'lightbox');
  lb.setAttribute('aria-label', T_.enlarge || 'Enlarge photo');
  const fig = rollEl('figure'), img = rollEl('img'), cap = rollEl('figcaption');
  const count = rollEl('span', 'count meta'), alt = rollEl('span', 'alt');
  img.alt = '';
  cap.setAttribute('aria-live', 'polite');
  cap.append(count, ' ', alt);
  fig.append(img, cap);
  const controls = rollEl('div', 'lb-controls');
  const prev = rollEl('button', 'prev', '← ' + (T_.prev_frame || 'previous'));
  const close = rollEl('button', 'close', T_.close || 'Close');
  const next = rollEl('button', 'next', (T_.next_frame || 'next') + ' →');
  [prev, close, next].forEach(b => { b.type = 'button'; });
  close.autofocus = true;
  controls.append(prev, close, next);
  lb.append(fig, controls);
  document.body.append(lb);
  // Browsers without <dialog> (Firefox before 98) open the photo itself instead.
  if (typeof lb.showModal !== 'function') return (frames, i) => { location.href = frames[i].src; };

  let shown = [], at = 0;
  const show = i => {
    at = (i + shown.length) % shown.length;
    img.src = shown[at].src; img.alt = shown[at].alt;
    count.textContent = String(at + 1).padStart(2, '0') + ' / ' + String(shown.length).padStart(2, '0');
    alt.textContent = shown[at].alt;
  };
  prev.onclick = () => show(at - 1);
  next.onclick = () => show(at + 1);
  close.onclick = () => lb.close();
  // Only the dark surround closes it, so a stray tap on the photo doesn't.
  lb.addEventListener('click', e => { if (!e.target.closest('img, figcaption, button')) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  // Swipe left or right on the photo for the next or previous frame.
  let x0 = null;
  img.addEventListener('pointerdown', e => { x0 = e.clientX; });
  img.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  });
  img.addEventListener('pointercancel', () => { x0 = null; });

  return (frames, i) => { shown = frames; show(i); if (!lb.open) lb.showModal(); };
}
