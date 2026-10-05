# Angular Component APIs: Native Semantics and Consumer Contracts

## Design from consumer tasks

Welcome to the component API lesson. Our four questions concern a button that saves twice, an input wrapper that hides native capabilities, a card with too much configuration, and a checkbox that violates the forms contract. They share a root concern: a shared component should make the supported task clear and preserve the behavior consumers reasonably expect.

## Design from consumer tasks · 2

Begin with a representative consumer template. What does the team bind, which events do they handle, and where does state live? Then examine the actual host element and any internal native element. A label, a disabled attribute, or an identifier on a wrapper does not automatically reach the internal control. An API that appears convenient can force dozens of forwarding inputs as soon as another team needs a native capability.

## Design from consumer tasks · 3

A senior answer considers the interface as well as individual bugs. Explain the smallest useful contract, show how to use it, identify unsupported combinations, and describe the migration from today's behavior. Compatibility includes native events, form state, projected content, styling hooks, and test APIs, not just exported TypeScript names.

## Inputs express allowed states

Use input types that express supported values. A string input for button kind accepts values the stylesheet cannot represent. A union of primary, secondary, and danger tells the compiler and editor what is supported. Defaults should be intentional, and required inputs should be reserved for values without which the component cannot function meaningfully.

## Inputs express allowed states · 2

Boolean attributes need careful handling. In HTML, disabled with no value expresses presence. A plain string read as an empty value is falsy in JavaScript, which can make an apparently disabled wrapper remain clickable. Angular's booleanAttribute transform gives predictable attribute-style coercion. Explain which values it accepts and test both static attributes and bound booleans.

## Inputs express allowed states · 3

Inputs are data coming from the consumer. Avoid silently copying them into an unrelated local field that only initializes once. If the value is derived, use a derivation. If the child commits local state, a model can express a two-way contract. If the parent must approve a proposed change, keep a controlled input and emit a request rather than committing first. The signals lesson develops that distinction in depth.

## Native events and component outputs

A native click bubbles from an internal button through the component host. If a component also emits an output called click, a consumer can receive an unexpected second notification. Before inventing an event, ask whether the native event already expresses the action. Ordinary button activation usually needs no custom click output.

## Native events and component outputs · 2

Reserve component outputs for domain transitions that are not already represented by native events. A selected value change or a dismissal request can be useful. Avoid names that collide with native events such as input, change, focus, blur, or keydown unless the component intentionally documents that contract and its interaction with bubbling. A lint rule can enforce the library's event naming policy.

## Native events and component outputs · 3

Do not distinguish keyboard and pointer activation by guessing from an event detail without considering assistive technology. Consumers may legitimately need a native MouseEvent or KeyboardEvent for specialized behavior, but business logic should ordinarily respond to activation independently of the device. Keep telemetry requirements separate from whether the action succeeds. Test one activation produces one consumer action, and test disabled behavior through the real native control.

## The native host can be the API

An attribute directive on a native input can style and enhance it while retaining autocomplete, inputmode, maxlength, name, id, validation, browser autofill, labels, and forms integration. Consumers do not need a wrapper to forward every property. A component with an attribute selector can also enhance a native element when a template is needed.

## The native host can be the API · 2

A wrapper can still be appropriate for a genuinely composite control, an overlay-based picker, or a widget whose focusable element needs coordinated internal structure. The trade-off should be explicit. If the wrapper hides the native element, it needs a clear forwarding and focus contract. A request for twenty-three new inputs often signals that the abstraction boundary is in the wrong place rather than that twenty-three more inputs are needed.

## The native host can be the API · 3

Shared behavior can be factored through directives and the directive composition API. Inputs and outputs from host directives are exposed explicitly, and composition is established statically. This helps reuse focus or disabled logic, but it cannot automatically forward every arbitrary native attribute into a hidden descendant. Choose the host element first, then use composition to share behavior at that boundary.

## Composition for rich content

A card with separate inputs for every badge, action, heading, image, and body style accumulates combinations the library must maintain. Content projection lets consumers supply real HTML and application components within documented slots. The library owns layout and style while the application owns content, heading level, links, and business actions.

## Composition for rich content · 2

