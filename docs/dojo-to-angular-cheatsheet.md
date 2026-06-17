# Dojo → Angular Cheatsheet

_Quick reference for mapping Dojo Toolkit 1.x APIs to their Angular 17+ equivalents._

---

## Module System

### AMD `define` / `require` → TypeScript ES Modules

**Before (Dojo AMD):**
```javascript
define([
  'dojo/_base/declare',
  'dojo/on',
  'app/services/UserService'
], function(declare, on, UserService) {

  return declare(null, {
    _service: null,

    postCreate: function() {
      this._service = new UserService();
    }
  });
});
```

**After (Angular TypeScript):**
```typescript
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({ selector: 'app-my', standalone: true, template: '' })
export class MyComponent implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // equivalent to postCreate
  }
}
```

---

## Object-Oriented Patterns

### `dojo/_base/declare` → TypeScript `class extends`

**Before (Dojo):**
```javascript
define(['dojo/_base/declare', 'app/base/BaseWidget'], function(declare, BaseWidget) {
  return declare(BaseWidget, {
    label: 'Default',
    getValue: function() {
      return this.label;
    }
  });
});
```

**After (Angular TypeScript):**
```typescript
export class MyComponent extends BaseComponent {
  label: string = 'Default';

  getValue(): string {
    return this.label;
  }
}
```

### Multiple Inheritance (Dojo mixins) → TypeScript `implements` + composition

**Before (Dojo):**
```javascript
return declare([_WidgetBase, _TemplatedMixin, _DisabledMixin], { ... });
```

**After (Angular):**
```typescript
// Use directive composition or abstract classes
// _TemplatedMixin → Angular template (built-in)
// _DisabledMixin → Angular directive or abstract base class

@Component({ standalone: true, ... })
export class MyComponent extends BaseComponent implements DisabledBehavior {
  // implement DisabledBehavior interface methods
}
```

### `this.inherited(arguments)` → `super.methodName()`

**Before (Dojo):**
```javascript
postCreate: function() {
  this.inherited(arguments); // calls superclass postCreate
  this._init();
}
```

**After (Angular):**
```typescript
ngOnInit(): void {
  super.ngOnInit?.(); // call superclass if it exists
  this._init();
}
```

---

## HTTP / Data Fetching

### `dojo/request` → `HttpClient`

**Before (Dojo):**
```javascript
define(['dojo/request'], function(request) {
  request('/api/users', {
    method: 'GET',
    handleAs: 'json'
  }).then(function(data) {
    console.log(data);
  }).catch(function(err) {
    console.error(err);
  });
});
```

**After (Angular):**
```typescript
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

const http = inject(HttpClient);

http.get<User[]>('/api/users').subscribe({
  next: data => console.log(data),
  error: err => console.error(err)
});
```

### `dojo/store/JsonRest` → Angular service with `HttpClient`

**Before (Dojo):**
```javascript
define(['dojo/store/JsonRest'], function(JsonRest) {
  var store = new JsonRest({ target: '/api/users/' });

  // Fetch all
  store.query({ active: true }).then(function(users) { ... });

  // Get by ID
  store.get(42).then(function(user) { ... });

  // Create
  store.add({ name: 'Alice', email: 'alice@example.com' });

  // Update
  store.put({ id: 42, name: 'Alice Updated' });

  // Delete
  store.remove(42);
});
```

