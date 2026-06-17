# Skill: Component Analyzer

## Purpose

Given a single Dojo widget file, produce a migration complexity score (1–5) by measuring lines of code, number of dependencies, deprecated API usage, test presence, and template complexity.

---

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `file` | Absolute or relative path to a Dojo widget `.js` file | `src/widgets/UserForm.js` |
| `test-dir` (optional) | Root directory to search for a corresponding test file | `tests/` |

---

## Steps

1. **Read the file.** Load the content of `{{file}}`. If the file does not exist or is not readable, report an error and stop.

2. **Verify it is a Dojo widget.** Check that the file contains a `define(` call and that the dependency array includes at least one of: `dijit/_WidgetBase`, `dijit/_TemplatedMixin`, `dijit/_Container`, `dijit/layout/_LayoutWidget`. If not, report: "This file does not appear to be a Dijit widget. Use the `dojo-inventory` skill to classify it."

3. **Measure Lines of Code (LOC).** Count:
   - `totalLOC`: all lines in the file (including blank lines and comments).
   - `codeLOC`: non-blank, non-comment lines only.
   - `templateLOC`: if a `templateString` is present, count the lines between its opening and closing delimiters.

4. **Count dependencies.** Parse the AMD `define([...])` dependency array:
   - `totalDeps`: total number of entries.
   - `dojoCoreDeps`: entries starting with `dojo/` or `dijit/`.
   - `dojoxDeps`: entries starting with `dojox/`.
   - `appDeps`: entries that are relative paths or match the app namespace.
   - `thirdPartyDeps`: all others.

5. **Detect deprecated API usage.** Search the file for:

   | Pattern | Points |
   |---------|--------|
   | `dojo.connect(` or `dojo/_base/connect` | +2 |
   | `dojo.byId(` or `dojo.query(` | +1 |
   | `dojo.style(` or `dojo.addClass(` | +1 |
   | `dojo/data/` imports | +2 |
   | `dojox/` imports | +2 |
   | `dijit.byId(` global | +1 |
   | `dojo/io/` imports | +1 |
   | `this.connect(` (dijit legacy event helper) | +1 |

   Record `deprecatedApiScore` = sum of all matched points.
   Record `deprecatedPatterns` = list of unique patterns found.

6. **Analyze lifecycle complexity.** Check which Dojo widget lifecycle methods are implemented:
   - `constructor`: +0 (expected)
   - `postMixInProperties`: +1 (data init before rendering)
   - `buildRendering`: +2 (custom DOM construction — complex)
   - `postCreate`: +1 (standard setup)
   - `startup`: +1 (deferred setup)
   - `resize`: +1 (layout logic)
   - `destroy` or `destroyRecursive`: +1 (cleanup)

   Record `lifecycleScore` = sum of points for methods present.
   Record `lifecycleMethods` = list of methods found.

7. **Analyze template complexity.** If `templateString` is present in the widget:
   - Count `attachPoints`: occurrences of `data-dojo-attach-point`.
   - Count `attachEvents`: occurrences of `data-dojo-attach-event`.
   - Count `nestedWidgets`: occurrences of `data-dojo-type`.
   - Check `widgetsInTemplate: true` (boolean flag in widget declaration) — if present, add +2.
   - `templateScore` = `attachPoints` + `attachEvents` + (`nestedWidgets` × 2) + (2 if widgetsInTemplate)

8. **Check for a test file.** Search `{{test-dir}}` (default: same project, `tests/` or `spec/` subdirectory) for a file whose name contains the widget's base name (without extension). Record:
   - `hasTest` (boolean)
   - `testFilePath` (path if found, null if not)
   - If no test: `testScore` = +2; if test exists: `testScore` = 0.

