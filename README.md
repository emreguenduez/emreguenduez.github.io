# emreguenduez.github.io

Personal site: resume (`index.html`), projects and photography. Built by GitHub Pages (Jekyll), no setup needed.

## Admin

Go to `/admin/` and sign in with a fine-grained GitHub token (only this repo, Contents: Read and write). From there you can upload or delete photos and edit projects. Uploads are resized and stripped of location data in the browser.

## Add a photo by hand

Drop the image into `photos/` (on GitHub: open the folder → **Add file → Upload files**).

- Name it `YYYY-MM-DD-short-title.jpg`: photos are shown newest first, and the caption becomes "Short title".
- Resize before uploading so the page loads fast, e.g. on a Mac: `sips -Z 2000 photo.jpg`

## Add a project by hand

Edit `_data/projects.yml` and copy an existing block. Only `name` is required; `year`, `description`, `tags`, `url`, `repo` and `image` are optional.
