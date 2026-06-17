# Research Workflow Guide

_End-to-end guide for running the Legacy Dojo Analyzer and Migration Planner agents, using the supporting skills, and interpreting their output._

---

## Prerequisites

Before running the agents, ensure you have:

- **GitHub Copilot** enabled in your IDE (VS Code, JetBrains, or GitHub.com Copilot Chat).
- Access to the legacy Dojo application source code (local checkout or mounted directory).
- Basic familiarity with Dojo Toolkit module structure (`define`, `declare`, Dijit widgets).
- Node.js 18+ installed (for running Angular CLI in later phases).

---

## Overview: The Research Workflow

The research workflow consists of two phases:

```
Phase A: Discovery (understand the legacy codebase)
  ├── Step 1: Run dojo-inventory skill      → Module inventory table
  ├── Step 2: Run dependency-risk skill     → CVE + EOL flags
  ├── Step 3: Run component-analyzer skill  → Per-widget complexity scores
  ├── Step 4: Run test-gap-scanner skill    → Untested module list
  └── Step 5: Run legacy-analyzer agent     → Full assessment report

Phase B: Planning (produce a migration plan)
  └── Step 6: Run migration-planner agent   → Phased migration roadmap
```

The skills (Steps 1–4) are **building blocks** that feed data into the agents (Steps 5–6). You can run skills individually on specific files, or run the full agents to process the entire codebase.

---

## Step 1: Run the Dojo Inventory Skill

**Goal:** Get a bird's-eye view of all modules in the legacy codebase.

1. Open Copilot Chat in your IDE.
2. Paste the following (replacing the placeholder):

```
Read the skill definition at `skills/dojo-inventory/skill.md` and execute it.

directory: src/legacy/
namespace: app
```

3. Copilot will scan all `.js` and `.ts` files and output a Markdown table listing every module with its type, LOC, and deprecated API usage.

**What to look for:**
- Modules with type `widget` — these are your primary migration targets.
- Modules using `dojox/` — high-risk; flag for manual review.
- Modules with deprecated API counts > 3 — need extra attention in migration.

**Tip:** Save the output to `/tmp/dojo-inventory.md` for use in later steps.

---

## Step 2: Run the Dependency Risk Skill

**Goal:** Identify EOL dependencies and CVEs before planning migration.

1. In Copilot Chat, paste:

```
Read the skill definition at `skills/dependency-risk/skill.md` and execute it.

source: package.json
dojo-version: 1.14.2
```

2. If your project doesn't use npm (e.g., Dojo loaded via CDN or build profile), paste the AMD dependency list from the inventory output instead:

```
Read the skill definition at `skills/dependency-risk/skill.md` and execute it.

source: (paste dojo-inventory output here)
dojo-version: 1.14.2
```

**What to look for:**
- Any CVEs — address these immediately, regardless of migration timeline.
- `dojox/*` packages with "No equivalent" rating — these need architectural decisions.
- `dgrid` or `dojox/grid` — plan significant effort to replace these.

---

## Step 3: Run the Component Analyzer Skill

**Goal:** Score individual widgets for migration complexity.

Run this skill for each widget you want to assess in detail. Start with the largest or most business-critical widgets.

1. In Copilot Chat, paste:

```
Read the skill definition at `skills/component-analyzer/skill.md` and execute it.

file: src/widgets/UserForm.js
test-dir: tests/
```

2. Repeat for each widget of interest.

**What to look for:**
- Complexity score 4–5 (High/Critical) — allocate extra sprint capacity and plan a spike.
- `buildRendering` override — always flag for manual review.
- `widgetsInTemplate: true` with many nested widgets — complex to migrate in one step; consider splitting the widget.
- Missing test coverage on High/Critical widgets — write characterization tests **before** migration.

**Tip:** Create a spreadsheet with columns: Widget | Score | LOC | Has Tests | Notes. Fill it in as you run the analyzer.

---

## Step 4: Run the Test Gap Scanner Skill

**Goal:** Know your test coverage before committing to a migration timeline.

1. In Copilot Chat, paste:

```
Read the skill definition at `skills/test-gap-scanner/skill.md` and execute it.

source-dir: src/
test-dir: tests/
```

**What to look for:**
- Overall coverage percentage — if below 40%, add a "Test-First" sprint before migration.
- Priority 1 gaps (High-complexity widgets with no tests) — these are the highest-risk items.
- Util modules with no tests — these are the easiest to fix and a good confidence-builder for the team.

---

## Step 5: Run the Legacy Analyzer Agent (Full Report)

**Goal:** Produce a comprehensive, structured assessment report of the entire codebase.

This agent synthesizes the work of all four skills into a single authoritative document.

1. In Copilot Chat (or via Copilot Agents if available), paste:

```
You are the Legacy Dojo Analyzer agent defined in `agents/legacy-analyzer/agent.md`.

Analyze the Dojo codebase in `src/legacy/` and produce a legacy assessment report.
```

2. The agent will:
   - Enumerate all files.
   - Extract AMD module metadata.
   - Catalog Dijit widgets and their lifecycle methods.
   - Map the widget tree.
   - Flag deprecated APIs.
   - Detect global state.
   - Assess template complexity.
   - Check test coverage.

3. **Save the full output** to a file like `docs/legacy-assessment-report.md`. This document is the input to Step 6.

**Typical runtime:** For a codebase of 20–50 files, expect Copilot to take 2–5 minutes to process everything.

---

## Step 6: Run the Migration Planner Agent

**Goal:** Produce a phased, actionable migration roadmap.

