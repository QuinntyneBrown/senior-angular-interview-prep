# Angular Component APIs: Native Semantics and Consumer Contracts

## Design from consumer tasks

Welcome to the component API lesson. Our four questions concern a button that saves twice, an input wrapper that hides native capabilities, a card with too much configuration, and a checkbox that violates the forms contract. They share a root concern: a shared component should make the supported task clear and preserve the behavior consumers reasonably expect.

Begin with a representative consumer template. What does the team bind, which events do they handle, and where does state live? Then examine the actual host element and any internal native element. A label, a disabled attribute, or an identifier on a wrapper does not automatically reach the internal control. An API that appears convenient can force dozens of forwarding inputs as soon as another team needs a native capability.

A senior answer considers the interface as well as individual bugs. Explain the smallest useful contract, show how to use it, identify unsupported combinations, and describe the migration from today's behavior. Compatibility includes native events, form state, projected content, styling hooks, and test APIs, not just exported TypeScript names.

## Inputs express allowed states

Use input types that express supported values. A string input for button kind accepts values the stylesheet cannot represent. A union of primary, secondary, and danger tells the compiler and editor what is supported. Defaults should be intentional, and required inputs should be reserved for values without which the component cannot function meaningfully.

Boolean attributes need careful handling. In HTML, disabled with no value expresses presence. A plain string read as an empty value is falsy in JavaScript, which can make an apparently disabled wrapper remain clickable. Angular's booleanAttribute transform gives predictable attribute-style coercion. Explain which values it accepts and test both static attributes and bound booleans.

Inputs are data coming from the consumer. Avoid silently copying them into an unrelated local field that only initializes once. If the value is derived, use a derivation. If the child commits local state, a model can express a two-way contract. If the parent must approve a proposed change, keep a controlled input and emit a request rather than committing first. The signals lesson develops that distinction in depth.

```ts
type ButtonKind = 'primary' | 'secondary' | 'danger';
readonly kind = input<ButtonKind>('primary');
readonly disabled = input(false, { transform: booleanAttribute });
readonly type = input<'button' | 'submit' | 'reset'>('button');
// Teaching excerpt; imports are in the complete example.
```

## Native events and component outputs

A native click bubbles from an internal button through the component host. If a component also emits an output called click, a consumer can receive an unexpected second notification. Before inventing an event, ask whether the native event already expresses the action. Ordinary button activation usually needs no custom click output.

Reserve component outputs for domain transitions that are not already represented by native events. A selected value change or a dismissal request can be useful. Avoid names that collide with native events such as input, change, focus, blur, or keydown unless the component intentionally documents that contract and its interaction with bubbling. A lint rule can enforce the library's event naming policy.

Do not distinguish keyboard and pointer activation by guessing from an event detail without considering assistive technology. Consumers may legitimately need a native MouseEvent or KeyboardEvent for specialized behavior, but business logic should ordinarily respond to activation independently of the device. Keep telemetry requirements separate from whether the action succeeds. Test one activation produces one consumer action, and test disabled behavior through the real native control.

## The native host can be the API

An attribute directive on a native input can style and enhance it while retaining autocomplete, inputmode, maxlength, name, id, validation, browser autofill, labels, and forms integration. Consumers do not need a wrapper to forward every property. A component with an attribute selector can also enhance a native element when a template is needed.

A wrapper can still be appropriate for a genuinely composite control, an overlay-based picker, or a widget whose focusable element needs coordinated internal structure. The trade-off should be explicit. If the wrapper hides the native element, it needs a clear forwarding and focus contract. A request for twenty-three new inputs often signals that the abstraction boundary is in the wrong place rather than that twenty-three more inputs are needed.

Shared behavior can be factored through directives and the directive composition API. Inputs and outputs from host directives are exposed explicitly, and composition is established statically. This helps reuse focus or disabled logic, but it cannot automatically forward every arbitrary native attribute into a hidden descendant. Choose the host element first, then use composition to share behavior at that boundary.

