## 2026-03-24 - Landing Page Search & Navigation Accessibility
**Learning:** Raw repository slugs (e.g. `cellar-keeper`) in link text are less intuitive for screen readers and human readers than descriptive project titles (e.g. `My Cellar`). Furthermore, dynamic filter/search inputs need `aria-live="polite"` result counters and `:focus-visible` focus indicators for keyboard navigation.
**Action:** Always map link text to human-readable titles, inform users when links open in a new tab via `aria-label`, and announce dynamic result counts to screen readers.