**After (Angular):**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  query(filters: { active?: boolean } = {}): Observable<User[]> {
    const params = new HttpParams({ fromObject: filters as Record<string, string> });
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  add(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  put(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### `dojo/store/Memory` → Angular service with in-memory array + `BehaviorSubject`

**Before (Dojo):**
```javascript
define(['dojo/store/Memory'], function(Memory) {
  var store = new Memory({ data: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]});

  store.query({ name: 'Alice' }); // returns filtered array
  store.put({ id: 1, name: 'Alice Smith' });
});
```

**After (Angular):**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserCacheService {
  private _data$ = new BehaviorSubject<User[]>([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);

  readonly data$ = this._data$.asObservable();

  query(predicate: (u: User) => boolean): Observable<User[]> {
    return this.data$.pipe(map(items => items.filter(predicate)));
  }

  put(updated: User): void {
    const current = this._data$.getValue();
    const index = current.findIndex(u => u.id === updated.id);
    if (index > -1) {
      const next = [...current];
      next[index] = updated;
      this._data$.next(next);
    }
  }
}
```

---

## Events

### `dojo/on` → Angular event bindings + RxJS `fromEvent`

**Before (Dojo):**
```javascript
define(['dojo/on'], function(on) {
  // DOM event listener
  var handle = on(buttonNode, 'click', function(event) {
    console.log('clicked', event);
  });

  // Remove listener
  handle.remove();
});
```

**After (Angular) — template binding:**
```html
<!-- user-form.component.html -->
<button (click)="onButtonClick($event)">Click Me</button>
```
```typescript
// user-form.component.ts
onButtonClick(event: MouseEvent): void {
  console.log('clicked', event);
}
```

**After (Angular) — programmatic with RxJS:**
```typescript
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// In ngAfterViewInit:
fromEvent(this.buttonRef.nativeElement, 'click')
  .pipe(takeUntil(this._destroy$))
  .subscribe(event => console.log('clicked', event));
```

### `dojo/topic` → RxJS `Subject` / `BehaviorSubject`

**Before (Dojo):**
```javascript
define(['dojo/topic'], function(topic) {
  // Publish an event
  topic.publish('user/login', { userId: 42, role: 'admin' });

  // Subscribe to an event
  var handle = topic.subscribe('user/login', function(data) {
    console.log('User logged in:', data.userId);
  });

  // Unsubscribe
  handle.remove();
});
```

**After (Angular):**
```typescript
// event-bus.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface UserLoginEvent { userId: number; role: string; }

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private _userLogin$ = new Subject<UserLoginEvent>();
  readonly userLogin$ = this._userLogin$.asObservable();

  publishUserLogin(data: UserLoginEvent): void {
    this._userLogin$.next(data);
  }
}

// In publisher component:
this.eventBus.publishUserLogin({ userId: 42, role: 'admin' });

// In subscriber component:
this.eventBus.userLogin$
  .pipe(takeUntil(this._destroy$))
  .subscribe(data => console.log('User logged in:', data.userId));
```

### `dojo/aspect` → RxJS operators / Angular lifecycle hooks

**Before (Dojo):**
```javascript
define(['dojo/aspect'], function(aspect) {
  // Run after a method
  aspect.after(store, 'put', function(result) {
    cache.clear();
    return result; // must return for after-advice
  });

  // Run before a method
  aspect.before(store, 'remove', function(id) {
    console.log('About to remove:', id);
  });
});
```

**After (Angular):**
```typescript
// Override the method in a service subclass or use RxJS tap():
put(item: Item): Observable<Item> {
  return this.http.put<Item>(`/api/items/${item.id}`, item).pipe(
    tap(() => this.cache.clear()) // "after" advice
  );
}

// For "before" advice:
remove(id: number): Observable<void> {
  console.log('About to remove:', id); // before advice
  return this.http.delete<void>(`/api/items/${id}`);
}
```

---

## DOM Manipulation

### `dojo/dom-construct` → Angular template + `*ngIf` / `*ngFor`

**Before (Dojo):**
```javascript
define(['dojo/dom-construct'], function(domConstruct) {
  // Create and append
  var div = domConstruct.create('div', {
    'class': 'user-card',
    innerHTML: '<span>' + user.name + '</span>'
  }, containerNode, 'last');

  // Conditional element
  if (user.isAdmin) {
    domConstruct.create('span', { innerHTML: 'Admin' }, headerNode);
  }

  // Destroy
  domConstruct.destroy(div);
});
```

**After (Angular):**
```html
<!-- user-list.component.html -->
<div class="user-card" *ngFor="let user of users">
  <span>{{ user.name }}</span>
  <span *ngIf="user.isAdmin">Admin</span>
</div>
```

### `dojo/dom-style` → Angular style bindings

**Before (Dojo):**
```javascript
define(['dojo/dom-style'], function(domStyle) {
  domStyle.set(node, 'display', 'none');
  domStyle.set(node, { width: '200px', height: '100px' });
  var width = domStyle.get(node, 'width');
});
```

**After (Angular):**
```html
<div [style.display]="isVisible ? 'block' : 'none'">...</div>
<div [style.width.px]="200" [style.height.px]="100">...</div>
<!-- Or use ngStyle for multiple: -->
<div [ngStyle]="{ width: '200px', height: '100px' }">...</div>
```

### `dojo/dom-class` → Angular class bindings

**Before (Dojo):**
```javascript
define(['dojo/dom-class'], function(domClass) {
  domClass.add(node, 'active');
  domClass.remove(node, 'loading');
  domClass.toggle(node, 'selected');
});
```

**After (Angular):**
```html
<div [class.active]="isActive" [class.loading]="isLoading" [class.selected]="isSelected">
</div>
<!-- Or with ngClass for conditional objects: -->
<div [ngClass]="{ active: isActive, loading: isLoading }"></div>
```

---

## Dijit Widgets → Angular Material Components

### `dijit/_WidgetBase` → `@Component`

**Before (Dojo):**
```javascript
define(['dojo/_base/declare', 'dijit/_WidgetBase'], function(declare, _WidgetBase) {
  return declare(_WidgetBase, {
    // widget implementation
  });
});
```

**After (Angular):**
```typescript
@Component({
  selector: 'app-my-widget',
  standalone: true,
  template: `<!-- template here -->`,
})
export class MyWidgetComponent {}
```

### `dijit/_TemplatedMixin` → Angular component template

**Before (Dojo):**
```javascript
define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/MyWidget.html'
], function(declare, _WidgetBase, _TemplatedMixin, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    // attach-points become `this.myNode` automatically
  });
});
```

**After (Angular):**
```typescript
// template is now in .component.html file
// data-dojo-attach-point="myNode" → @ViewChild('myRef') myRef!: ElementRef
// data-dojo-attach-event="click:_onClick" → (click)="_onClick($event)"

