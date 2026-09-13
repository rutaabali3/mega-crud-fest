# Palette's Journal

## 2026-09-13 - Landing Page Accessibility & Live Count Announcements
**Learning:** Landing pages with instant client-side search filtering need ARIA live regions (`aria-live="polite"`) on result counters so screen reader users hear update counts while typing. Additionally, search inputs without visual `<label>` elements require explicit `aria-label` attributes, and links opening external tabs need clear accessible labels indicating target behaviors.
**Action:** Always provide `aria-label` for unlabelled search inputs, `aria-live="polite"` on dynamic filter count text, and explicit focus-visible styles for keyboard users on main landing interfaces.
