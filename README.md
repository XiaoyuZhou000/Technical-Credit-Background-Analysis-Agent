# Technical Credit Background Agent — Slidev

A 14-slide requirements presentation: 13 main slides and one appendix, with Chinese presenter notes where provided. The deck distinguishes confirmed requirements, proposed designs, and open decisions.

## Getting started

Use Node.js 20. The project pins Slidev to version 51.8.2, which has been validated with the local Node.js 20 environment.

```powershell
npm install
npm run dev
```

Open the URL printed in the terminal. Press the right arrow or Space to advance through click steps, P to enter presenter mode, and O to open the slide overview.

## Build and export

```powershell
npm run build
npm run export
```

- `dist/` contains the static website. Serve it over HTTP rather than opening `index.html` directly.
- `tc-background-agent.pdf` is the exported presentation. PDF output does not preserve interactive animations.

## Presentation flow

- Slide 2: three click steps reveal Automatic, Responsive, and Efficient.
- Slide 4: the system diagram is displayed in full, without click steps.
- Slide 6: four scheduling mechanisms, the earliest-start formula, and proposed 3s / 30s starting values for tuning.
- Slide 7: four click steps walk through the Sprint 1 storyboard.
- Slide 9: acceptance criteria and delivery order for US-06–10 under Epic 2.
- Slide 10: six click steps demonstrate Auto Save, debouncing, deduplication, cooldown, and cache reuse after restart, with two expected detector calls.

Allow approximately 10–12 minutes. Sprint 1 features and detector-call counts describe planned or expected behavior, not completed implementation or measured results. US-06–08 are included in Sprint 1; US-09 must be completed before real detector integration; the configuration interface for US-10 is deferred to a later sprint. Changes made during cooldown must be deferred rather than discarded.

## Requirements and decisions

The initial proposal draws on the discussion between Prof. Gorton and the subsequent Epic 2 scheduling proposal.

Prof. Gorton's reply confirms that both teams will work in the existing VS Code extension repository on separate branches and reuse the same detection logic and existing labeling UI. Our team owns automatic triggers, asynchronous scheduling, persistent caching, and AI call optimization. The other team owns the Manual Agent and detection modules.

Our team has decided that the Manual Agent will not share the Background Agent's cache. Whether to share the scheduling service remains open. Xiaoyu and Yezhen will confirm individual assignments soon in a private team discussion. Detailed interfaces, the 3s / 30s scheduling values, and specific build and PR procedures for the extension remain proposals.

## Project files

| File | Purpose |
| --- | --- |
| `slides.md` | Slide content and presenter notes. |
| `components/SystemDiagram.vue` | SVG architecture diagram. |
| `styles/index.css` | Colors, layout, code styling, and animation effects. |
| `slide-bottom.vue` | Current page / total pages in the bottom-right corner of every slide, including the cover, overview, and export. |
| `package.json` | Slidev dependencies and development, build, and export scripts. |
| `vite.config.ts` | Windows compatibility handling for dependency paths containing non-ASCII characters. |

The presentation source was copied from `CS6510-2026/tc-background-agent-slides`; the original directory was preserved. The local environment currently uses a copy of dependencies from the existing workspace. On another machine, run `npm install` first.