Projection preserves Angular bindings and native semantics better than passing an HTML string. Angular sanitization helps protect unsafe bindings, but sanitization does not turn arbitrary innerHTML into a well-designed content API. A body string cannot conveniently carry application directives or typed interactions. Make image alternatives and headings explicit consumer responsibilities when the content is projected.

## Composition for rich content · 3

Configuration remains valuable for uniform repeated data. A table's column definitions are naturally data driven, and a menu can often be generated from a typed item model. Offer template customization at the points where the structure truly varies. Avoid replacing every configuration object with dozens of unstructured slots; explain the consistency versus flexibility trade-off.

## Forms have two data directions

A ControlValueAccessor adapts a custom control to Angular Forms. The forms model calls writeValue to update the view. The component calls the registered onChange callback after a user change to update the forms model. These are opposite directions. Calling onChange from writeValue creates a feedback path and can mark a programmatic reset as a user edit.

## Forms have two data directions · 2

The registered onTouched callback reports the appropriate touch interaction, commonly blur for a single input. The disabled-state hook must update the actual interactive element. Signals or markForCheck make model-to-view updates observable under OnPush and zoneless change detection. Normalize null when reset can supply it, and document whether a checkbox supports an indeterminate state separately from its value.

## Forms have two data directions · 3

Test through a real FormControl host. A programmatic value write should update the view while the form stays pristine. A user change should update the value and dirty state. Blur should make it touched. Disabling the control should prevent user interaction. These tests verify the contract; a test that only invokes toggle on the component misses the connection to the forms engine.

## Signal forms are a separate integration contract

Reactive forms use ControlValueAccessor. Signal-based forms have their own custom-control interfaces and bindings. Do not assume that a value accessor automatically implements every signal-forms capability. Check the API for the supported Angular version and choose the integration explicitly.

## Signal forms are a separate integration contract · 2

For a value control, the signal-forms interface exposes a writable model value with supported state inputs. Checkbox-like controls use the corresponding checked control contract. The form field binding coordinates the form model with that control. Disabled, readonly, touched, validation, and accessibility state need to remain coherent. If the library supports both forms systems, document and test each integration rather than forcing them to write the same state through two competing paths.

## Signal forms are a separate integration contract · 3

Version support matters because these interfaces can differ across Angular releases. Our complete examples use the installed framework version. A library claiming support for older majors must test its public interfaces against those majors. This is a compatibility claim, not something a successful build on one version can prove.

## Migrate with examples and compatibility tests

Removing an output can change what an existing consumer receives. Adding a union can reject values that compiled yesterday. Moving a wrapper to a native attribute selector changes the template. These improvements need a release and migration strategy. Inventory current usage, publish the preferred API, retain compatibility where practical, and give teams a clear removal window.

## Migrate with examples and compatibility tests · 2

Document the consumer-facing form in examples that compile. Show native events, labels, forms binding, projected slots, and disabled behavior. A component harness should expose meaningful tasks instead of internal classes so a markup refactor does not break every product's tests. Treat that harness as a supported API with its own compatibility obligations.

## Migrate with examples and compatibility tests · 3

During the questions, trace a reported bug from the consumer template to the actual element or callback. Identify whether the problem is coercion, event duplication, hidden capabilities, excessive configuration, or reversed data flow. Then propose a correction and a test that would have failed before it. This makes the answer reviewable rather than a list of preferred patterns.

## API-001 · Scenario

We now review API-001: A button that saves twice and ignores disabled. Inspect the consumer contract and identify the mechanism behind each reported defect.

## API-001 · Scenario

Two bug reports against `@acme/ui`'s button:

## API-001 · Scenario

"Every click on Save sends two requests." - "`<ui-button disabled>` is not disabled." (from a team whose application does not use strict template type checking)

## API-001 · Scenario

A third team says a typo in `kind` shipped to production unnoticed.

## API-001 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-001 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on ButtonComponent, kind, disabled, click. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-001 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-001 · Interview question

**Interviewer:** Explain each report, and fix the component's API. For each change, say whether existing consumers would notice.

[pause 5s]

## API-001 · 1. Saving twice: an output named after a native event

`(click)` on `<ui-button>` subscribes to both the component's `click` output and the native `click` DOM event on the host element. The inner `<button>`'s native click bubbles up to the host, so `save()` runs once for the bubbled DOM event and once for the output.

## API-001 · 1. Saving twice: an output named after a native event

