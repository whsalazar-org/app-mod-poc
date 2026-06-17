# Skill: Test Gap Scanner

## Purpose

Identify Dojo widget and module files that have no corresponding test file, and for each untested module suggest an Angular testing approach to adopt during migration.

---

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `source-dir` | Root directory of the Dojo source files | `src/` |
| `test-dir` | Root directory where test files live | `tests/` |
| `test-patterns` (optional) | Comma-separated glob patterns for test file names | `*Test.js,*Spec.js,*.test.js` |

---

## Steps

1. **Build the source file list.** Recursively enumerate all `.js` and `.ts` files under `{{source-dir}}`. Exclude:
   - Build output directories: `dist/`, `release/`, `build/`
   - Vendor/third-party code: `node_modules/`, `dojo/`, `dijit/`, `dojox/`
   - Entry-point bootstraps if they contain only `require([...])` and no business logic

2. **Build the test file list.** Recursively enumerate all files under `{{test-dir}}`. Apply `{{test-patterns}}` (default: `*Test.js`, `*Spec.js`, `*.test.js`, `*.spec.js`, `*.test.ts`, `*.spec.ts`).

3. **Match source files to test files.** For each source file at path `{{source-dir}}/foo/Bar.js`, search the test file list for any file whose base name (without extension and without `Test`/`Spec`/`.test`/`.spec` suffix) matches `Bar`. Record:
   - `matched` = true if a match is found, false otherwise.
   - `testFilePath` = path of matched test file (null if unmatched).

4. **Classify untested modules.** For each source file with `matched = false`, determine its Dojo module type:
   - Parse the file for a `define([...])` call.
   - Apply the same type classification rules as the `dojo-inventory` skill (widget / store / mixin / util / entrypoint).
   - Record the module's type, estimated LOC (line count), and whether it contains any `define(` call.

5. **Suggest an Angular testing approach.** For each untested module, recommend a testing strategy based on its type:

   | Module Type | Suggested Angular Test Approach |
   |-------------|--------------------------------|
   | **widget** | Angular `TestBed` + component spec (`*.component.spec.ts`); use `@testing-library/angular` for behavior-driven tests; use `jest-environment-jsdom` for DOM assertions |
   | **store** | Angular `TestBed` with `HttpClientTestingModule` for `HttpClient`-backed services; use `jasmine-marbles` or `rxjs/testing` `TestScheduler` for Observable assertions |
   | **mixin** (becomes directive/abstract class) | Angular `TestBed` with a test host component that applies the directive |
   | **util** (pure functions) | Plain Jest unit tests — no `TestBed` needed; fast and simple |
   | **entrypoint** | Integration test with Angular `RouterTestingModule`; Cypress E2E test for full flow |

6. **Prioritize the gaps.** Rank untested modules by migration risk:
   - **Priority 1 (Migrate First):** widget or store type, LOC > 100, no test
   - **Priority 2 (Migrate Soon):** widget or store type, LOC <= 100, no test
   - **Priority 3 (Low urgency):** util or mixin type, no test

7. **Compute coverage statistics.**
   ```
   totalModules = count of source files analyzed
   testedModules = count of source files with matched = true
   coveragePercent = round((testedModules / totalModules) * 100)
   ```

---

## Output Format

```markdown
## Test Gap Report

**Source directory:** `{{source-dir}}`
**Test directory:** `{{test-dir}}`
**Date:** {{date}}

### Coverage Summary

| Metric | Value |
|--------|-------|
| Total modules | 18 |
| Modules with tests | 7 |
| Modules without tests | 11 |
| Coverage | 39% |

---

### Untested Modules — Prioritized

#### 🔴 Priority 1 — Migrate First (widget/store, LOC > 100)

| Module File | Type | LOC | Suggested Angular Test Approach |
|-------------|------|-----|--------------------------------|
| src/widgets/UserForm.js | widget | 312 | `TestBed` + `@testing-library/angular`; test user interactions with `userEvent` |
| src/widgets/DataGrid.js | widget | 489 | `TestBed` + Angular Material table harnesses; mock `HttpClient` for data loading |
| src/stores/UserStore.js | store  | 89  | `HttpClientTestingModule`; assert Observable emissions with `rxjs/testing` |

#### 🟡 Priority 2 — Migrate Soon (widget/store, LOC ≤ 100)

| Module File | Type | LOC | Suggested Angular Test Approach |
|-------------|------|-----|--------------------------------|
| src/widgets/StatusBadge.js | widget | 67 | `TestBed` + `@testing-library/angular`; snapshot test for rendering |
| src/stores/SessionStore.js | store  | 44 | Pure service test; mock `HttpClient` responses |

#### 🟢 Priority 3 — Low Urgency (util/mixin)

| Module File | Type | LOC | Suggested Angular Test Approach |
|-------------|------|-----|--------------------------------|
| src/utils/DateHelper.js | util | 45 | Plain Jest tests — no `TestBed`; test each exported function |
| src/mixins/Resizable.js | mixin | 67 | `TestBed` with a test host component that applies the directive |

---

### Already Tested Modules

| Module File | Test File |
|-------------|-----------|
| src/widgets/LoginForm.js | tests/widgets/LoginFormTest.js |
| src/utils/StringHelper.js | tests/utils/StringHelperTest.js |

---

### Recommended Actions

1. Before migrating any widget, write **characterization tests** in the legacy Dojo environment to document current behavior.
2. Migrate util modules **first** — they can be tested with plain Jest and have no UI complexity.
3. Use `@testing-library/angular` for component tests to write behavior-focused tests that survive refactors.
4. Set up a coverage threshold (`jest --coverage --coverageThreshold='{"global":{"lines":80}}'`) in `jest.config.ts` for the Angular project.
5. For `DataGrid.js` (489 LOC, no tests) — conduct a **manual testing session** to document its edge cases before migration begins.
```

---

## Notes

- This skill performs **read-only analysis** — it never modifies files.
- "Characterization tests" refer to tests written against the existing Dojo implementation to capture its current behavior before refactoring. These tests are meant to be thrown away once the Angular implementation passes them.
- If `{{test-dir}}` does not exist, report "No test directory found at `{{test-dir}}`" and list all source files as untested.
- Matching is **case-insensitive** to handle variations like `userform` vs `UserForm`.
