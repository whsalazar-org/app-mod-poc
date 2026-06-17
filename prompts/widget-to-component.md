# Prompt: Convert a Dojo Widget to an Angular Component

> **How to use:** Copy everything below the horizontal rule and paste it into GitHub Copilot Chat. Replace the `{{placeholders}}` with real values before sending. Paste the full content of the Dojo widget file when prompted.

---

I need to convert a Dojo Toolkit widget to an Angular 17 standalone component. Please follow all of the steps below in order.

**Dojo widget file:** `{{path/to/DojoWidget.js}}`

Here is the full content of the widget:

```javascript
{{paste the full Dojo widget file content here}}
```

---

## Step 1: Understand the Widget

Before writing any Angular code, briefly summarize:
- What this widget does functionally (2–3 sentences)
- Its Dojo superclass chain (e.g., `_WidgetBase → _TemplatedMixin → MyWidget`)
- The lifecycle methods it implements (`postCreate`, `startup`, etc.)
- Any notable Dojo-specific patterns used (topic pub/sub, aspect, deferred, etc.)

---

## Step 2: Create the Angular Component Shell

Generate the Angular component skeleton using `@Component` decorator:

```typescript
// user-form.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-{{component-name}}',        // derive from Dojo widget class name
  standalone: true,
  imports: [/* list all needed Angular Material and common modules */],
  templateUrl: './{{component-name}}.component.html',
  styleUrls: ['./{{component-name}}.component.scss']
})
export class {{ComponentName}}Component implements OnInit, AfterViewInit, OnDestroy {
  // ... properties to be filled in Step 3
}
```

**Rules:**
- Use `standalone: true` — do not use `NgModule`.
- Derive the `selector` from the Dojo widget's class name in kebab-case (e.g., `UserForm` → `app-user-form`).
- List all Angular Material imports needed in the `imports` array.
- Implement `OnInit`, `AfterViewInit`, and `OnDestroy` if the widget has `postCreate`, `startup`, and `destroy` respectively.

---

## Step 3: Migrate Properties and Constructor

Convert the Dojo widget's prototype properties to TypeScript class properties:

**Conversion rules:**
- Dojo prototype `string` defaults → TypeScript `string` with `= ''`
- Dojo prototype `number` defaults → TypeScript `number` with `= 0`
- Dojo prototype `boolean` defaults → TypeScript `boolean` with `= false`
- Dojo prototype `null` defaults → TypeScript with appropriate type and `= null` or make optional (`?`)
- `data-dojo-attach-point` references → `@ViewChild()` or `@ViewChildren()` decorators
- Constructor params (dijit `params` object pattern) → Angular `@Input()` properties

For each converted property, add a TypeScript type annotation.

---

## Step 4: Migrate the HTML Template

Convert the widget's `templateString` HTML to Angular template syntax:

**Conversion rules:**
| Dojo Template Pattern | Angular Equivalent |
|----------------------|--------------------|
| `data-dojo-attach-point="myNode"` | Remove attribute; add `#myRef` template ref if needed, or use `@ViewChild` |
| `data-dojo-attach-event="click:_onClick"` | Replace with `(click)="_onClick($event)"` |
| `data-dojo-type="dijit/form/Button"` | Replace with `<mat-button>` or appropriate Angular Material component |
| `${this.someProperty}` (template substitution) | `{{ someProperty }}` |
| `dojoType="..."` | Replace with Angular component selector |
| Conditional rendering via JS in `postCreate` | `*ngIf="condition"` |
| List rendering via `forEach` in JS | `*ngFor="let item of items"` |
| `style="${this.height}px"` | `[style.height.px]="height"` |
| `class="${this.activeClass}"` | `[class]="activeClass"` or `[ngClass]="classObject"` |

Produce the complete Angular template file.

---

## Step 5: Migrate Lifecycle Methods

Convert each Dojo lifecycle method to its Angular equivalent:

