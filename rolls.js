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
