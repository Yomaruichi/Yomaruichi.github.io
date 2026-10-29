# Blue Steel portfolio

A static portfolio built from the Blue Steel Figma design, with a canvas tactical ocean, simulated sonar contacts, and three animated information halos. Home, Projects, Blog, project details, and article pages are generated as real HTML pages. Search and category filters work in the browser.

## Run locally

Requires Node.js 22 or later. No package installation is needed.

```powershell
npm.cmd run build
npm.cmd start
```

Open http://127.0.0.1:4174/. After editing content or styles, rebuild and refresh.

## Write a blog post

Create a `.md` file in `content/posts/`. Copy an existing post or use:

```markdown
---
title: My first transmission
slug: my-first-transmission
category: Engineering
status: published
date: 2026-10-29
summary: A short introduction to this post.
---
## The idea

Write your article here.

- A point worth remembering
- Another observation
```

The built-in Markdown subset supports headings, paragraphs, bullet lists, bold, inline code, and fenced code blocks. Raw HTML is escaped. The sample posts are draft outlines, not finished articles. `showDrafts` in `content/site.json` is currently `true` for reviewing the design; set it to `false` before your public launch. Draft files are then omitted from the generated website, including their direct URLs. A draft label alone does not make writing private.

## Update projects

Edit `content/projects.json`. Each project has a unique slug, title, summary, category, stack, description, and focus list. Optional `image` names refer to files in `src/assets/`. These are concise project overviews; expand them with your own case studies before a public launch. No repository or contact links have been invented.

## Content storage recommendation

Use Markdown for posts and JSON for project metadata now. Content stays separate from presentation, with Git history and no database service to maintain. A database becomes useful when you need browser-based authoring with accounts, comments, multiple authors, or frequently changing visitor data. A Git-backed CMS can also add a writing interface later while retaining static hosting.

## GitHub Pages

The included `.github/workflows/pages.yml` builds and deploys `dist/` after a push to `main`. In the GitHub repository, set Settings > Pages > Source to **GitHub Actions**. The existing `CNAME` is preserved and copied to the output. Assets and page links are relative, so both a custom domain and a repository subpath work. A `.nojekyll` file is generated. `dist/` contains all required fonts, images, HTML, CSS, and JavaScript; no database or runtime Node server is needed.

## Motion and accessibility

The motion toggle persists across visits. Reduced-motion preference pauses the animation. Animation also stops when the hero is outside the viewport or the tab is hidden. Navigation, filters, and search use keyboard-accessible controls; content remains available without JavaScript. Contacts and coordinates are decorative simulations.

## Artwork and fonts

Iona and I-401 artwork was supplied as design reference and exported from the Figma design. Arpeggio of Blue Steel artwork belongs to its respective owners. Fonts: Bebas Neue, Space Grotesk, and IBM Plex Mono, distributed under the SIL Open Font License. License files are included in `src/assets/`.