It gets worse: a click on any part of the host outside the inner button (padding, a gap) fires the native event even when the button is disabled.

## API-001 · 1. Saving twice: an output named after a native event

Fix: never name an output after a native DOM event. Here the output is not needed at all: native `click` events from the inner `<button>` already bubble to the host, and a disabled `<button>` does not dispatch click events, so `(click)` on `<ui-button>` just works. If a custom event is needed, give it a distinct name (`pressed`).

## API-001 · 2. `disabled` with no value is falsy

For a static attribute with no value, Angular passes the empty string `''` to the input. `''` is falsy, so `[disabled]="disabled()"` leaves the button enabled. Applications with strict template checking get a compile error instead (a string is not a boolean), which is better, but HTML-style boolean attributes should simply work.

## API-001 · 2. `disabled` with no value is falsy

Fix: `input(false, { transform: booleanAttribute })`, which maps `''`, `'true'` and `true` to `true`, and `'false'`, `false`, `null` and `undefined` to `false`. `numberAttribute` does the same for numeric inputs.

## API-001 · 3. `kind` accepts any string

`input('primary')` infers `string`. `"primay"` compiles, produces the class `ui-button--primay`, and renders an unstyled button.

## API-001 · 3. `kind` accepts any string

Fix: a union type, exported so consumers can use it in their own code:

## API-001 · Answer · block 1 · page 1

This is the answer code, part 1 of 1. Focus on ButtonKind, kind. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-001 · 4. Consumers cannot choose `type`

`type="button"` is hard-coded, so `<ui-button>` can never submit a form. Add a `type` input that defaults to `'button'`. (API-002 looks at a design that avoids wrapping the native element.)

## API-001 · Answer · block 2 · page 1

This is the answer code, part 1 of 2. Focus on ButtonKind, ButtonType. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-001 · Answer · block 3 · page 2

This is the answer code, part 2 of 2. Focus on ButtonComponent, kind, type, disabled. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-001 · Fixed version

Combining a static `class` with a `[class]` binding is safe: Angular merges them.

## API-001 · Will consumers notice? · comparison 1

Change: Removing the `click` output. Effect on existing consumers: `(click)` keeps working, once. Anyone who called `.click.emit()` on the component directly breaks; that was never documented..

## API-001 · Will consumers notice? · comparison 2

Change: `booleanAttribute` on `disabled`. Effect on existing consumers: Widens accepted values. Non-breaking..

## API-001 · Will consumers notice? · comparison 3

Change: `kind` narrowed to a union. Effect on existing consumers: Technically breaking: call sites passing other strings stop compiling. Every such call site was already a bug, but it is still a compile failure on upgrade, so call it out in the changelog, or ship it in a major..

## API-001 · Will consumers notice? · comparison 4

Change: New `type` input with the old default. Effect on existing consumers: Non-breaking..

## API-001 · Follow-up 1

**Interviewer:** What other output names would you ban in a component library, and how would you enforce it?

[pause 5s]

Flag outputs that collide with native DOM events such as click, input, change, focus, blur, keydown, and submit. A library lint rule can inspect output declarations and aliases against a maintained event-name set, with reviewed exceptions for intentional contracts. Prefer domain names such as selectionChange or dismissed when a new event is needed. Most native activation needs no wrapper output. Test bubbling and output behavior from the consumer host rather than only checking the declaration name.

## API-001 · Follow-up 2

**Interviewer:** A team needs to know how the button was activated (mouse, keyboard). Does that justify an output?

[pause 5s]

A consumer can handle the native event when device details are truly needed. That does not by itself justify emitting another click event. Keyboard and assistive-technology activation do not always map cleanly to a simple mouse-versus-keyboard label, so avoid making business behavior depend on a guessed source. If a domain event needs additional context, define a distinct typed payload and document its semantics. Verify one activation still produces one action.

## API-001 · Follow-up 3

**Interviewer:** Should `kind` be renamed to `variant` to match the rest of the library? How would you do it without breaking anyone (see VER-002)?

[pause 5s]

Introduce variant as the preferred input while preserving kind for a published deprecation period. Distinguish unset from an explicit primary value and resolve variant first, then kind, then the default. Warn only on actual old usage in development, provide editor hints and a template migration, and remove the old name in the announced major. Test both names together and direct component-reference uses because changing the input getter's default can be observable even when rendering is unchanged.

