# Project Standards
- Stack: Vite 6, React 19, TypeScript (strict: true), Tailwind CSS v4, Lucide React, Vitest.
- Scope: Story branches and endings only. Do NOT render save-slot checklists or save-slot trackers in the active UI.
- Zero external graph/diagram libraries (no React Flow, Mermaid, or D3). Build the top-down collapsible decision tree with CSS Grid/Flexbox and inline SVG cubic-bezier connectors.
- Zero copyrighted Rockstar Games / Take-Two Interactive assets, logos, or map tiles.
- Spoiler safety: Wrap any plot outcome or mission consequence in `<SpoilerText>` (blurred by default, click-to-confirm reveal, resets on reload). Never persist spoiler reveal state in localStorage.
- Motion & UI: Dark-mode first with layered slate surfaces, subtle borders, `tabular-nums` for numbers/currency, smooth CSS transitions (150ms-250ms) respecting `prefers-reduced-motion`, and `min-h-11` mobile touch targets.
- Verification: Every task must pass `npx vitest run`, `npx tsc --noEmit`, and `npm run build`.
