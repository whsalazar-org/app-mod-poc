# Skill: Dependency Risk Assessment

## Purpose

Scan a project's `package.json` or AMD dependency list for Dojo/Dijit packages and flag those that are end-of-life (EOL), have known CVEs, lack an Angular equivalent, or represent migration blockers.

---

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `source` | Path to `package.json` **or** an AMD module dependency list (output from `dojo-inventory` skill) | `package.json` or paste inventory output |
| `dojo-version` (optional) | The Dojo version in use if known | `1.17.3` |

---

## Steps

1. **Parse dependencies.** If `{{source}}` is a `package.json`:
   - Read `dependencies`, `devDependencies`, and `peerDependencies`.
   - Filter for entries whose key or version string references: `dojo`, `dijit`, `dojox`, `util` (the Dojo util package), or `dgrid`.
   - Record: `packageName`, `installedVersion`, `section` (dependencies/devDependencies).

   If `{{source}}` is an AMD inventory table:
   - Collect the unique `dojo/*`, `dijit/*`, `dojox/*` sub-packages referenced across all modules.
   - Record each unique sub-package as a dependency entry with version = `{{dojo-version}}` (or "unknown").

2. **Assess EOL status.** For each dependency, determine end-of-life status:

   | Package | EOL / Status | Notes |
   |---------|-------------|-------|
   | `dojo` (any 1.x) | ⚠️ Community-only maintenance since 2021 | No new features; security patches are community-driven |
   | `dijit` | ⚠️ EOL for active development | Part of Dojo 1.x; not updated for modern browsers |
   | `dojox` | 🔴 Largely EOL | Many sub-packages are abandoned; no Angular equivalent |
   | `dgrid` | 🔴 EOL | Last release 2019; no migration path offered by maintainers |
   | `dojo/data` | 🔴 Superseded | Replaced by `dojo/store` within Dojo 1.x itself |
   | `dojo/io/iframe` | 🔴 Legacy | Use `dojo/request` or Angular `HttpClient` |
   | `dojox/charting` | 🔴 Abandoned | Evaluate Chart.js, Apache ECharts, or ngx-charts |
   | `dojox/grid` | 🔴 EOL | Replaced by dgrid (also EOL); use Angular Material Table |
   | `dojox/mobile` | 🔴 EOL | Use Ionic + Angular or Angular Material responsive layout |

3. **Check for known CVEs.** For each package at the specified version, note:
   - Dojo 1.x versions before 1.17.0 are affected by CVE-2018-6341 (XSS via `dojo/string.substitute`).
   - Dojo 1.x versions before 1.16.3 are affected by CVE-2021-23450 (prototype pollution via `dojo/_base/lang.mixin`).
   - Flag the specific CVE ID, severity, affected version range, and fix version.
   - If `dojo-version` is unknown, flag all known CVEs as "possibly affected — verify version."

4. **Assess Angular migration feasibility.** For each dependency, rate its migration path:

   | Rating | Meaning |
   |--------|---------|
   | ✅ Direct equivalent | A well-supported Angular library replaces this exactly |
   | ⚠️ Partial equivalent | An Angular alternative exists but with behavioral differences |
   | 🔴 No equivalent | Must be rebuilt from scratch or replaced with a different library |
   | ❓ Unknown | Insufficient information; manual investigation required |

5. **Recommend replacements.** For each flagged dependency, suggest the Angular replacement:

   | Dojo Package | Angular Replacement | npm Package |
   |-------------|---------------------|-------------|
   | `dojo/request` | `HttpClient` | `@angular/common/http` (built-in) |
   | `dojo/store/Memory` | In-memory service + `BehaviorSubject` | RxJS (built-in) |
   | `dojo/store/JsonRest` | `HttpClient`-backed service | `@angular/common/http` |
   | `dojo/on` | Angular event bindings / `fromEvent` | RxJS (built-in) |
   | `dojo/topic` | `Subject` / `BehaviorSubject` | RxJS (built-in) |
   | `dijit/*` widgets | Angular Material components | `@angular/material` |
   | `dojox/charting` | Apache ECharts or Chart.js | `echarts` / `chart.js` |
   | `dgrid` | Angular Material Table + CDK Virtual Scroll | `@angular/material` / `@angular/cdk` |
   | `dojox/grid` | Angular Material Table | `@angular/material` |

6. **Compute an overall risk score.**
   ```
   riskScore = 0
   for each dependency:
     if status == "EOL": riskScore += 3
     if hasCVE: riskScore += (4 if severity == "critical" else 2)
     if angularPath == "No equivalent": riskScore += 3
     if angularPath == "Partial equivalent": riskScore += 1

   riskLevel = "Low" if riskScore < 5 else "Medium" if riskScore < 15 else "High" if riskScore < 25 else "Critical"
   ```

---

## Output Format

```markdown
## Dependency Risk Report

**Source:** {{source}}
**Dojo version:** {{dojo-version or "unknown"}}
**Date:** {{date}}
**Overall risk level:** 🔴 High (score: 23)

---

### Dependency Risk Matrix

| Package | Version | EOL? | CVEs | Angular Migration Path | Recommended Replacement |
|---------|---------|------|------|----------------------|------------------------|
| dojo | 1.14.2 | ⚠️ Community | CVE-2021-23450 (High) | ✅ Incremental | Angular + RxJS |
| dijit | 1.14.2 | ⚠️ EOL | None known | ✅ Direct | Angular Material |
| dojox | 1.14.2 | 🔴 Largely EOL | None known | 🔴 Varies | See sub-package list |
| dgrid | 1.2.1 | 🔴 EOL | None known | ⚠️ Partial | Angular Material Table |

---

### CVE Details

#### CVE-2021-23450 — Prototype Pollution in `dojo/_base/lang`
- **Severity:** High (CVSS 7.5)
- **Affected versions:** < 1.16.3
- **Your version:** 1.14.2 (**VULNERABLE**)
- **Fix:** Upgrade to Dojo 1.17.3 (short-term) or migrate to Angular (long-term)
- **Description:** `lang.mixin()` and `lang.extend()` do not filter `__proto__` keys, allowing prototype pollution attacks.

---

### dojox Sub-Package Risk Detail

| dojox Sub-Package | Used In | Status | Replacement |
|-------------------|---------|--------|-------------|
| dojox/grid | 2 widgets | 🔴 EOL | Angular Material Table |
| dojox/charting | 1 dashboard | 🔴 Abandoned | Apache ECharts (`echarts`) |
| dojox/mobile | 0 files | N/A | N/A |

---

### Immediate Recommendations

1. **[CRITICAL]** Upgrade Dojo to 1.17.3 immediately to patch CVE-2021-23450.
2. **[HIGH]** Plan replacement of `dgrid` in Phase 4 of migration — no direct migration path.
3. **[HIGH]** Plan replacement of `dojox/charting` — evaluate `echarts` package.
4. **[MEDIUM]** All `dijit/*` widgets can be replaced with `@angular/material` — straightforward migration.
```

---

## Notes

- CVE data in this skill reflects known vulnerabilities as of the skill's authoring date. Always cross-reference with the [GitHub Advisory Database](https://github.com/advisories) and [NVD](https://nvd.nist.gov/) for the latest information.
- Do not modify `package.json` — this skill is read-only analysis.
- If the project uses a Dojo CDN link rather than npm, note that versioned CDN usage prevents automated CVE scanning and recommend moving to an npm-managed dependency.
