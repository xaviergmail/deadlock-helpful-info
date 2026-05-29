# deadlock-helpful-info

Sets of "cheatsheets" for Deadlock - for quick viewing in your Steam overlay browser when fullscreen tabbing out is too laggy, or whatever.

## Site setup

This repository now uses **Jekyll** as a static site generator and deploys automatically to **GitHub Pages** using GitHub Actions.

- Workflow: `.github/workflows/pages.yml`
- Site entry page: `index.md`
- Image folder: `assets/images/`

## Editing quickly

1. Edit `index.md` (or add more `.md` files) directly in GitHub.
2. Add images to `assets/images/`.
3. Link images from markdown, for example:

```md
![Callout](assets/images/callout.png)
```

Every push to `main` triggers deployment to GitHub Pages.
