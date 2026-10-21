// Draws photo books from _data/books.json. Shared by /photography/ and the admin editor so both look identical.
// `src` maps a stored photo path (e.g. "/photos/x.jpg") to the URL to load.

const BOOK_LAYOUTS = {
  single: { label: 'Photo', slots: 1 },
  bleed: { label: 'Full bleed', slots: 1 },
  two: { label: 'Two', slots: 2 },
  grid: { label: 'Four', slots: 4 },
  text: { label: 'Text', slots: 0 },
};

function bookEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function bookSlot(path, src, editable, i) {
  const f = bookEl('figure', 'slot');
  f.dataset.slot = i;
  if (path) {
    const img = bookEl('img');
    img.src = src(path);
    img.alt = '';
    f.append(img);
    if (editable) {
      const x = bookEl('button', 'slot-x', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Remove photo');
      f.append(x);
    }
  } else if (editable) {
    f.append(bookEl('span', 'slot-empty', '+ Add photo'));
  }
  return f;
}

function renderBookCover(book, src = p => p, editable = false) {
  const page = bookEl('div', 'bpage bcover');
  const inner = bookEl('div', 'bin');
  inner.style.background = book.color || '#2b3a42'; // on the inner box: PageFlip overwrites the page's own style
  inner.append(bookSlot(book.cover, src, editable, 'cover'));
  inner.append(bookEl('h3', '', book.title || 'Untitled'));
  if (book.subtitle) inner.append(bookEl('p', '', book.subtitle));
  page.append(inner);
  return page;
}

function renderBookBack(book) {
  const page = bookEl('div', 'bpage bcover bback');
  const inner = bookEl('div', 'bin');
  inner.style.background = book.color || '#2b3a42';
  inner.append(bookEl('p', '', 'M. Emre Gündüz'));
  page.append(inner);
  return page;
}

function renderBookPage(page, src = p => p, editable = false) {
  const layout = BOOK_LAYOUTS[page.layout] ? page.layout : 'single';
  const el = bookEl('div', 'bpage bpage--' + layout);
  const inner = bookEl('div', 'bin');
  const n = BOOK_LAYOUTS[layout].slots;
  if (n) {
    const slots = bookEl('div', 'slots');
    for (let i = 0; i < n; i++) slots.append(bookSlot((page.photos || [])[i], src, editable, i));
    inner.append(slots);
  }
  if (page.text) inner.append(bookEl('p', 'btext', page.text));
  else if (editable && layout === 'text') inner.append(bookEl('p', 'btext slot-empty', 'Type your text in the panel →'));
  el.append(inner);
  return el;
}

// Wraps a rendered page in a 3:4 box so it can be shown at any size.
function bookBox(pageEl) {
  const box = bookEl('div', 'pagebox');
  box.append(pageEl);
  return box;
}

// Opens `book` in the full-screen flip viewer inside `dialog` (markup: h2, .stage, .prev, .next, .count, .close).
function openBook(dialog, book, src = p => p) {
  const pages = (book.pages || []).map(p => renderBookPage(p, src));
  const n = pages.length;
  if (pages.length % 2) pages.push(bookEl('div', 'bpage')); // keeps the back cover on its own side
  const all = [renderBookCover(book, src), ...pages, renderBookBack(book)];
  all[0].dataset.density = all[all.length - 1].dataset.density = 'hard';

  const holder = bookEl('div');
  dialog.querySelector('.stage').replaceChildren(holder);
  holder.append(...all);
  dialog.querySelector('h2').textContent = book.title || 'Untitled';
  dialog.showModal();

  const flip = new St.PageFlip(holder, {
    width: 450, height: 600, size: 'stretch',
    minWidth: 250, maxWidth: 900, minHeight: 333, maxHeight: 1200, // under 2×minWidth it shows one page at a time
    showCover: true, maxShadowOpacity: 0.5, mobileScrollSupport: false,
  });
  flip.loadFromHTML(all);

  const count = dialog.querySelector('.count');
  const update = () => {
    const i = flip.getCurrentPageIndex();
    count.textContent = i === 0 ? 'Cover' : i >= all.length - 1 ? 'Back cover' : 'Page ' + Math.min(i, n) + ' of ' + n;
  };
  update();
  flip.on('flip', update);
  const prev = () => flip.flipPrev(), next = () => flip.flipNext();
  const key = e => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
  dialog.querySelector('.prev').onclick = prev;
  dialog.querySelector('.next').onclick = next;
  dialog.querySelector('.close').onclick = () => dialog.close();
  dialog.addEventListener('keydown', key);
  dialog.addEventListener('close', () => {
    dialog.removeEventListener('keydown', key);
    flip.destroy();
  }, { once: true });
}

const BOOK_VIEWER_HTML = `
  <h2></h2>
  <button class="close" type="button" aria-label="Close book">✕</button>
  <div class="stage"></div>
  <div class="controls">
    <button class="prev" type="button" aria-label="Previous page">‹</button>
    <span class="count" aria-live="polite"></span>
    <button class="next" type="button" aria-label="Next page">›</button>
  </div>`;
