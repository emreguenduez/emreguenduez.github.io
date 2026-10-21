# emreguenduez.github.io

Personal site: resume (`index.html`), projects and photography. Built by GitHub Pages (Jekyll), no setup needed.

## Admin

Go to `/admin/` and sign in with a fine-grained GitHub token (only this repo, Contents: Read and write).

- **Photo books** (shown on `/photography/`): create a book, pick a cover photo, title and color, then add pages. Each page has a layout (one photo, full bleed, two, four, or text) and an optional caption. Drag pages in the strip to reorder them. "Save & publish" commits `_data/books.json`.
- **Photo library**: upload or delete photos in `photos/`. Uploads are resized and stripped of location data in the browser.
- **Resume** (the home page): edit `_data/resume.json` with a form and live preview. Use `**bold**` and `[text](https://link)` in text.
- **Projects**: edit `_data/projects.yml`.

## Add a project by hand

Edit `_data/projects.yml` and copy an existing block. Only `name` is required; `year`, `description`, `tags`, `url`, `repo` and `image` are optional.
