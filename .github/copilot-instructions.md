# GitHub Copilot Instructions — app-mod-poc

## Purpose

This repository is a proof-of-concept for using **GitHub Copilot** to modernize a **legacy Dojo Toolkit** application by migrating it to **Angular**. It contains reusable agents, skills, prompts, and documentation that guide developers and Copilot through a structured, incremental migration workflow.

---

## Legacy Stack

The application being migrated is built on:

| Technology | Details |
|---|---|
| **Dojo Toolkit** | Version 1.x (AMD-based) |
| **Module system** | AMD (`define([...], function(...) {})` / `require([...], function(...) {})`) |
| **Widgets** | Dijit (`dijit/_WidgetBase`, `dijit/_TemplatedMixin`, `dijit/_OnDijitClickMixin`) |
| **Data layer** | `dojo/store/Memory`, `dojo/store/JsonRest`, `dojo/data` (legacy) |
| **HTTP** | `dojo/request`, `dojo/request/xhr` |
| **DOM manipulation** | `dojo/dom`, `dojo/dom-construct`, `dojo/dom-style`, `dojo/dom-class` |
| **Events** | `dojo/on`, `dojo/topic`, `dojo/aspect` |
| **OOP** | `dojo/_base/declare` |
| **Utilities** | `dojo/_base/lang`, `dojo/_base/array`, `dojo/string`, `dojo/date` |
| **Templating** | Dijit HTML templates with `data-dojo-attach-point` and `data-dojo-attach-event` |
| **Build** | Dojo build system (profiles, layers) |

---

## Target Stack

The migration target is:

| Technology | Details |
|---|---|
| **Framework** | Angular 17+ (standalone components preferred) |
| **Language** | TypeScript 5+ |
| **Reactive layer** | RxJS 7+ |
| **UI components** | Angular Material 17+ |
| **State management** | NgRx (optional, for complex shared state) |
| **HTTP** | `HttpClient` (from `@angular/common/http`) |
| **Testing** | Jest (unit), Angular Testing Library or Cypress (E2E) |
| **Build** | Angular CLI / Vite |

---

## Agent and Skill Conventions

When operating as an agent or executing a skill defined in this repository, Copilot should:

1. **Follow the skill's Steps exactly** in the order given; do not skip steps.
2. **Produce structured output** matching the Output Format described in each skill/agent.
3. **Use concrete file paths** — never generic placeholders like `<file>` without resolving them first.
4. **Flag deprecated Dojo APIs** (e.g., `dojo.connect`, `dojo.byId`, `dojo._base.*` globals) whenever encountered.
5. **Prefer incremental migration** — recommend a strangler-fig or module-by-module approach rather than big-bang rewrites.
6. **Map Dojo concepts to Angular equivalents** using the mappings in `docs/dojo-to-angular-cheatsheet.md`.
7. **Do not invent Angular APIs** — use only documented Angular 17+ APIs.
8. **Highlight manual-intervention items** clearly (security-sensitive code, complex lifecycle hooks, third-party Dojo plugins without Angular equivalents).
9. **Include code examples** whenever mapping a Dojo API to its Angular equivalent.
10. **Keep migration complexity scores honest** — base them on objective measures (LOC, dependency count, deprecated API usage, test presence).

---

## File Layout

```
.github/
  copilot-instructions.md       ← This file
agents/
  legacy-analyzer/agent.md      ← Deep Dojo codebase analysis agent
  migration-planner/agent.md    ← Produces phased migration roadmap
skills/
  dojo-inventory/skill.md       ← Catalog all Dojo modules in a directory
  angular-mapping/skill.md      ← Map Dojo concept → Angular equivalent
  dependency-risk/skill.md      ← Flag risky/EOL Dojo dependencies
  component-analyzer/skill.md   ← Score a widget's migration complexity
  test-gap-scanner/skill.md     ← Find untested Dojo code paths
prompts/
  assess-dojo-module.md         ← Reusable prompt: assess one module
  migration-report-template.md  ← Output template for migration reports
  widget-to-component.md        ← Prompt: convert Dojo widget → Angular component
docs/
  research-workflow.md          ← End-to-end guide for running the agents
  dojo-to-angular-cheatsheet.md ← Quick reference: Dojo API → Angular mappings
```

---

## How to Use This Repo with Copilot Chat

1. Open Copilot Chat in your IDE.
2. Reference a skill file with `@workspace /skills/<name>/skill.md` to activate that skill.
3. Invoke an agent by pasting the agent's `agent.md` content as a system prompt or using the Copilot Agents feature.
4. Use prompts in `prompts/` as ready-made Copilot Chat messages — paste them directly and fill in the `{{placeholders}}`.
5. Refer to `docs/research-workflow.md` for a step-by-step walkthrough.
