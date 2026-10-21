// Draws photo books from _data/books.json. Shared by /photography/ and the admin editor so both look identical.
// `src` maps a stored photo path (e.g. "/photos/x.jpg") to the URL to load.

const BOOK_LAYOUTS = {
  single: { label: 'Photo', slots: 1 },
  bleed: { label: 'Full bleed', slots: 1 },
  two: { label: 'Two', slots: 2 },
  grid: { label: 'Four', slots: 4 },
  text: { label: 'Text', slots: 0 },
};

const BOOK_MARGINS = ['none', 'small', 'medium', 'large'];

function bookEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

const BOOK_X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';

// One photo spot. `alt` describes the photo; '' marks it decorative. In the editor the whole spot is a button.
function bookSlot(path, src, editable, i, alt = '') {
  const f = bookEl('figure', 'slot');
  f.dataset.slot = i;
  const name = i === 'cover' ? 'cover photo' : 'photo ' + (i + 1);
  if (path) {
    const img = bookEl('img');
    img.src = src(path);
    img.alt = alt;
    f.append(img);
  }
  if (editable) {
    const pickBtn = bookEl('button', 'slot-pick');
    pickBtn.type = 'button';
    pickBtn.setAttribute('aria-label', (path ? 'Replace ' : 'Choose ') + name);
    if (!path) pickBtn.append(bookEl('span', 'slot-empty', '+ Add photo'));
    f.append(pickBtn);
    if (path) {
      const x = bookEl('button', 'slot-x');
      x.type = 'button';
      x.innerHTML = BOOK_X_ICON;
      x.setAttribute('aria-label', 'Remove ' + name);
      f.append(x);
    }
  }
  return f;
}

function renderBookCover(book, src = p => p, editable = false) {
  const page = bookEl('div', 'bpage bcover');
  const inner = bookEl('div', 'bin');
  inner.style.background = book.color || '#2b3a42'; // on the inner box: PageFlip overwrites the page's own style
  inner.append(bookSlot(book.cover, src, editable, 'cover', book.coverAlt || ''));
  inner.append(bookEl('p', 'ctitle', book.title || 'Untitled'));
  if (book.subtitle) inner.append(bookEl('p', 'csub', book.subtitle));
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
  const el = bookEl('div', 'bpage bpage--' + layout + (BOOK_MARGINS.includes(page.margin) && page.margin !== 'medium' ? ' bpage--m-' + page.margin : ''));
  const inner = bookEl('div', 'bin');
  const n = BOOK_LAYOUTS[layout].slots;
  if (n) {
    const slots = bookEl('div', 'slots');
    for (let i = 0; i < n; i++) slots.append(bookSlot((page.photos || [])[i], src, editable, i, (page.alts || [])[i] || page.text || ''));
    inner.append(slots);
  }
  if (page.text) inner.append(bookEl('p', 'btext', page.text));
  else if (editable && layout === 'text') inner.append(bookEl('p', 'btext slot-empty', 'Add the text in the page settings'));
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
  const stage = dialog.querySelector('.stage');
  const update = () => {
    const i = flip.getCurrentPageIndex();
    count.textContent = i === 0 ? 'Cover' : i >= all.length - 1 ? 'Back cover' : 'Page ' + Math.min(i, n) + ' of ' + n;
    const spread = flip.getOrientation() === 'landscape';
    stage.classList.toggle('on-front', spread && i === 0);
    stage.classList.toggle('on-back', spread && i >= all.length - 1);
  };
  update();
  flip.on('flip', update);
  flip.on('changeOrientation', update);
  // as soon as a page starts turning, the book opens to a full spread, so recenter it
  flip.on('changeState', e => { if (e.data !== 'read') stage.classList.remove('on-front', 'on-back'); else update(); });
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

const bookPagesLabel = n => n + (n === 1 ? ' page' : ' pages');

// A cover on the shelf, linking to `href`. The cover already shows the title, so it isn't repeated below.
function renderShelfItem(book, src, href) {
  const a = bookEl('a', 'book');
  a.href = href;
  const pages = bookPagesLabel((book.pages || []).length);
  a.setAttribute('aria-label', (book.title || 'Untitled') + ', photo book, ' + pages);
  a.append(bookBox(renderBookCover(book, src)), bookEl('span', 'meta', pages));
  return a;
}

const BOOK_VIEWER_HTML = `
  <h2></h2>
  <button class="close" type="button" aria-label="Close book"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  <div class="stage"></div>
  <div class="controls">
    <button class="prev" type="button" aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <span class="count" aria-live="polite"></span>
    <button class="next" type="button" aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
  </div>`;
