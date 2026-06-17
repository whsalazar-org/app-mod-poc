# Migration Assessment Report Template

> **How to use:** Copy this template, fill in the sections for your specific application, and share it with your team or feed it into the `migration-planner` agent. Sections marked `<!-- EXAMPLE -->` contain fictional example data — replace with your actual findings.

---

# Dojo → Angular Migration Assessment Report

**Application:** <!-- EXAMPLE: LegacyPortal v2.3.1 -->
**Assessed by:** <!-- EXAMPLE: Jane Smith (Senior Engineer) -->
**Assessment date:** <!-- EXAMPLE: 2024-03-15 -->
**Report version:** 1.0
**Status:** Draft / Final

---

## Executive Summary

<!-- EXAMPLE:
The LegacyPortal application is built on Dojo Toolkit 1.14.2 and consists of 42 JavaScript modules (18 Dijit widgets, 8 stores, 12 utilities, and 4 mixins). The codebase is approximately 14,000 lines of code with 38% test coverage. The majority of widgets are low-to-medium complexity; however, three widgets (DataGrid, RichEditor, and MapViewer) represent significant migration risk due to third-party dojox dependencies and no test coverage.

The recommended migration strategy is a **Strangler Fig** approach over 11 sprints (approximately 5.5 months). The Angular target stack is Angular 17 standalone components, Angular Material, RxJS, and HttpClient. No NgRx is recommended for this application given its limited cross-widget state sharing.

Estimated total migration effort: **280 engineer-days** across a team of 4.
-->