@Component({
  selector: 'app-my-widget',
  standalone: true,
  templateUrl: './my-widget.component.html',
})
export class MyWidgetComponent {
  @ViewChild('myRef') myRef!: ElementRef;
}
```

### Common Dijit → Angular Material Mappings

| Dijit Widget | Angular Material Component | Import |
|-------------|---------------------------|--------|
| `dijit/form/Button` | `<button mat-button>` / `<button mat-raised-button>` | `MatButtonModule` |
| `dijit/form/TextBox` | `<mat-form-field><input matInput></mat-form-field>` | `MatInputModule` |
| `dijit/form/ValidationTextBox` | `<mat-form-field>` + `Validators` | `MatInputModule`, `ReactiveFormsModule` |
| `dijit/form/Select` | `<mat-select>` | `MatSelectModule` |
| `dijit/form/ComboBox` | `<mat-autocomplete>` | `MatAutocompleteModule` |
| `dijit/form/CheckBox` | `<mat-checkbox>` | `MatCheckboxModule` |
| `dijit/form/RadioButton` | `<mat-radio-button>` | `MatRadioModule` |
| `dijit/form/DateTextBox` | `<mat-datepicker>` | `MatDatepickerModule` |
| `dijit/form/Slider` | `<mat-slider>` | `MatSliderModule` |
| `dijit/form/Textarea` | `<mat-form-field><textarea matInput>` | `MatInputModule` |
| `dijit/Dialog` | `MatDialog` service + `MatDialogModule` | `MatDialogModule` |
| `dijit/Tooltip` | `matTooltip` directive | `MatTooltipModule` |
| `dijit/Menu` / `dijit/MenuItem` | `<mat-menu>` / `<button mat-menu-item>` | `MatMenuModule` |
| `dijit/layout/TabContainer` | `<mat-tab-group>` | `MatTabsModule` |
| `dijit/layout/BorderContainer` | CSS Grid / Angular Flex Layout | N/A |
| `dijit/layout/ContentPane` | `<router-outlet>` or `<ng-content>` | RouterModule |
| `dijit/layout/AccordionContainer` | `<mat-expansion-panel>` | `MatExpansionModule` |
| `dijit/ProgressBar` | `<mat-progress-bar>` | `MatProgressBarModule` |
| `dijit/tree/Tree` | `<mat-tree>` | `MatTreeModule` |

---

## Async Patterns

### `dojo/Deferred` → `Promise` / RxJS `Observable`

**Before (Dojo):**
```javascript
define(['dojo/Deferred'], function(Deferred) {
  function fetchData() {
    var deferred = new Deferred();
    setTimeout(function() {
      deferred.resolve({ data: 'result' });
      // or: deferred.reject(new Error('failed'));
    }, 1000);
    return deferred.promise;
  }

  fetchData().then(function(result) {
    console.log(result.data);
  });
});
```

**After (Angular) — with Promise:**
```typescript
function fetchData(): Promise<{ data: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ data: 'result' }), 1000);
  });
}

fetchData().then(result => console.log(result.data));
```

**After (Angular) — with RxJS Observable (preferred):**
```typescript
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

function fetchData(): Observable<{ data: string }> {
  return timer(1000).pipe(map(() => ({ data: 'result' })));
}

