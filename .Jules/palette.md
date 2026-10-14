## 2026-03-31 - Landing Page Dynamic Search Live Region & Clear Link Anchors
**Learning:** For landing pages with client-side filtered search grids and external project links:
1. Dynamic result counts need `role="status"` and `aria-live="polite"` so screen readers immediately report filtering updates as users type into search fields.
2. Link anchor text for external or project cards should display human-readable titles rather than raw repository/slug identifiers (e.g. "Open My Cellar ↗" instead of "Open cellar-keeper ↗") paired with explicit `aria-label`s announcing new tab navigation.
3. Form controls and card action buttons require explicit `:focus-visible` ring outlines to maintain keyboard accessibility when custom styling strips default outlines.
**Action:** When working on list/grid search interfaces or hub landing pages, ensure live regions for count updates, clear human-readable link anchors, and focus-visible indicators are included by default.

## 2026-03-31 - Interactive Card Component ARIA & Keyboard Pattern
**Learning:** Interactive card wrappers (e.g. `MovieCard`) rendered as non-semantic `div` elements prevent keyboard navigation and screen reader discovery:
1. Card components acting as triggers must be assigned `role="button"`, `tabIndex={0}`, and a descriptive `aria-label={`View details for ${title}`}`.
2. An `onKeyDown` event listener must be provided to handle `Enter` and `Space` key presses to replicate native button activation.
3. Apply `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to make focus states clearly visible for keyboard users while preserving hover animations.
**Action:** When building interactive card items in list or grid layouts, always pair `onClick` with button roles, keydown triggers, tabIndex, aria-labels, and focus-visible ring styles.

## 2026-03-31 - Interactive & Readonly Star Rating ARIA Pattern
**Learning:** Multi-button star rating controls are often invisible to screen readers without descriptive labels and state markers:
1. Interactive rating buttons require explicit `aria-label={`Rate ${value} out of ${total} stars`}` and `aria-pressed={value === rating}` so screen readers report the star level and whether it is selected.
2. Readonly star rating components should wrap buttons in a container with `role="img"` and `aria-label={`${rating} of ${total} stars`}` while disabling child buttons so assistive tools treat the rating block as a single composite visual representation.
3. Rating buttons must include `focus-visible` ring classes so keyboard users can clearly track focus across star increments.
**Action:** Whenever building or auditing rating star inputs/displays, apply explicit aria-labels, aria-pressed attributes, composite img role for readonly views, and focus-visible rings.
