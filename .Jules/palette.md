## 2025-05-18 - Metronome Icon-Only Buttons Accessibility
**Learning:** Icon-only control buttons in floating tool widgets (such as metronomes, play/pause controls, increment/decrement BPM buttons) lack accessible names by default unless `aria-label` or `aria-labelledby` attributes are explicitly provided.
**Action:** Always add descriptive, dynamic `aria-label` attributes to icon-only buttons (e.g. `aria-label="Open metronome"`, `aria-label={playing ? "Stop metronome" : "Start metronome"}`) to ensure screen readers can announce control actions clearly.
