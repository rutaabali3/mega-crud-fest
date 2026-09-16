## 2026-09-16 - Accessible Star Rating Component Pattern
**Learning:** Icon-only star rating components require explicit `role="radiogroup"` / `role="radio"` attributes with `aria-checked` when interactive, or `role="img"` with descriptive `aria-label` when read-only, along with visible `focus-visible` focus indicators for screen reader and keyboard accessibility.
**Action:** When building or auditing star rating UI components, ensure interactive stars act as radio buttons with `Rate X out of Y stars` labels and `aria-hidden` on nested SVGs.