## API-002 · Scenario

We now review API-002: A wrapper that hides the native element. Inspect the consumer contract and identify the mechanism behind each reported defect.

## API-002 · Scenario

`@acme/ui` has a text input component. Its backlog has grown to 23 open feature requests, all similar: "please add `autocomplete`", "add `inputmode`", "add `maxlength`", "expose `(blur)`", "we need to call `focus()`", "`aria-label` on `<ui-input>` does nothing", "our `<label for>` doesn't focus it", "it doesn't work with `formControlName`".

## API-002 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on InputComponent. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-002 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on type, placeholder, value. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-002 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Focus on aria-label. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-002 · Interview question

**Interviewer:** What is the underlying design problem behind all 23 requests? Propose a different design, and explain its trade-offs and how you would migrate to it.

[pause 5s]

## API-002 · The problem: the component owns the native element

The real `<input>` is hidden inside the component's template, so every native capability (over a hundred attributes, properties, events and methods) is unavailable unless the library re-exposes it by hand. Each request is a symptom; adding inputs one by one never ends, and every forwarded attribute is more API to maintain.

## API-002 · The problem: the component owns the native element

Worse, attributes on the host go to the wrong element. `id` and `aria-label` land on `<ui-input>`, which has no role and cannot take focus. `<label for="email">` points at the host, so clicking the label does nothing and the input has no accessible name. `formControlName` has no value accessor to bind to.

## API-002 · The alternative: put the library on the native element

Use an attribute selector, so the consumer writes the native element and the library enhances it:

## API-002 · Answer · block 1 · page 1

This is the answer code, part 1 of 1. Focus on InputDirective, invalid. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-002 · Answer · block 2 · page 1

This is the answer code, part 1 of 1. Read this part in the context of The alternative: put the library on the native element. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-002 · The alternative: put the library on the native element

Every native attribute, event and method now works, with no library code: `autocomplete`, `inputmode`, `(blur)`, `focus()`, `<label for>`, `aria-*`. Angular Forms' built-in value accessors apply to the native input, so `formControl`, `formControlName` and `ngModel` work too. The library adds only what it owns: styling hooks and state.

## API-002 · The alternative: put the library on the native element

The same applies to buttons and links: `button[uiButton], a[uiButton]` keeps native semantics, `type`, `disabled` and `href`, and avoids the bugs in API-001.

## API-002 · Trade-offs

No surrounding markup. `<input>` is a void element: the directive cannot render a label, an icon or an error message around it. Those belong to a container component, for example `<ui-form-field>` that projects a label, the input, a hint and an error, and connects their ids (it can find the directive with `contentChild(InputDirective)`). This is the split Angular Material uses between `mat-form-field` and `matInput`. Styles. A directive has no stylesheet of its own. Styles ship as a global stylesheet or with the form-field component, keyed on `.ui-input`. Shared namespace. Directive inputs sit beside native attributes on the same element. Choose names that will not collide with future HTML attributes, or prefix them. Less control. Consumers can now put any attribute on the input, including ones that conflict with the design system. That is usually the right trade for a shared library: the platform's API is better documented and more stable than anything the library could write.

## API-002 · Migration

Replacing `<ui-input>` with `<input uiInput>` is a breaking change for every call site:

## API-002 · Migration · item 1

1. Minor: ship `uiInput` and `<ui-form-field>` alongside the old component, and mark `<ui-input>` deprecated in documentation, JSDoc (`@deprecated`, which editors show with a strike-through) and the changelog.

## API-002 · Migration · item 2

2. Migration: an `ng update` schematic that rewrites the common patterns, and a list of call sites it could not convert.

## API-002 · Migration · item 3

3. Next major: remove `<ui-input>`. Freeze its feature requests in the meantime, so effort goes into the replacement.

## API-002 · Follow-up 1

**Interviewer:** How would `<ui-form-field>` give the input its `aria-describedby` without the consumer writing ids by hand?

[pause 5s]

Let the form field and projected control communicate through a small injected contract. The field owns unique identifiers for helper and error text; the control directive merges them with any consumer-provided descriptions on the native element. Register and unregister as content changes, and keep invalid and label state synchronized. Do not overwrite the consumer's existing aria-describedby values. Test multiple fields and dynamic helper or error content through a host.