1. In Copilot Chat, paste:

```
You are the Migration Planner agent defined in `agents/migration-planner/agent.md`.

Given the following legacy assessment report, produce a Dojo→Angular migration plan.

(paste the full content of docs/legacy-assessment-report.md here)
```

2. The agent will:
   - Classify each module by complexity (Low/Medium/High).
   - Recommend a migration strategy.
   - Map each Dojo artifact to its Angular equivalent.
   - Identify shared services.
   - Flag manual-intervention items.
   - Produce a phased roadmap with sprint-level tasks.

3. Save the output to `docs/migration-plan.md`.

---

## Step 7: Assess Individual Modules (Ongoing)

As migration proceeds, use the **assess-dojo-module** prompt for any module you're about to migrate:

1. Open `prompts/assess-dojo-module.md`.
2. Copy the prompt content.
3. Replace `{{path/to/DojoModule.js}}` with the actual file path.
4. Paste the full module source code where indicated.
5. Send to Copilot Chat.

This gives you a targeted assessment of a single module before you write any Angular code.

---

## Step 8: Convert Widgets to Angular Components

When you're ready to migrate a specific widget:

1. Open `prompts/widget-to-component.md`.
2. Copy the prompt content.
3. Replace `{{path/to/DojoWidget.js}}` with the actual widget path.
4. Paste the full widget source code where indicated.
5. Send to Copilot Chat.
6. Review each generated file carefully before saving it.

**Important:** Always read the "Migration Notes" section of the output. There will be `// TODO:` items that require manual work.

---

## Interpreting Agent Output

### Complexity Scores

| Score | Label | What to Do |
|-------|-------|-----------|
| 1–2 | Low/Trivial | Migrate as-is; one developer, one sprint |
| 3 | Medium | Review manually; may need 1 week; run assess-dojo-module first |
| 4 | High | Schedule a planning session; consider splitting the widget |
| 5 | Critical | Spike required; involve the team; may need 2+ sprints |

### Deprecated API Flags

Every deprecated API flag is a **migration debt item**. Do not ignore them — they indicate code patterns that have no direct Angular equivalent and require manual refactoring.

### "Manual Intervention Required" Items

These are blockers that Copilot cannot resolve automatically. Each one needs a **[DECISION REQUIRED]** ticket in your project tracker before migration can proceed.

---

## Example Walkthrough: The `UserProfileWidget`

Below is a fictional end-to-end example showing how the workflow applies to a single widget.

### The Widget (fictional)

```javascript
// src/widgets/UserProfile.js
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/topic',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/UserProfile.html',
  'app/stores/UserStore'
], function(declare, lang, on, topic, _WidgetBase, _TemplatedMixin, template, UserStore) {

  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    userId: null,
    _store: null,

    postCreate: function() {
      this.inherited(arguments);
      this._store = new UserStore();
      topic.subscribe('user/updated', lang.hitch(this, '_onUserUpdated'));
    },

    startup: function() {
      this.inherited(arguments);
      if (this.userId) {
        this._loadUser(this.userId);
      }
    },

    _loadUser: function(id) {
      this._store.get(id).then(lang.hitch(this, function(user) {
        this.nameNode.textContent = user.name;
        this.emailNode.textContent = user.email;
      }));
    },

    _onUserUpdated: function(data) {
      if (data.userId === this.userId) {
        this._loadUser(this.userId);
      }
    },

    destroy: function() {
      this._store = null;
      this.inherited(arguments);
    }
  });
});
```

### Running the Workflow

**Step 3 (Component Analyzer):** Score = **3/5 (Medium)**
- 52 code LOC (low)
- 8 dependencies, including `dojo/topic` (moderate)
- No deprecated API calls (clean)
- No test file found (+2)
- Template not shown but attach-points present

**Step 7 (Assess Module):** Key findings:
- Business function: displays a user's name and email; refreshes when a `user/updated` topic fires.
- Angular effort estimate: **M** (1–2 days)
- Suggested structure: `UserProfileComponent` with `@Input() userId`, injected `UserService`, and `EventBusService`.

**Step 8 (Widget → Component):** Generated files:

```typescript
// user-profile.component.ts (generated by Copilot)
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() userId: number | null = null;
  user: User | null = null;

  private _destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private eventBus: EventBusService
  ) {}

  ngOnInit(): void {
    this.eventBus.userUpdated$
      .pipe(
        filter(data => data.userId === this.userId),
        switchMap(() => this.userService.getUser(this.userId!)),
        takeUntil(this._destroy$)
      )
      .subscribe(user => (this.user = user));
  }

  ngAfterViewInit(): void {
    if (this.userId) {
      this.userService.getUser(this.userId)
        .pipe(takeUntil(this._destroy$))
        .subscribe(user => (this.user = user));
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
```

**Outcome:** A clean, testable Angular component that accurately mirrors the Dojo widget's behavior with zero deprecated APIs.

---

## Tips for a Successful Research Workflow

1. **Run Step 1 (inventory) first, always.** You can't plan what you haven't measured.
2. **Don't skip the dependency risk scan.** CVEs need immediate remediation, independent of migration.
3. **Write characterization tests before migrating anything with score ≥ 4.** These are your safety net.
4. **Use the Angular Mapping skill** (`skills/angular-mapping/skill.md`) whenever you're unsure how a specific Dojo pattern maps to Angular.
5. **Commit agent output files** to the repository — `docs/legacy-assessment-report.md` and `docs/migration-plan.md` are living documents that the team should review and update together.
6. **Re-run the inventory** after completing each migration phase to track progress.
