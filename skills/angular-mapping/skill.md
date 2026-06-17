# Skill: Angular Mapping

## Purpose

Given a Dojo concept (widget class, API module, pattern, or data structure), output the Angular 17+ equivalent with side-by-side code examples showing the Dojo approach and the Angular replacement.

---

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `concept` | The Dojo module, class, or pattern to map | `dojo/store/JsonRest` |
| `context` (optional) | Additional context about how the concept is used | "Used to fetch paginated user records" |

---

## Steps

1. **Identify the Dojo concept category.** Classify `{{concept}}` as one of:
   - **Module** (e.g., `dojo/request`, `dojo/on`)
   - **Widget class** (e.g., `dijit/_WidgetBase`, `dijit/form/Button`)
   - **Data pattern** (e.g., `dojo/store/JsonRest`, `dojo/store/Memory`)
   - **OOP pattern** (e.g., `declare`, multiple inheritance via declare mixins)
   - **Async pattern** (e.g., `dojo/Deferred`, `dojo/promise/all`)
   - **Event pattern** (e.g., `dojo/on`, `dojo/topic`, `dojo/aspect`)
   - **DOM pattern** (e.g., `dojo/dom-construct`, `dojo/dom-style`)
   - **Lifecycle method** (e.g., `postCreate`, `startup`, `destroy`)
   - **Template syntax** (e.g., `data-dojo-attach-point`, `data-dojo-type`)

2. **Look up the Angular equivalent.** Use the reference table in `docs/dojo-to-angular-cheatsheet.md` as the primary source. For concepts not in the cheatsheet, reason from Angular 17 official documentation principles.

3. **Write a Dojo code snippet** that illustrates the typical usage of `{{concept}}` in a real-world context (not a trivial hello-world). Include:
   - The AMD `define([...], function(...) {})` wrapper if appropriate.
   - Realistic variable names and 5–15 lines of code.

4. **Write the Angular equivalent snippet** that achieves the same behavior:
   - Use Angular 17 standalone component syntax where applicable.
   - Use TypeScript with explicit types.
   - Use RxJS operators for async/event patterns.
   - Use Angular Material for UI components when mapping Dijit widgets.
   - Mark `// TODO:` comments for anything that requires manual customization.

5. **List migration notes.** After the code examples, enumerate:
   - Behavioral differences (things that work slightly differently in Angular).
   - Breaking changes or features with no direct equivalent.
   - Required Angular packages (`npm install` commands).
   - Any RxJS operators or Angular APIs that need to be imported.

6. **Provide a migration checklist.** A short checklist of tasks to complete the migration for this concept:
   ```
   - [ ] Install required package(s)
   - [ ] Replace Dojo import with Angular equivalent
   - [ ] Update template syntax
   - [ ] Update lifecycle method(s)
   - [ ] Write unit test for new implementation
   ```

---

## Output Format

```markdown
## Mapping: `{{concept}}` → Angular

**Category:** {{category}}
**Angular equivalent:** {{angular-equivalent}}

---

### Dojo (Before)

```javascript
// {{concept}} — typical usage
define([
  'dojo/_base/declare',
  '{{concept}}'
], function(declare, Concept) {

  // ... realistic usage code ...

});
```

### Angular (After)

```typescript
// Angular equivalent
import { Component, OnInit } from '@angular/core';
import { AngularEquivalent } from '@angular/...';

// ... realistic Angular code ...
```

---

### Migration Notes

1. **Behavioral difference:** ...
2. **No direct equivalent:** ...
3. **Required packages:** `npm install @angular/...`

---

### Migration Checklist

- [ ] Remove AMD `define` wrapper
- [ ] Install `{{package}}`
- [ ] Replace `{{concept}}` usage with `{{angular-equivalent}}`
- [ ] Update template syntax (if applicable)
- [ ] Add unit test
```

---

## Example Invocation

> "Map `dojo/topic` to Angular, used for broadcasting user login events across multiple widgets."

Expected output: A mapping showing `dojo/topic.publish`/`subscribe` replaced by an Angular `EventBusService` using `RxJS Subject`, with a before/after code example and a checklist.

---

## Notes

- Always use Angular 17 standalone component syntax (no `NgModule` unless explicitly requested).
- Do not map deprecated Dijit widgets to other deprecated libraries — always recommend a modern Angular Material component.
- If the Dojo concept has **no good Angular equivalent** (e.g., `dojox/charting`), say so explicitly and recommend the best alternative library (e.g., Chart.js, ngx-charts, Apache ECharts).
- Prefer `HttpClient` over raw `fetch` for all HTTP mapping examples.
