## 2024-05-22 - Missing ARIA labels on navigation icons
**Learning:** Critical navigation components (Header, Navigation) relied solely on visual icons for meaning, making them completely inaccessible to screen reader users. The pattern of "icon-only button" was consistently implemented without accessibility attributes.
**Action:** Always verify icon-only buttons have `aria-label` or `sr-only` text during component creation.
