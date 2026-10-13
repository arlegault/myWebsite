# alexlegault.com

Personal site for Alex Legault. Pages are static HTML generated with [Eleventy](https://www.11ty.dev/) and published to S3.

## Build

```bash
npm install
npm run build
```

`npm run build` writes the finished site to `_site/`.

Preview locally with `npm run dev`. `npm test` rebuilds the site and checks markup, metadata, and that unpublished essays stay out of the nav and sitemap.

## Upload to S3

Upload the **contents of `_site/`**. That folder is the publishable site: `index.html` is at its top level, next to the other pages, `mystyle.css`, `favicon.svg`, `sitemap.xml`, `robots.txt`, and the images.

Do not upload the repository root or `src/`. Those are the Eleventy templates, not the pages browsers should receive. Point the existing S3 sync at `_site/` instead of the repository root. Hosting is otherwise unchanged; this repo does not deploy itself.

## Unpublished pages

Essay drafts stay out of the navigation, the writing index, and `sitemap.xml`. The writing page keeps those links commented out. `consulting.html` stays unlinked the same way.