| Dojo Method | Angular Equivalent | Notes |
|-------------|-------------------|-------|
| `constructor(params, srcNodeRef)` | `constructor(private myService: MyService)` | Use Angular DI; remove `srcNodeRef` |
| `postMixInProperties()` | Property initializers or `ngOnChanges()` | Runs before render; map to `ngOnChanges` if reactive to `@Input` |
| `buildRendering()` | **Remove** (Angular handles rendering) | If complex DOM logic: move to template with directives |
| `postCreate()` | `ngOnInit()` | Initial setup after inputs are set |
| `startup()` | `ngAfterViewInit()` | Setup that requires DOM/child components to exist |
| `resize()` | `ngAfterViewChecked()` or `ResizeObserver` | Consider Angular CDK `BreakpointObserver` |
| `destroy()` | `ngOnDestroy()` | Unsubscribe from all Observables; complete Subjects |
| `destroyRecursive()` | `ngOnDestroy()` | Angular handles child component destruction automatically |
| `this.inherited(arguments)` | `super.methodName()` | Call the TypeScript superclass method |

For each method, produce the complete TypeScript implementation.

---

## Step 6: Migrate Event Handling

Convert Dojo event patterns to Angular:

**`dojo/on` → Angular event bindings:**
```typescript
// Before (Dojo)
on(this.submitBtn, 'click', lang.hitch(this, '_onSubmit'));

// After (Angular) — in template
// <button mat-button (click)="_onSubmit($event)">Submit</button>
// No programmatic event wiring needed
```

**`dojo/topic` → RxJS Subject:**
```typescript
// Before (Dojo)
topic.publish('user/login', { userId: 123 });
topic.subscribe('user/login', this._onUserLogin.bind(this));

// After (Angular)
// In EventBusService:
// private loginSubject = new Subject<{ userId: number }>();
// login$ = this.loginSubject.asObservable();
// publish(data) { this.loginSubject.next(data); }

// In component:
this.eventBus.login$.pipe(takeUntil(this._destroy$)).subscribe(data => this._onUserLogin(data));
```

**`dojo/aspect` → RxJS operators or lifecycle hooks:**
```typescript
// Before (Dojo)
aspect.after(store, 'put', function(result) { self._refresh(); });

// After (Angular)
// Override in service class or use RxJS tap() operator in the pipeline
```

**Rule:** Add a `private _destroy$ = new Subject<void>()` property and use `takeUntil(this._destroy$)` on all subscriptions. Complete it in `ngOnDestroy()`.

---

## Step 7: Migrate Data Access

If the widget directly uses a Dojo store or `dojo/request`, migrate to Angular services:

**`dojo/store/JsonRest` → Angular service with HttpClient:**
```typescript
// Before (Dojo — in widget)
var store = new JsonRest({ target: '/api/users' });
store.query({ active: true }).then(function(users) { self._renderUsers(users); });

// After (Angular)
// Inject UserService and call:
this.userService.getActiveUsers()
  .pipe(takeUntil(this._destroy$))
  .subscribe(users => this._renderUsers(users));
```

**`dojo/store/Memory` → In-memory Angular service:**
```typescript
// Before (Dojo)
var cache = new Memory({ data: initialData });

// After (Angular)
// private _data$ = new BehaviorSubject<User[]>(initialData);
// data$ = this._data$.asObservable();
```

---

## Step 8: Generate the Complete Angular Files

Produce the following complete files:

1. **`{{component-name}}.component.ts`** — Full TypeScript component class
2. **`{{component-name}}.component.html`** — Full Angular template
3. **`{{component-name}}.component.scss`** — Styles (migrate any inline styles from the Dojo template; use Angular Material theming variables where possible)
4. **`{{component-name}}.component.spec.ts`** — Unit test file with:
   - A `TestBed` setup using `@testing-library/angular`'s `render()`
   - At least 3 test cases: renders correctly, handles primary user interaction, cleans up subscriptions on destroy
   - Mocked Angular services (use `jest.fn()` or `jasmine.createSpyObj`)

---

## Step 9: Migration Notes

After producing the files, list:

1. **Any Dojo behavior that could not be automatically translated** — describe what must be done manually.
2. **Any `// TODO:` comments you added** — explain what each one requires.
3. **Required npm packages** — list all new packages with install commands.
4. **Potential behavioral differences** — anything that works slightly differently in Angular.
5. **[DECISION REQUIRED] items** — anything that needs a product or architecture decision before it can be completed.