## API-002 · Follow-up 2

**Interviewer:** When is wrapping the native element still the better choice?

[pause 5s]

Wrapping is appropriate for a genuinely composite widget with coordinated elements, such as a date picker with a popup trigger or a control whose internal structure is intrinsic to its behavior. It can also enforce a carefully documented layout contract. The cost is forwarding native capabilities, focus, labels, and forms integration. If the wrapper mainly adds a border to one input, an attribute directive usually gives a smaller and more adaptable API. Choose according to the task and supported customization, not stylistic preference.

## API-002 · Follow-up 3

**Interviewer:** Could `hostDirectives` help share behaviour between `uiInput` and other controls?

[pause 5s]

Host directives can compose reusable behavior statically and expose selected inputs and outputs explicitly. They can help share focus, disabled state, or other host-level logic across native controls. They do not automatically forward arbitrary attributes to an internal input and do not replace the form-field relationship contract. Check construction and input precedence when composing directives. Document the exposed API so consumers know which capabilities belong to the public control.

## API-003 · Scenario

We now review API-003: A card with an input for everything. Inspect the consumer contract and identify the mechanism behind each reported defect.

## API-003 · Scenario

`@acme/ui`'s card started with a title and a body. A year later it looks like this, and the open requests include: "make the title a link", "two badges", "a link inside the body", "a menu instead of buttons", and "our page needs an `h2`, not an `h3`". Three teams have copied the card into their own code to get around it.

## API-003 · Scenario · block 1 · page 1

This is the original code, part 1 of 4. Focus on CardAction. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-003 · Scenario · block 2 · page 2

This is the original code, part 2 of 4. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-003 · Scenario · block 3 · page 3

This is the original code, part 3 of 4. Focus on CardComponent, title, subtitle, icon. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-003 · Scenario · block 4 · page 4

This is the original code, part 4 of 4. Focus on actions. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-003 · Interview question

**Interviewer:** What is wrong with this API, beyond the individual bugs? Redesign it, and plan the migration for the teams already using it.

[pause 5s]

## API-003 · 1. Configuration does not scale; composition does

Each input describes one fixed piece of content. Every new layout needs a new input, the inputs interact in ways nobody tested, and anything the inputs cannot express (a link title, a menu, two badges) forces teams to fork. Forks are the worst outcome for a design system: they stop receiving fixes and drift visually.

## API-003 · 1. Configuration does not scale; composition does

The card's real job is layout and styling of regions: media, header, body, actions. What goes in each region belongs to the consumer.

## API-003 · 2. Individual bugs the configuration style caused

Fixed heading level. `h3` is right on some pages and wrong on others. Heading levels describe the page's outline; a reusable component cannot know it. A wrong level breaks navigation by headings, which is how many screen-reader users skim a page. Image without `alt`. The `img` has no `alt`, so some screen readers read the file name. The card cannot know whether the image is decorative (`alt=""`) or meaningful. - `[innerHTML]` body. Angular sanitizes it, but the sanitizer silently strips content teams expect (styles, many attributes), and it encourages teams to reach for `bypassSecurityTrustHtml`, which opens an injection risk. Projected content needs neither. Actions as data. A `{ label, handler }` list cannot express links, menus, icons or `aria-label`. Each new need becomes another field.

## API-003 · Answer · block 1 · page 1

This is the answer code, part 1 of 3. Focus on CardTitleDirective, CardSubtitleDirective, CardMediaDirective. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-003 · Answer · block 2 · page 2

This is the answer code, part 2 of 3. Focus on CardActionsComponent. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-003 · Answer · block 3 · page 3

This is the answer code, part 3 of 3. Focus on CardComponent, title, hasHeader. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-003 · Answer · block 4 · page 1

This is the answer code, part 1 of 1. Read this part in the context of Redesigned API. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-003 · Redesigned API

Every request is now satisfied without a library change: the consumer picks the heading level, the link, the badge count and the action controls, and writes the `alt` text.

## API-003 · Redesigned API

The marker directives are more than selectors: they apply the styling class, they appear in autocomplete and documentation, and the card can query them (as `hasHeader` does) to avoid rendering empty wrappers.

## API-003 · Trade-offs to state

