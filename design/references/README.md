# Design references

Everything in this folder is a **visual design reference**: screenshots, mockups,
exported comps, and similar artifacts collected to communicate how MeeTheDoc
should look and feel.

## How to use these files

Treat them **primarily as visual guidance** for:

- layout and page composition
- visual hierarchy and emphasis
- spacing, density, and rhythm
- typography (scale, weight, pairing)
- component appearance (buttons, cards, lists, forms)
- the overall visual language (color, elevation, tone)

## What NOT to do

- **Do not blindly copy text, names, numbers, dates, or any other data** out of a
  reference. Sample content in a screenshot is *illustrative filler*, not product
  data. A doctor name, a call time, or a price in a mockup is a stand-in — never
  a requirement and never a value to hard-code.
- Do not treat a reference as a spec for behavior. It shows appearance, not
  logic, validation, or data flow.
- Do not import, link to, or otherwise reference these files from application
  code.

## These files are never served

`design/` is **not** inside `public/`. Nothing here is bundled or served by the
application, and no URL maps to it. It exists for humans and agents working on
the project, not for end users.

## Contrast with `public/assets/`

| | `design/references/` | `public/assets/` |
| --- | --- | --- |
| Purpose | Visual guidance while building | Real production assets |
| Served to users | Never | Yes, at `/assets/...` |
| Safe to render in the app | No | Yes |
| Content inside is authoritative | No (illustrative only) | Yes |

If an asset from a reference needs to actually ship (a logo, an icon), it must be
exported deliberately and placed under `public/assets/` — not linked from here.