9. **Compute migration complexity score.**
   ```
   rawScore = 0

   # LOC scoring (codeLOC)
   if codeLOC > 400: rawScore += 3
   elif codeLOC > 200: rawScore += 2
   elif codeLOC > 100: rawScore += 1

   # Dependency scoring
   if totalDeps > 10: rawScore += 2
   elif totalDeps > 6: rawScore += 1

   # Deprecated APIs
   if deprecatedApiScore > 6: rawScore += 3
   elif deprecatedApiScore > 2: rawScore += 2
   elif deprecatedApiScore > 0: rawScore += 1

   # Lifecycle complexity
   if lifecycleScore > 4: rawScore += 2
   elif lifecycleScore > 2: rawScore += 1

   # Template complexity
   if templateScore > 10: rawScore += 2
   elif templateScore > 4: rawScore += 1

   # Test coverage
   rawScore += testScore  # 0 or 2

   # Normalize to 1–5 scale
   complexityScore = max(1, min(5, round(rawScore / 3) + 1))
   ```

   Map to labels:
   | Score | Label | Meaning |
   |-------|-------|---------|
   | 1 | **Trivial** | Minimal Dojo usage; migrate in < 2 hours |
   | 2 | **Low** | Few deps, clean code; migrate in < 1 day |
   | 3 | **Medium** | Moderate complexity; migrate in 1–3 days |
   | 4 | **High** | Complex lifecycle/template; migrate in 3–5 days |
   | 5 | **Critical** | Deeply coupled or dojox-dependent; spike required |

---

## Output Format

```markdown
## Component Analysis: `{{file}}`

**Widget name:** `{{WidgetClassName}}`
**Analysis date:** {{date}}

---

### Metrics

| Metric | Value |
|--------|-------|
| Total LOC | 312 |
| Code LOC | 245 |
| Template LOC | 48 |
| Total dependencies | 9 |
| Dojo/Dijit deps | 7 |
| dojox deps | 1 |
| App deps | 1 |
| Deprecated API score | 4 |
| Lifecycle methods | postCreate, startup, destroy |
| Attach-points | 6 |
| Attach-events | 3 |
| Nested widgets | 2 |
| widgetsInTemplate | true |
| Has test file | ❌ (`tests/widgets/UserFormTest.js` not found) |

---

### Deprecated APIs Found

| Pattern | Line(s) | Recommended Replacement |
|---------|---------|------------------------|
| `dojo.connect(` | 42, 87 | `dojo/on` → Angular `(event)` binding |
| `dojox/layout/ResizeHandle` | dep #7 | Rebuild with Angular CDK Drag-Drop |

---

### Lifecycle Analysis

| Method | Present | Migration Target |
|--------|---------|-----------------|
| constructor | ✅ | Angular `constructor()` |
| postCreate | ✅ | `ngOnInit()` |
| startup | ✅ | `ngAfterViewInit()` |
| buildRendering | ❌ | N/A |
| destroy | ✅ | `ngOnDestroy()` |

---

### Migration Complexity Score

## ⭐⭐⭐⭐ 4 / 5 — High

**Rationale:**
- 245 code LOC with 9 dependencies (+2)
- 4 deprecated API score (+2)
- `widgetsInTemplate: true` with 2 nested widgets (+2)
- No test coverage (+2)
- Moderate lifecycle complexity (3 methods) (+1)

**Estimated effort:** 3–5 developer days

---

### Migration Recommendations

1. Write characterization tests before migrating (no existing tests).
2. Replace `dojox/layout/ResizeHandle` with Angular CDK (`@angular/cdk/drag-drop`) — **[SPIKE REQUIRED]**.
3. Migrate `postCreate` → `ngOnInit` and `startup` → `ngAfterViewInit`.
4. Replace all `dojo.connect` calls with Angular `(event)` bindings in the template.
5. Replace `dojo/dom-construct` calls with Angular `*ngIf`/`*ngFor` directives.
```

---

## Notes

- This skill is read-only — it never modifies source files.
- Scores are estimates. A developer reviewing the output should adjust if the widget has unusual patterns not captured by the automated scoring.
- If `buildRendering` is overridden, always flag for manual review — this method customizes the DOM construction pipeline and has no direct Angular equivalent.