```html
<label for="email">Email</label>
<input uiInput id="email" type="email"
       autocomplete="email" inputmode="email"
       maxlength="120" [formControl]="email">
<!-- Native capabilities remain on the actual input. -->
```

## Composition for rich content

A card with separate inputs for every badge, action, heading, image, and body style accumulates combinations the library must maintain. Content projection lets consumers supply real HTML and application components within documented slots. The library owns layout and style while the application owns content, heading level, links, and business actions.

Projection preserves Angular bindings and native semantics better than passing an HTML string. Angular sanitization helps protect unsafe bindings, but sanitization does not turn arbitrary innerHTML into a well-designed content API. A body string cannot conveniently carry application directives or typed interactions. Make image alternatives and headings explicit consumer responsibilities when the content is projected.

Configuration remains valuable for uniform repeated data. A table's column definitions are naturally data driven, and a menu can often be generated from a typed item model. Offer template customization at the points where the structure truly varies. Avoid replacing every configuration object with dozens of unstructured slots; explain the consistency versus flexibility trade-off.

## Forms have two data directions

A ControlValueAccessor adapts a custom control to Angular Forms. The forms model calls writeValue to update the view. The component calls the registered onChange callback after a user change to update the forms model. These are opposite directions. Calling onChange from writeValue creates a feedback path and can mark a programmatic reset as a user edit.

The registered onTouched callback reports the appropriate touch interaction, commonly blur for a single input. The disabled-state hook must update the actual interactive element. Signals or markForCheck make model-to-view updates observable under OnPush and zoneless change detection. Normalize null when reset can supply it, and document whether a checkbox supports an indeterminate state separately from its value.

Test through a real FormControl host. A programmatic value write should update the view while the form stays pristine. A user change should update the value and dirty state. Blur should make it touched. Disabling the control should prevent user interaction. These tests verify the contract; a test that only invokes toggle on the component misses the connection to the forms engine.

```ts
writeValue(value: boolean | null): void {
  this.checked.set(value ?? false);
}
registerOnChange(fn: (value: boolean) => void): void {
  this.onChange = fn;
}
// User path only:
onUserChange(value: boolean): void {
  this.checked.set(value);
  this.onChange(value);
}
```

## Signal forms are a separate integration contract

Reactive forms use ControlValueAccessor. Signal-based forms have their own custom-control interfaces and bindings. Do not assume that a value accessor automatically implements every signal-forms capability. Check the API for the supported Angular version and choose the integration explicitly.

For a value control, the signal-forms interface exposes a writable model value with supported state inputs. Checkbox-like controls use the corresponding checked control contract. The form field binding coordinates the form model with that control. Disabled, readonly, touched, validation, and accessibility state need to remain coherent. If the library supports both forms systems, document and test each integration rather than forcing them to write the same state through two competing paths.

Version support matters because these interfaces can differ across Angular releases. Our complete examples use the installed framework version. A library claiming support for older majors must test its public interfaces against those majors. This is a compatibility claim, not something a successful build on one version can prove.

## Migrate with examples and compatibility tests

Removing an output can change what an existing consumer receives. Adding a union can reject values that compiled yesterday. Moving a wrapper to a native attribute selector changes the template. These improvements need a release and migration strategy. Inventory current usage, publish the preferred API, retain compatibility where practical, and give teams a clear removal window.

Document the consumer-facing form in examples that compile. Show native events, labels, forms binding, projected slots, and disabled behavior. A component harness should expose meaningful tasks instead of internal classes so a markup refactor does not break every product's tests. Treat that harness as a supported API with its own compatibility obligations.

During the questions, trace a reported bug from the consumer template to the actual element or callback. Identify whether the problem is coercion, event duplication, hidden capabilities, excessive configuration, or reversed data flow. Then propose a correction and a test that would have failed before it. This makes the answer reviewable rather than a list of preferred patterns.
