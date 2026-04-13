# Design System Strategy: Architectural Precision
 
## 1. Overview & Creative North Star: "The Editorial Monolith"
This design system is built upon the concept of **The Editorial Monolith**. It rejects the "app-like" bubble aesthetic of modern software in favor of high-end print journalism and architectural drafting. By removing all rounded corners and visible borders, we shift the burden of organization from "containers" to "composition."
 
The goal is to provide restaurant owners and procurement officers with an ERP that feels like a premium ledger. We achieve a bespoke, high-end feel through:
*   **Intentional Asymmetry:** Using the grid to create unexpected focal points.
*   **The Power of the Void:** Using whitespace as a structural element, not just a gap.
*   **Tonal Definition:** Replacing lines with subtle shifts in background values to define space.
 
---
 
## 2. Colors & Surface Philosophy
The palette is rooted in a "paper and ink" philosophy. We use deep charcoals and off-whites to ground the experience, with a muted gold (`secondary`) providing the prestige.
 
### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, use `surface_container_low` against `surface`. If a quotation table needs a header, use `surface_variant` as a background flood instead of a bottom-border.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use "Tonal Stacking" to create depth:
*   **Base Layer:** `surface` (#faf9f7) – The primary canvas.
*   **Secondary Sections:** `surface_container_low` (#f3f4f1) – For distinct functional areas.
*   **Interactive Elements/Cards:** `surface_container_lowest` (#ffffff) – To create a "lifted" paper effect.
 
### Signature Textures
For main CTAs or high-level quotation summaries, use a subtle linear gradient transitioning from `primary` (#5d5e61) to `primary_dim` (#515255). This provides a metallic, tactile quality that flat charcoal lacks.
 
---
 
## 3. Typography: The Serif Authority
The contrast between the intellectual `notoSerif` and the functional `inter` creates a hierarchy of "Statement vs. Data."
 
*   **Display & Headlines (`notoSerif`):** Used for quotation totals, restaurant names, and page titles. These should feel like mastheads. Use `on_surface` (#2f3331) to maintain high contrast.
*   **UI & Body (`inter`):** Used for line items, quantities, and ERP inputs. This is the "workhorse" layer. 
*   **Labeling:** All `label-md` and `label-sm` elements should be set in `inter` with slightly increased letter-spacing (0.05rem) to ensure legibility against the stark, square-edged UI.
 
---
 
## 4. Elevation & Depth: Tonal Layering
Since we have **ZERO** rounded corners (`0px` radius) and no borders, elevation is communicated through light and tone.
 
*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. The absence of a border makes the edge feel razor-sharp and intentional.
*   **Ambient Shadows:** Use only for floating elements (like a "New Quotation" modal). Use the `on_surface` color at 4% opacity with a 32px blur and 16px offset. It should feel like a soft glow, not a drop shadow.
*   **The "Ghost Border" Fallback:** If a layout absolutely requires a separator (e.g., in a dense financial table), use the `outline_variant` (#afb3b0) at **10% opacity**. It should be felt, not seen.
*   **Glassmorphism:** For top navigation bars, use `surface` at 80% opacity with a `backdrop-filter: blur(20px)`. This allows the content to scroll underneath "through the paper."
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** Square edges, `primary` background, `on_primary` text. No shadow.
*   **Secondary:** Square edges, `secondary_container` background, `on_secondary_container` text.
*   **Interaction:** On hover, shift background to `primary_dim`. The transition should be an immediate `200ms` ease-out.
 
### Input Fields
*   **Structure:** No 4-sided box. Use a subtle background flood of `surface_container_high`.
*   **Focus State:** Instead of a border, use a 2px bottom-bar of `secondary` (Muted Gold) to indicate the active field.
*   **Error:** Use `error` (#9f403d) text and a `surface_container_highest` background flood.
 
### Cards & Lists
*   **No Dividers:** Separate list items using `16px` or `24px` of vertical whitespace. 
*   **Selection:** When a quotation line item is selected, change the entire row background to `secondary_fixed_dim`.
 
### Data Tables (The ERP Heart)
*   **Header:** `notoSerif` title-sm, `surface_variant` background, zero borders.
*   **Alignment:** Use the "Architectural Grid." Numbers are right-aligned to the decimal point; text is left-aligned with a strict `24px` gutter.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   **Do** use extreme whitespace. If you think there is enough space, add 16px more.
*   **Do** align elements to a strict 12-column grid. The lack of borders means alignment *is* your structure.
*   **Do** use `secondary` (Gold) sparingly for "Money" or "Success" moments to keep it feeling premium.
 
### Don't
*   **Don't** use a single pixel of border-radius. Even a 1px radius breaks the architectural intent.
*   **Don't** use icons as primary navigation. Use `label-md` text to maintain the editorial look.
*   **Don't** use "Grey on Grey" for text. Stick to `on_surface` to ensure the "Ink on Paper" high-contrast feel.