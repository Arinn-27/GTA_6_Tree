# Project Standards
- Stack: Vite 6, React 19, TypeScript (strict: true), Tailwind CSS v4, Lucide React, Vitest.
- Zero external graph/diagram libraries (no React Flow, Mermaid, or D3). Use CSS Grid + inline SVG for BranchTreeTab.
- Zero copyrighted Rockstar Games / Take-Two Interactive assets, logos, or map tiles.
- Spoiler safety: Wrap any plot outcome or mission consequence in `<SpoilerText>` (blurred by default, click-to-confirm reveal, resets on reload). Never persist spoiler reveal state in localStorage.
- Verification: Every implementation task must pass `npx vitest run`, `npx tsc --noEmit`, and `npm run build`.