_[Replace with your application's summary. Include: total module count, LOC, test coverage %, recommended strategy, estimated effort, and timeline.]_

---

## 1. Inventory Summary

<!-- EXAMPLE: -->
| Module Type | Count | Total LOC | Avg LOC | Tested (%) |
|-------------|-------|-----------|---------|-----------|
| Widgets | 18 | 8,400 | 467 | 33% |
| Stores | 8 | 1,800 | 225 | 63% |
| Utilities | 12 | 2,400 | 200 | 75% |
| Mixins | 4 | 1,400 | 350 | 25% |
| **Total** | **42** | **14,000** | **333** | **38%** |

### Top 10 Largest Modules

<!-- EXAMPLE: -->
| # | Module | Type | LOC | Complexity |
|---|--------|------|-----|------------|
| 1 | app/widgets/DataGrid | widget | 892 | Critical |
| 2 | app/widgets/RichEditor | widget | 743 | Critical |
| 3 | app/widgets/MapViewer | widget | 612 | High |
| 4 | app/widgets/UserManagement | widget | 534 | High |
| 5 | app/widgets/ReportBuilder | widget | 489 | High |
| 6 | app/mixins/FormValidation | mixin | 421 | High |
| 7 | app/widgets/Dashboard | widget | 378 | Medium |
| 8 | app/stores/DataCache | store | 356 | Medium |
| 9 | app/widgets/LoginForm | widget | 312 | Medium |
| 10 | app/widgets/UserProfile | widget | 287 | Medium |

---

## 2. Risk Assessment

### Dependency Risk

<!-- EXAMPLE: -->
| Package | Version | Status | CVEs | Angular Path |
|---------|---------|--------|------|--------------|
| dojo | 1.14.2 | ⚠️ Community | CVE-2021-23450 (High) | ✅ Migrate |
| dijit | 1.14.2 | ⚠️ EOL | None | ✅ → Angular Material |
| dojox | 1.14.2 | 🔴 Largely EOL | None | 🔴 Varies by sub-pkg |
| dgrid | 1.2.1 | 🔴 EOL | None | ⚠️ → Angular Material Table |

**Overall dependency risk:** 🔴 High

### Critical Risks

<!-- EXAMPLE: -->
1. **CVE-2021-23450** — Prototype pollution in `dojo/_base/lang.mixin`. **Immediate action required**: upgrade Dojo to 1.17.3.
2. **dojox/grid EOL** — Used in DataGrid widget (892 LOC). No migration path; must be rebuilt using Angular Material Table. Estimated effort: 15 engineer-days.
3. **dojox/charting EOL** — Used in Dashboard widget. Recommend replacement with Apache ECharts. Estimated effort: 8 engineer-days.
4. **0% test coverage on 3 High-complexity widgets** — High regression risk. Characterization tests must be written before migration.

---

## 3. Migration Complexity Matrix

<!-- EXAMPLE: -->
| Module | Type | LOC | Deps | Deprecated APIs | Tests | Complexity | Est. Effort |
|--------|------|-----|------|-----------------|-------|------------|-------------|
| app/widgets/DataGrid | widget | 892 | 12 | 5 | ❌ | Critical | 15 days |
| app/widgets/RichEditor | widget | 743 | 9 | 3 | ❌ | Critical | 12 days |
| app/widgets/MapViewer | widget | 612 | 11 | 4 | ❌ | Critical | 10 days |
| app/widgets/UserManagement | widget | 534 | 8 | 2 | ⚠️ partial | High | 6 days |
| app/widgets/ReportBuilder | widget | 489 | 10 | 4 | ❌ | High | 8 days |
| app/mixins/FormValidation | mixin | 421 | 6 | 1 | ✅ | High | 5 days |
| app/widgets/Dashboard | widget | 378 | 7 | 3 | ⚠️ partial | Medium | 4 days |
| app/stores/DataCache | store | 356 | 5 | 0 | ✅ | Medium | 3 days |
| app/widgets/LoginForm | widget | 312 | 6 | 2 | ✅ | Medium | 3 days |
| app/utils/DateHelper | util | 45 | 1 | 0 | ✅ | Low | 0.5 days |
| app/utils/StringHelper | util | 38 | 1 | 0 | ✅ | Low | 0.5 days |

**Total estimated effort:** 280 engineer-days (across a team of 4 = ~14 weeks)

---

## 4. Phased Roadmap

### Phase 0 — Foundation (Sprints 1–2) · _4 weeks_

**Goal:** Angular project running alongside legacy; all utilities migrated.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Scaffold Angular 17 standalone project | Eng | 1 day | ⬜ |
| Configure dual-serve (legacy + Angular) | DevOps | 2 days | ⬜ |
| Patch Dojo to 1.17.3 (CVE fix) | Eng | 0.5 days | ⬜ |
| Migrate all 12 util modules | Eng | 6 days | ⬜ |
| Set up Jest + Testing Library | Eng | 1 day | ⬜ |

**Exit criteria:** Angular app builds and serves on port 4200; all util unit tests pass (≥90% coverage).

---

### Phase 1 — Data Layer (Sprints 3–4) · _4 weeks_

**Goal:** All data access through Angular services.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Migrate app/stores/DataCache → DataCacheService | Eng | 3 days | ⬜ |
| Migrate remaining 7 store modules | Eng | 10 days | ⬜ |
| Implement EventBusService (replaces dojo/topic) | Eng | 2 days | ⬜ |

**Exit criteria:** All Angular services have ≥80% test coverage; Dojo stores still work in parallel.

---

### Phase 2 — Leaf Widgets (Sprints 5–6) · _4 weeks_

**Goal:** Low and Medium complexity widgets rendering in Angular.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Migrate LoginForm → LoginFormComponent | Eng | 3 days | ⬜ |
| Migrate Dashboard → DashboardComponent | Eng | 4 days | ⬜ |
| Migrate UserProfile → UserProfileComponent | Eng | 3 days | ⬜ |

**Exit criteria:** Migrated components render correctly; Angular component tests pass.

---

### Phase 3 — Composite Widgets (Sprints 7–9) · _6 weeks_

**Goal:** Complex widgets migrated; Angular Router in place.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Migrate UserManagement → UserManagementComponent | Eng | 6 days | ⬜ |
| Migrate ReportBuilder → ReportBuilderComponent | Eng | 8 days | ⬜ |
| Configure Angular Router for all migrated routes | Eng | 2 days | ⬜ |
| Write characterization tests for Phase 4 targets | QA | 5 days | ⬜ |

**Exit criteria:** Full user workflows functional end-to-end in Angular for migrated features.

---

### Phase 4 — Critical Widgets & Manual Items (Sprints 10–12) · _6 weeks_

**Goal:** All manual-intervention items resolved.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Replace dojox/grid with Angular Material Table in DataGrid | Eng | 15 days | ⬜ |
| Replace dojox/charting with Apache ECharts in Dashboard | Eng | 8 days | ⬜ |
| Migrate MapViewer (evaluate Leaflet + Angular wrapper) | Eng | 10 days | ⬜ |
| Migrate RichEditor (evaluate `ngx-quill` or `@tiptap/angular`) | Eng | 12 days | ⬜ |

**Exit criteria:** All manual-intervention items resolved; full regression suite passes.

---

### Phase 5 — Cutover (Sprint 13) · _2 weeks_

**Goal:** Legacy Dojo completely removed.

| Task | Owner | Effort | Status |
|------|-------|--------|--------|
| Remove Dojo bundle from build pipeline | DevOps | 1 day | ⬜ |
| Remove strangler-fig proxy | DevOps | 0.5 days | ⬜ |
| Performance benchmarking vs. legacy baseline | QA | 3 days | ⬜ |
| Final regression testing | QA | 5 days | ⬜ |

**Exit criteria:** Zero Dojo imports remain; bundle size within 250 KB gzipped; all tests pass.

---

## 5. Recommendations

<!-- EXAMPLE: -->

### Immediate Actions (Before Migration Starts)

1. **Patch Dojo to 1.17.3** to address CVE-2021-23450 (prototype pollution). This is a 2-hour task.
2. **Write characterization tests** for DataGrid, RichEditor, and MapViewer before any migration work begins. These tests document current behavior and will be used to validate the Angular replacements.
3. **Spike on dojox/grid replacement** in Sprint 1 to validate Angular Material Table can cover all DataGrid use cases. If not, evaluate AG Grid Community Edition (open source, Angular-compatible).

### Architectural Recommendations

4. Use **Angular standalone components** throughout — do not use `NgModule`. This simplifies the component tree and aligns with Angular 17 best practices.
5. Use **`HttpClient` interceptors** to replace the legacy `dojo/request` authentication wrapper — this is cleaner than per-service token injection.
6. Do **not** introduce NgRx for this application — the shared state is limited to session data and a few cache stores. A set of `BehaviorSubject`-based services is sufficient and simpler to maintain.
7. Establish a **dual-serve configuration** in Sprint 1 so that the Angular app can be developed without disrupting the legacy app in production.

### Process Recommendations

8. Run a **Dojo-to-Angular knowledge-sharing session** with the team before Phase 2 begins. Focus on RxJS patterns, Angular template syntax, and component lifecycle hooks.
9. Establish a **migration PR template** that requires: component analysis score, unit tests added, and a link to the corresponding legacy module.
10. Automate **bundle size tracking** using `bundlemon` or Angular's `ng build --stats-json` + `webpack-bundle-analyzer` to catch regressions early.

---

## Appendix A: Module-to-Component Mapping

<!-- EXAMPLE: -->
| Dojo Module | Angular Component/Service | Angular Package |
|-------------|--------------------------|-----------------|
| app/widgets/LoginForm | `LoginFormComponent` | `@angular/forms`, `@angular/material` |
| app/widgets/DataGrid | `DataGridComponent` (uses `MatTable`) | `@angular/material/table`, `@angular/cdk` |
| app/stores/DataCache | `DataCacheService` | `@angular/common/http` |
| app/mixins/FormValidation | `FormValidationDirective` | `@angular/forms` |

---

## Appendix B: Decisions Required

| # | Decision | Options | Owner | Due |
|---|----------|---------|-------|-----|
| 1 | DataGrid replacement library | Angular Material Table vs. AG Grid | Tech Lead | Sprint 1 |
| 2 | Map library | Angular + Leaflet vs. Google Maps Angular SDK | Product + Tech Lead | Sprint 1 |
| 3 | Rich text editor | `ngx-quill` vs. `@tiptap/angular` | Tech Lead | Sprint 3 |