Less enforced consistency. Consumers can now put anything in a region. Mitigate with marker directives, good documentation examples, and visual review, rather than by taking control back. Projection rules. `select` matches only elements written directly inside `<ui-card>` in the consumer's template. Content wrapped in another element or an `<ng-container>` needs `ngProjectAs`. Projected content is always created by the parent, even inside an `@if` in the card (see A11Y-002). Not everything should be a slot. Values the card must interpret (for example an `elevation` that maps to tokens) stay as typed inputs.

## API-003 · Migration

Removing seven inputs is breaking. Ship the slot API in a minor release and keep the old inputs working (the template can render the legacy markup when `title()` is set and project otherwise). Mark the inputs `@deprecated` with a pointer to the slot equivalent, provide an `ng update` schematic for the simple cases, and remove them in the next major.

## API-003 · Follow-up 1

**Interviewer:** When would you still choose a configuration (data-driven) API, for example for a data table's columns?

[pause 5s]

Choose data configuration for uniform repeated structures where a schema is useful, such as column identifiers, sorting rules, widths, and value accessors. Use templates or projection for rich content that varies structurally. A table can combine typed column metadata with cell templates. The decision depends on whether consumers need to describe data or compose UI. Keep the configuration type narrow and avoid callbacks for every possible piece of markup.

## API-003 · Follow-up 2

**Interviewer:** How would you make the entire card clickable while keeping the title link and action buttons accessible?

[pause 5s]

Use a real title link as the primary navigation action and separate action buttons. A stretched-link technique can enlarge the title link's hit area while carefully preserving interactive controls above it. Avoid nesting buttons or links inside another interactive element and avoid a container click handler that hijacks text selection or child actions. Show clear focus and hover states and test keyboard traversal. In some cards, keeping only the title clickable is the simplest accessible design.

## API-003 · Follow-up 3

**Interviewer:** How do you document slots so consumers discover them in their editor?

[pause 5s]

Export named slot directives with clear selectors and JSDoc, include compile-checked examples, and describe which slots are optional or repeatable. Editors can discover directives and their inputs more reliably than an undocumented attribute convention. Document heading responsibility, image alternatives, empty slots, and layout behavior. Projection selectors alone do not create typed slot metadata or lazy instantiation. Use a template contract when the library needs context or deferred creation.

## API-004 · Scenario

We now review API-004: A checkbox that makes every form dirty. Inspect the consumer contract and identify the mechanism behind each reported defect.

## API-004 · Scenario

`@acme/ui`'s checkbox supports reactive forms. Product teams report four bugs:

## API-004 · Scenario · item 1

1. "After `form.reset()`, our 'You have unsaved changes' banner appears."

## API-004 · Scenario · item 2

2. "`form.patchValue({ terms: true })` doesn't tick the box until something else happens."

## API-004 · Scenario · item 3

3. "`control.disable()` does nothing."

## API-004 · Scenario · item 4

4. "Our 'show errors after the user leaves the field' logic never shows errors for checkboxes."

## API-004 · Scenario · block 1 · page 1

This is the original code, part 1 of 3. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-004 · Scenario · block 2 · page 2

This is the original code, part 2 of 3. Focus on CheckboxComponent, onChange. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-004 · Scenario · block 3 · page 3

This is the original code, part 3 of 3. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## API-004 · Interview question

**Interviewer:** Match each bug to its cause and fix the component. Explain the contract between Angular Forms and a `ControlValueAccessor`: which direction does each method carry data?

[pause 5s]

## API-004 · The contract · comparison 1

Method: `writeValue(value)`. Direction: Model to view. Meaning: "The form's value changed; display it." Must not report back..

## API-004 · The contract · comparison 2

Method: `registerOnChange(fn)`. Direction: View to model. Meaning: Call `fn(value)` only when the user changes the value..

## API-004 · The contract · comparison 3

Method: `registerOnTouched(fn)`. Direction: View to model. Meaning: Call `fn()` when the user has interacted and left (usually on blur)..

## API-004 · The contract · comparison 4

Method: `setDisabledState(disabled)`. Direction: Model to view. Meaning: Reflect the control's disabled state..

## API-004 · Bug 1: `writeValue` calls `onChange`

