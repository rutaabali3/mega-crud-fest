## 2025-05-18 - Audio Utility Controls and Metronome Accessibility
**Learning:** Icon-only media/utility controls (like metronome floating triggers, play/stop buttons, step adjusters, and preset buttons) lack accessible names for screen reader users and missing aria-pressed states on selected presets can make option groups ambiguous.
**Action:** Always provide explicit `aria-label` attributes to icon-only buttons, set `aria-expanded` on popup/drawer triggers, and use `aria-pressed` on selectable toggle groups.
