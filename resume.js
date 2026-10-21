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

function resumeRow(left, right, cls, tag) {
  const row = resumeEl('div', cls);
  const l = resumeEl(tag);
  l.append(resumeInline(left));
  row.append(l);
  if (right) row.append(resumeEl('span', tag === 'h3' ? 'meta' : '', right));
  return row;
}

// Fills `root` with the resume. `downloadButton: false` hides the PDF button (used in the editor preview).
function renderResume(root, cv, { downloadButton = true } = {}) {
  const header = resumeEl('header');
  header.append(resumeEl('h1', '', cv.name), resumeEl('p', 'role', cv.role));
  const links = resumeEl('div', 'links');
  (cv.contact || []).filter(c => c.label).forEach(c => {
    if (c.url && SAFE_URL.test(c.url)) { const a = resumeEl('a', '', c.label); a.href = c.url; links.append(a); }
    else links.append(resumeEl('span', '', c.label));
  });
  if (downloadButton) {
    const dl = resumeEl('button', 'dl', 'Download PDF');
    dl.type = 'button';
    dl.onclick = () => print();
    links.append(dl);
  }
  header.append(links);
  const parts = [header];

  (cv.sections || []).forEach(s => {
    const items = s.items || [];
    if (!items.length) return;
    const sec = resumeEl('section');
    sec.append(resumeEl('h2', '', s.title));
    if (s.type === 'tags') {
      const ul = resumeEl('ul', 'tags');
      items.filter(Boolean).forEach(t => ul.append(resumeEl('li', '', t)));
      sec.append(ul);
    } else if (s.type === 'pairs') {
      const grid = resumeEl('div', 'langs');
      items.forEach(p => {
        const d = resumeEl('div');
        d.append(resumeEl('strong', '', p.title), resumeEl('span', 'meta', p.right));
        grid.append(d);
      });
      sec.append(grid);
    } else {
      items.forEach(it => {
        const item = resumeEl('div', 'item');
        item.append(resumeRow(it.title, it.right, 'row', 'h3'));
        if (it.subtitle || it.subright) item.append(resumeRow(it.subtitle, it.subright, 'row meta', 'span'));
        if (it.text) { const p = resumeEl('p'); p.append(resumeInline(it.text)); item.append(p); }
        const bullets = (it.bullets || []).filter(b => b.trim());
        if (bullets.length) {
          const ul = resumeEl('ul');
          bullets.forEach(b => { const li = resumeEl('li'); li.append(resumeInline(b)); ul.append(li); });
          item.append(ul);
        }
        sec.append(item);
      });
    }
    parts.push(sec);
  });
  root.replaceChildren(...parts);
}
