// Draws the resume from _data/resume.json. Shared by the home page and the admin editor's live preview.
// Text fields understand **bold** and [label](https://link).

function resumeEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

function resumeInline(text) {
  const frag = document.createDocumentFragment();
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m;
  while ((m = re.exec(text || ''))) {
    frag.append(text.slice(last, m.index));
    if (m[1] !== undefined) frag.append(resumeEl('strong', '', m[1]));
    else if (SAFE_URL.test(m[3])) { const a = resumeEl('a', '', m[2]); a.href = m[3]; frag.append(a); }
    else frag.append(m[2]);
    last = re.lastIndex;
  }
  frag.append((text || '').slice(last));
  return frag;
}

// Company/title on the left, date or place on the right (always secondary metadata).
function resumeRow(left, right, cls, tag, leftCls = '') {
  const row = resumeEl('div', cls);
  const l = resumeEl(tag, leftCls);
  l.append(resumeInline(left));
  row.append(l);
  if (right) row.append(resumeEl('span', 'meta', right));
  return row;
}

// On paper a link is only as good as the address you can read, so print shows "github.com/…" instead of "GitHub".
function resumePrintAddress(url, label) {
  if (/^(mailto|tel):/i.test(url)) return label;
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

// Web links print as "GitHub github.com/…": the label says what it is, the address stays readable on paper.
function resumeLink(c, printLabel = c.label) {
  const a = resumeEl('a');
  a.href = c.url;
  const print = resumePrintAddress(c.url, c.label);
  if (print === c.label && printLabel === c.label) { a.textContent = c.label; return a; } // email, phone
  if (print === c.label) a.textContent = print;
  else a.append(resumeEl('span', 'screen-only', c.label), resumeEl('span', 'print-only', print));
  const wrap = resumeEl('span', 'labeled');
  wrap.append(resumeEl('span', 'print-only plabel', printLabel), a);
  return wrap;
}

// Fills `root` with the resume. `downloadButton: false` hides the PDF button (used in the editor preview).
// `siteUrl` is the public address printed in the PDF; `pdfUrl` is the pre-built PDF the button downloads.
function renderResume(root, cv, { downloadButton = true, siteUrl = location.origin, pdfUrl = '' } = {}) {
  const header = resumeEl('header');
  header.append(resumeEl('h1', '', cv.name), resumeEl('p', 'role', cv.role));
  if (cv.intro) { const intro = resumeEl('p', 'intro'); intro.append(resumeInline(cv.intro)); header.append(intro); }
  const links = resumeEl('div', 'links');
  (cv.contact || []).filter(c => c.label).forEach(c => {
    const el = c.url && SAFE_URL.test(c.url) ? resumeLink(c) : resumeEl('span', '', c.label);
    if (c.printOnly) el.classList.add('print-only'); // e.g. a phone number for the PDF
    links.append(el);
  });
  // The printed copy points back to this site.
  if (downloadButton && /^https?:/.test(siteUrl)) {
    links.append(resumeLink({ url: siteUrl, label: siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }, (window.T && T.website_label) || 'Personal Website'));
    links.lastChild.classList.add('print-only');
  }
  if (downloadButton) {
    // A real file works on every phone; print() does nothing in many mobile and in-app browsers.
    const dl = resumeEl(pdfUrl ? 'a' : 'button', 'dl', (window.T && T.download_pdf) || 'Download PDF');
    if (pdfUrl) { dl.href = pdfUrl; dl.download = (window.T && T.pdf_file) || 'M-Emre-Guenduez-Resume.pdf'; }
    else { dl.type = 'button'; dl.onclick = () => print(); }
    links.append(dl);
  }
  header.append(links);
  const parts = [header];

  (cv.sections || []).forEach(s => {
    const items = s.items || [];
    if (!items.length) return;
    const sec = resumeEl('section');
    const body = resumeEl('div', 'sec-body'); // a column of its own beside the title on wide screens
    sec.append(resumeEl('h2', '', s.title), body);
    if (s.type === 'tags') {
      const ul = resumeEl('ul', 'tags');
      items.filter(Boolean).forEach(t => ul.append(resumeEl('li', '', t)));
      body.append(ul);
    } else if (s.type === 'pairs') {
      const grid = resumeEl('div', 'langs');
      items.forEach(p => {
        const d = resumeEl('div');
        d.append(resumeEl('strong', '', p.title), resumeEl('span', 'meta', p.right));
        grid.append(d);
      });
      body.append(grid);
    } else {
      items.forEach(it => {
        const item = resumeEl('div', 'item');
        item.append(resumeRow(it.title, it.right, 'row', 'h3'));
        if (it.subtitle || it.subright) item.append(resumeRow(it.subtitle, it.subright, 'row sub', 'span', 'subtitle'));
        if (it.text) { const p = resumeEl('p'); p.append(resumeInline(it.text)); item.append(p); }
        const bullets = (it.bullets || []).filter(b => b.trim());
        if (bullets.length) {
          const ul = resumeEl('ul');
          bullets.forEach(b => { const li = resumeEl('li'); li.append(resumeInline(b)); ul.append(li); });
          item.append(ul);
        }
        body.append(item);
      });
    }
    parts.push(sec);
  });
  root.replaceChildren(...parts);
}
