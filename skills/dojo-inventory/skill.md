# Skill: Dojo Inventory

## Purpose

Scan a directory for all Dojo AMD modules and produce a structured inventory table showing each module's name, type, dependencies, and deprecated API usage.

---

## Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `directory` | Root path of the Dojo source to scan | `src/legacy/` |
| `namespace` (optional) | AMD namespace prefix to filter results | `app` |

---

## Steps

1. **Enumerate files.** Recursively list all `.js` and `.ts` files under `{{directory}}`. Skip minified files (filenames containing `.min.`), build output directories (`dist/`, `release/`, `build/`), and `node_modules/`.

2. **Extract AMD module metadata.** For each file, search for:
   ```
   define([...], function(...) { ... })
   define("moduleId", [...], function(...) { ... })
   ```
   Extract:
   - `moduleId`: the string literal first arg (if present) OR derive from file path relative to `{{directory}}`.
   - `deps`: the full dependency array as a list of strings.
   - `factoryParams`: the parameter names in the factory function signature.

3. **Classify module type.** For each module, apply the following rules in order:
   - **widget** — if `deps` contains any of: `dijit/_WidgetBase`, `dijit/_TemplatedMixin`, `dijit/_Container`, `dijit/layout/_LayoutWidget`
   - **store** — if `deps` contains any of: `dojo/store/Memory`, `dojo/store/JsonRest`, `dojo/store/Observable`, `dojo/data/ItemFileReadStore`
   - **mixin** — if the module ID ends in `Mixin` or `deps` contains only mixin-type modules
   - **router** — if `deps` contains `dojo/router`
   - **util** — any module that does not match the above rules

4. **Detect deprecated APIs.** Scan the file content for the following patterns and flag which are present:

   | Pattern | Deprecated Since | Replacement |
   |---------|------------------|-------------|
   | `dojo.connect(` | Dojo 1.7 | `dojo/on` |
   | `dojo.disconnect(` | Dojo 1.7 | `dojo/on` handle `.remove()` |
   | `dojo.byId(` | Dojo 1.7 | `dojo/dom` `dom.byId()` |
   | `dojo.query(` | Dojo 1.7 | `dojo/query` |
   | `dojo.style(` | Dojo 1.7 | `dojo/dom-style` |
   | `dojo.addClass(` | Dojo 1.7 | `dojo/dom-class` |
   | `dojo/_base/connect` | Dojo 1.7 | `dojo/on` |
   | `dojo/data/` | Dojo 1.8 | `dojo/store` |
   | `dojo/io/iframe` | Dojo 1.8 | `dojo/request` |
   | `dijit.byId(` | Dojo 1.7 | `dijit/registry` `registry.byId()` |

   For each file, record a list of unique deprecated patterns found.

5. **Count dependency categories.** For each module's `deps` array, count:
   - `dojoCoreDeps`: entries starting with `dojo/` or `dijit/`
   - `dojoxDeps`: entries starting with `dojox/`
   - `appDeps`: entries that are relative paths (`./`, `../`) or match `{{namespace}}/`
   - `thirdPartyDeps`: all other entries

6. **Assemble the inventory table.** For each module, produce one row in the output table.

---

## Output Format

Produce a Markdown table followed by a summary section:

```markdown
## Dojo Module Inventory — `{{directory}}`

_Scanned: {{date}} | Total files: N | Total modules: N_

| Module ID | Type | LOC | dojo/* deps | app deps | dojox deps | Deprecated APIs |
|-----------|------|-----|-------------|----------|-----------|-----------------|
| app/widgets/UserForm | widget | 312 | 6 | 2 | 0 | `dojo.connect`, `dojo.byId` |
| app/stores/UserStore | store  | 89  | 3 | 1 | 0 | none |
| app/utils/DateHelper | util   | 45  | 1 | 0 | 0 | none |
| app/mixins/Resizable | mixin  | 67  | 2 | 0 | 0 | none |

### Summary

- **Total modules:** N
- **Widgets:** N
- **Stores:** N
- **Mixins:** N
- **Utils:** N
- **Modules with deprecated APIs:** N (N%)
- **Total deprecated API calls:** N
- **Modules using dojox (extended/EOL):** N
```

---

## Notes

- If a file contains multiple `define(...)` calls, treat each as a separate module entry.
- If no `define(...)` is found in a `.js` file but `require(...)` is used at the top level, classify it as a **bootstrap/entry-point** and include it with type `entrypoint`.
- dojox modules are particularly high-risk — they are not part of the Dojo core and many have no Angular equivalent; always flag them.
