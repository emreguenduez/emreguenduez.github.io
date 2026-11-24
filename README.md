# emreguenduez.github.io

Personal site: resume (`index.html`), projects and photography. Built by GitHub Pages (Jekyll), no setup needed.

## Admin

Go to `/admin/` and sign in with a fine-grained GitHub token (only this repo, Contents: Read and write).

- **Rolls** (shown on `/photography/` as contact sheets of negatives, the newest also on the home page): create a roll, give it a title and subtitle, then add frames from the photo library or drop image files on it. Drag a frame by its photo (or use the arrows) to reorder, and describe each photo for screen readers. "Save & publish" commits `_data/rolls.json`.
- **Photo library**: upload or delete photos in `photos/`. Uploads are resized and stripped of location data in the browser.
- **Resume** (the home page): edit `_data/resume.json` with a form and live preview. Use `**bold**` and `[text](https://link)` in text.
- **Projects**: edit `_data/projects.yml`.

## Add a project by hand

Edit `_data/projects.yml` and copy an existing block. Only `name` is required; `year`, `description`, `tags`, `url`, `repo` and `image` are optional.
