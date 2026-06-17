# Prompt: Assess a Single Dojo Module

> **How to use:** Copy everything below the horizontal rule and paste it into GitHub Copilot Chat. Replace the `{{placeholders}}` with real values before sending.

---

I need you to perform a detailed assessment of a Dojo Toolkit module file to help plan its migration to Angular.

**File to assess:** `{{path/to/DojoModule.js}}`

Please read the file carefully and then answer all of the following:

---

## 1. Module Summary

Describe in 3–5 sentences what this module does from a business/functional perspective. What problem does it solve? What does a user see or experience when this module is active?

---

## 2. Module Type

Classify this module as one of: **widget**, **store**, **mixin**, **util**, **router**, or **entrypoint**. Explain why.

---

## 3. Dojo Dependencies

List every entry in the AMD `define([...])` dependency array. For each one, state:
- The full module ID (e.g., `dojo/on`)
- What it is used for in this module
- Whether it is deprecated (yes/no) and if so, what the replacement is

Format as a table:

| Dependency | Used For | Deprecated? | Replacement |
|------------|----------|-------------|-------------|

---

## 4. Deprecated API Flags

Beyond the imports, scan the function body for deprecated usage patterns:
- `dojo.connect(`, `dojo.byId(`, `dojo.query(`, `dojo.style(`, `dojo.addClass(`
- `dijit.byId(` used as a global
- `this.connect(` (legacy Dijit event shortcut)
- Any `dojo/_base/*` sub-packages used

For each hit, report: the pattern found, the line number (if visible), and the recommended modern replacement.

---

## 5. Lifecycle Methods (if widget)

If this is a Dijit widget, list the lifecycle methods it implements and briefly explain what each one does:
- `constructor`
- `postMixInProperties`
- `buildRendering`
- `postCreate`
- `startup`
- `resize`
- `destroy` / `destroyRecursive`

---

## 6. Template Analysis (if widget with templateString)

If the widget has a `templateString`, analyze the template:
- How many `data-dojo-attach-point` attributes are present?
- How many `data-dojo-attach-event` attributes are present?
- Are there any `data-dojo-type` nested widget instantiations? List them.
- Is `widgetsInTemplate: true` set? (This significantly increases complexity.)

---

## 7. Global State or Side Effects

Does this module:
- Declare any module-level mutable variables (not constants)?
- Use `dojo/topic` to publish or subscribe to events? If so, what topic names?
- Modify the DOM or `window` object at module load time (outside of a function)?
- Use `lang.mixin` to extend a shared/global object?

---

## 8. Angular Migration Effort Estimate

Based on your analysis, estimate the migration effort using a T-shirt size:

| Size | Meaning |
|------|---------|
| **S** | < 4 hours; simple util or tiny widget with no deprecated APIs and existing tests |
| **M** | 1–2 days; moderate widget with a few deprecated APIs; some test coverage |
| **L** | 3–5 days; complex widget with deprecated APIs, no tests, or dojox dependency |
| **XL** | 1–2 weeks; deeply coupled widget, manual intervention required, or no viable Angular equivalent for a key dependency |

State your estimate and justify it in 2–3 sentences.

---

## 9. Suggested Angular Equivalent Structure

Describe how this module should be represented in Angular:
- What Angular construct(s) replace it? (e.g., `@Component`, `@Injectable` service, plain TypeScript function)
- What Angular Material components (if any) replace its Dijit widgets?
- Sketch the Angular file structure (e.g., `user-form/user-form.component.ts`, `user-form/user-form.component.html`, `user-form/user-form.component.spec.ts`)
- List any Angular packages that need to be installed (`npm install ...`)

---

## 10. Migration Prerequisites

List any prerequisites that must be completed **before** this module can be migrated:
- Other modules that must be migrated first (because this module depends on them)
- Tests that must be written first (characterization tests on the Dojo side)
- Technical decisions that need to be made (e.g., which Angular Material component replaces a custom Dijit widget)
- Infrastructure that must exist (Angular project scaffold, shared services, etc.)