`reset()` writes the value to the view, and the component reports it straight back as if the user had changed it. The forms API treats a view change as user input and marks the control dirty, so the form is dirty immediately after a reset. It can also cause loops with code that reacts to value changes.

## API-004 · Bug 1: `writeValue` calls `onChange`

Fix: `writeValue` only updates what is displayed.

## API-004 · Bug 2: `OnPush` and a plain field

`writeValue` is called by the forms API, outside any template event of this component. Under `OnPush`, setting a plain field does not mark the component for checking, so the box stays as it was until something else triggers a check. In a zoneless application it may never update.

## API-004 · Bug 2: `OnPush` and a plain field

Fix: hold the state in a signal. Setting a signal read by the template schedules the update.

## API-004 · Bug 3: no `setDisabledState`

Angular Forms calls `setDisabledState` whenever the control's disabled state changes (and, since Angular 15, also on initialisation). The method is optional in the interface, so leaving it out compiles, and disabling does nothing.

## API-004 · Bug 4: touched is never reported

`registerOnTouched` throws the callback away, so the control never becomes `touched`. Any "show errors after the user leaves the field" rule never fires.

## API-004 · Bug 4: touched is never reported

Fix: keep the callback and call it on `blur`.

## API-004 · Also: `reset()` writes `null`

`form.reset()` with no value writes `null`, which the `boolean` signature hides. `checked = null` happens to render as unticked, but anything comparing with `=== false` breaks. Accept `boolean | null` and coerce.

## API-004 · Answer · block 1 · page 1

This is the answer code, part 1 of 4. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-004 · Answer · block 2 · page 2

This is the answer code, part 2 of 4. Focus on CheckboxComponent, checked, disabled, onChange. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-004 · Answer · block 3 · page 3

This is the answer code, part 3 of 4. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-004 · Answer · block 4 · page 4

This is the answer code, part 4 of 4. Focus on onUserChange. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## API-004 · Fixed version

The value comes from the native input's `checked` property rather than toggling the stored value, so the component can never disagree with what the user sees.

## API-004 · What a strong candidate also mentions

Use outside forms. Some teams do not use Angular Forms. Offering a `checked` `model()` as well is useful, but then forms and the model must write the same signal, and the documentation must say "use one or the other on a given instance". Validators. `Validators.requiredTrue` works without extra code. A component with built-in validation would also provide `NG_VALIDATORS`. Indeterminate state for "select all" checkboxes is a property (`indeterminate`), not an attribute, and needs its own input. Tests that use real forms. Each bug above is caught by a test that binds a real `FormControl` and calls `reset()`, `patchValue()` and `disable()`. Testing the component in isolation would miss all four.

## API-004 · Follow-up 1

**Interviewer:** Why does `onChange` during `writeValue` mark the control dirty? Which flag does the forms API set?

[pause 5s]

Forms registers a view-to-model callback that marks the control pending dirty for a user change, then commits dirty state according to the update policy. Calling that callback during writeValue falsely takes the user-change path during a programmatic write. With updateOn blur, the pending state may commit later, so timing differs. writeValue should update only the view. Test reset leaves the form pristine and verify genuine user interaction marks it dirty.

## API-004 · Follow-up 2

**Interviewer:** How would you build a `ui-radio-group` that works with `formControlName` on the group?

[pause 5s]

Put the value accessor on the group so it represents one selected value. Individual radio items report user selection to the group, while the group handles writeValue, onChange, touched behavior, and disabled propagation. Use native radio semantics or a complete radiogroup keyboard pattern, unique grouping names, and an accessible group label. Object values may need a comparison contract. Programmatic writes must not emit user changes, and moving focus within the group should follow the chosen touched policy.

## API-004 · Follow-up 3

**Interviewer:** What changes if the application uses Angular's signal-based forms instead of reactive forms?

[pause 5s]

Signal forms use their own custom-control interfaces rather than assuming ControlValueAccessor is the adapter. For a checkbox-like control, inspect the checked-control interface and field binding for the supported Angular version; value controls use the value-control interface. Expose the expected model and state signals, and test disabled, touched, validation, and labels through that integration. If supporting reactive forms too, document both adapters and avoid simultaneous competing writers to the same state.

## Final review checklist

Review the lesson by answering each main question and follow-up aloud. For Angular Component APIs: Native Semantics and Consumer Contracts, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.
