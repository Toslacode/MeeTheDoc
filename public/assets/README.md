# Production assets

Everything in this folder is a **real production asset**. `public/` is served
statically by Next.js, so a file at `public/assets/branding/logo.svg` is publicly
reachable at `/assets/branding/logo.svg`. These files are safe to reference and
render from application code.

## Subfolders

- **`branding/`** — logos, wordmarks, favicons, and other brand marks.
- **`icons/`** — standalone icon files that are not covered by the icon library.
- **`mock/`** — placeholder media (avatars, sample imagery) used by the UI while
  real data does not exist yet. Still publicly served, so keep it non-sensitive.
- **`design-references/`** — reference imagery that the app itself is meant to
  display. Only put a file here if it is genuinely rendered by the product.

## Contrast with `design/references/`

`design/references/` holds **visual guidance for building** the product. It is
outside `public/`, is never served, and the sample content inside it is
illustrative — not product data. See `design/references/README.md`.

## Rules

- Do not put secrets, credentials, or private user data here — everything in
  `public/` is world-readable.
- Keep filenames lowercase and hyphenated.