fetchData().pipe(takeUntil(this._destroy$)).subscribe(result => console.log(result.data));
```

### `dojo/promise/all` → `Promise.all` / RxJS `forkJoin`

**Before (Dojo):**
```javascript
define(['dojo/promise/all'], function(all) {
  all([fetchUsers(), fetchRoles()]).then(function(results) {
    var users = results[0], roles = results[1];
  });
});
```

**After (Angular):**
```typescript
import { forkJoin } from 'rxjs';

forkJoin([this.userService.getUsers(), this.roleService.getRoles()])
  .pipe(takeUntil(this._destroy$))
  .subscribe(([users, roles]) => {
    // use users and roles
  });
```

---

## Widget Lifecycle

| Dojo Lifecycle Method | Angular Equivalent | Notes |
|----------------------|--------------------|-------|
| `constructor(params, srcNodeRef)` | `constructor(private svc: MyService)` | Use Angular DI; no `srcNodeRef` |
| `postMixInProperties()` | Property initializers / `ngOnChanges()` | Fires before DOM creation |
| `buildRendering()` | Angular template (automatic) | Only override if custom DOM required; use structural directives instead |
| `postCreate()` | `ngOnInit()` | After inputs bound; main setup goes here |
| `startup()` | `ngAfterViewInit()` | After child components rendered |
| `resize()` | `ngAfterViewChecked()` or `ResizeObserver` | See Angular CDK `BreakpointObserver` |
| `destroy()` | `ngOnDestroy()` | Unsubscribe Observables; complete Subjects |
| `destroyRecursive()` | `ngOnDestroy()` | Angular auto-destroys child components |
| `this.inherited(arguments)` | `super.method()` | TypeScript standard super call |

---

## Template Syntax

| Dojo Template Attribute | Angular Equivalent |
|------------------------|-------------------|
| `data-dojo-attach-point="btnNode"` | `#btnNode` (template ref) + `@ViewChild('btnNode')` |
| `data-dojo-attach-event="click:_onClick"` | `(click)="_onClick($event)"` |
| `data-dojo-type="dijit/form/Button"` | Replace with `<button mat-button>` |
| `${this.label}` (string substitution) | `{{ label }}` |
| `dojoType="dijit/layout/TabContainer"` | `<mat-tab-group>` |

---

## Routing

### `dojo/router` → Angular Router

**Before (Dojo):**
```javascript
define(['dojo/router'], function(router) {
  router.register('/users/:id', function(event) {
    var userId = event.params.id;
    // render UserProfile widget
  });
  router.startup();
});
```

**After (Angular):**
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'users/:id', component: UserProfileComponent }
];

// In app.config.ts:
provideRouter(routes)

// In component:
import { ActivatedRoute } from '@angular/router';
// constructor(private route: ActivatedRoute) {}
// this.route.params.subscribe(p => this.userId = +p['id']);
```

---

## NgRx Store (optional, for complex shared state)

### `dojo/store` (shared global state) → NgRx

Use NgRx only when multiple components share complex state with cross-cutting concerns. For simple cases, a `BehaviorSubject`-based service is sufficient.

**Before (Dojo):**
```javascript
// Shared global store pattern
define(['dojo/store/Memory', 'dojo/topic'], function(Memory, topic) {
  var appStore = new Memory({ data: [] });

  function updateUsers(users) {
    users.forEach(function(u) { appStore.put(u); });
    topic.publish('store/users/changed', appStore.query());
  }
});
```

**After (Angular with NgRx):**
```typescript
// users.actions.ts
export const loadUsers = createAction('[Users] Load');
export const loadUsersSuccess = createAction('[Users] Load Success',
  props<{ users: User[] }>());

// users.reducer.ts
export const usersReducer = createReducer(initialState,
  on(loadUsersSuccess, (state, { users }) => ({ ...state, users }))
);

// In component:
this.store.dispatch(loadUsers());
this.users$ = this.store.select(selectAllUsers);
```

---

## Quick Install Reference

```bash
# Angular core (via CLI)
npm install -g @angular/cli
ng new my-app --standalone --routing --style=scss

# Angular Material
ng add @angular/material

# RxJS (included with Angular, but for reference)
npm install rxjs

# NgRx (optional)
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools

# Testing
npm install --save-dev jest @types/jest @testing-library/angular @testing-library/jest-dom

# Chart replacement for dojox/charting
npm install echarts ngx-echarts

# Rich text replacement
npm install ngx-quill quill
```
