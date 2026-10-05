# 01 · Angular Signals: State Ownership and Component Contracts

## Learning goals and the review method

Welcome to this instructional lesson on Angular signals for senior engineers building a shared component library. We will first build a working mental model, then review four real scenarios from this repository: a chip selection that drifts, a switch that ignores its parent, effects that leak resources, and a table that mutates consumer data. You will see the faulty code, hear the question, have time to think, and compare your answer with a detailed explanation. We will also answer every follow-up question. Pause the video whenever you want more time to inspect the code.

## Learning goals and the review method · 2

These questions are not mainly about remembering function names. They test whether you can identify who owns a value, what invalidates a derivation, when a resource is acquired and released, and how a component behaves when another team uses it differently from your own application. A senior answer connects the reported symptom to a precise mechanism. It then proposes a correction, identifies a test that would catch the defect, and explains the effect on consumers.

## Learning goals and the review method · 3

Use four steps in each review. First, trace the state from the parent through the input to the rendered template. Second, identify every write and the event that causes it. Third, distinguish derived values from values that users can independently change. Fourth, examine the public contract: inputs, outputs, accessibility, and compatibility. This method works beyond signals, but signals make the dependency graph unusually visible. Our examples use the Angular version installed in this repository. Version-dependent behavior will be identified rather than assumed to apply to every older release.

## Writable signals and tracked reads

A signal is a value container with a getter function. Calling the getter reads the current value. In a reactive context, Angular also records that read as a dependency. The context matters: a computed derivation, an effect, and a template establish reactive dependencies. Reading a signal once in an ordinary constructor field initializer does not turn the resulting plain value into a reactive relationship. That distinction explains several bugs we will encounter.

## Writable signals and tracked reads · 2

Look at the counter example. We create a count with an initial value of zero. Calling count gives zero. Setting it to three replaces the value. Updating it with a function that adds one derives a new value from the current value. Set is useful when the new value already exists, such as a server response. Update is useful when the change depends on the current state. Neither operation is a promise to notify consumers regardless of the result. Equality still determines whether a change occurred.

## Writable signals and tracked reads · 3

The template reads count by calling it. It does not receive a snapshot that we must manually refresh. Angular knows that this view depends on the signal. That relationship also works with OnPush components: signal changes can mark a consuming component for a subsequent update. This is not a guarantee that every arbitrary mutable object, asynchronous callback, or property change becomes reactive. Ask which signal changed and which consumer read it. If you cannot point to that connection, the word reactive is hiding an assumption rather than explaining the behavior.

## Equality and immutable collection updates

Signals use referential equality by default, through Object dot is. For primitive values that is usually intuitive. Setting false to false does not notify consumers. With an array, however, the reference can stay the same while its contents change. Pushing into an existing array and returning that array from update does not create a different reference. A computed that previously read the array can retain a cached result because the signal did not report a change.

## Equality and immutable collection updates · 2

The two collection examples show the difference. The incorrect version pushes a value into the list and returns the same list. The corrected version returns a fresh array containing the previous elements and the new element. Removing an item with filter also produces a fresh array. The point is not that the syntax is fashionable. The new reference is the observable state transition that tells dependent code its cached result may be invalid.

## Equality and immutable collection updates · 3

Immutability also defines an ownership boundary. A component receiving an array should not sort it in place, append to it, or change consumer-owned records while calculating a view. Otherwise a table can unexpectedly change an export elsewhere in the application. A readonly array type helps the compiler reject common mutations. It is not a runtime freeze and does not deeply freeze objects inside the array. If you hand an internal array to untrusted JavaScript, a type annotation cannot stop that caller from mutating it. Copies, stable immutable contracts, or deliberate defensive freezing may be appropriate depending on the API and cost.

## Computed values are cached derivations

A computed is a read-only signal whose value is derived from other signals. Its computation is lazy: it runs when a consumer first reads it. Its result is memoized until a dependency changes. Reading the computed repeatedly without invalidation should reuse the cached result. This is why a computed is often a good place for a filtered list or a selected-value lookup, rather than an ordinary template method that repeats the work whenever it is called.

## Computed values are cached derivations · 2

The total example reads quantity and unit price, then multiplies them. There is no reason to create a separate writable total and an effect that copies the multiplication result into it. Total is determined by two existing facts. Maintaining an extra stored total creates another write path and another opportunity for disagreement. A pure computed says directly what the value means. It also makes a useful test easy: change quantity, read total, and assert the expected result.

## Computed values are cached derivations · 3

Keep a derivation pure. Do not emit an output, mutate an input array, or register an event listener while evaluating a computed. Consumers can read the result at times you do not control, and memoization means the computation is not an event handler. A derivation may allocate a new result, but it should not change the facts from which it derives that result. When a table sorts a copy of its input, that is a derivation. When it sorts the input itself, it is an unexpected write disguised as a calculation.

## Dynamic dependencies and narrow derivations

Dependencies are determined by the signals actually read during the latest execution, not by all the signals mentioned in the source code. In the conditional example, the detailed view reads the price only when showDetails is true. When it is false, the computation returns a simple label without reading price. A price change therefore does not invalidate that result through a dependency that was never established in that branch. When showDetails changes, the computation can establish a different set of dependencies.

## Dynamic dependencies and narrow derivations · 2

This behavior makes narrow computeds useful. Imagine one computed that returns an object containing sorted rows and a count. Changing the sort may allocate a new wrapper even though the count is unchanged. Consumers interested only in the count now depend on the wrapper's identity. Separate sortedRows and rowCount computeds communicate the independent meanings more clearly. A custom equality function can suppress equivalent results, but it should express a real equivalence rule rather than conceal mutations or stale data.

## Dynamic dependencies and narrow derivations · 3

Do not assume that equality prevents the expensive computation itself. Angular must obtain the new computed result before it can compare that result with the old one. If sorting thousands of records is the costly part, a result equality function does not eliminate the sort. First stabilize inputs and measure the cost. Then consider narrow dependencies, sensible caching, or a different data strategy. Deep comparison also has a cost, and an equality function that ignores a relevant field can leave the view stale. Correctness comes before suppressing notifications.

## Inputs and construction order

An input signal represents data supplied by Angular's binding system. Input declarations belong in component initialization, but consuming the eventual bound value during construction is different. Field initializers and constructors run before Angular has assigned the inputs for the first render. A non-required input read at that moment returns its declared default. A required input read before assignment can fail because there is not yet a value to read.

## Inputs and construction order · 2

Suppose options has an empty-array default. If a selected field is initialized by immediately filtering options, selected starts empty even when the parent is about to supply selected options. Angular will later update the input signal, but selected is an independent writable signal created from an earlier snapshot. Nothing in that field initializer declares an ongoing dependency. Moving the snapshot to the first lifecycle callback can fix the first assignment while still leaving later changes unsynchronized.

## Inputs and construction order · 3

The correct design depends on the meaning of the value. If selection is entirely determined by options, use a computed. If the user can edit selection but changes to options must reset or reconcile it, consider linkedSignal. If the parent owns the selection, make that ownership explicit in the input and output contract. Never pick a lifecycle hook as a substitute for defining state ownership. In a review, say what happens before binding, after the first binding, after user interaction, and after a later parent update. Those four moments reveal whether your design is actually complete.

## Linked signals for writable dependent state

A linked signal combines writable state with a dependency that determines when it should be recomputed. Unlike a computed, the user can change its value. Unlike an ordinary independent signal, it also knows that a source change affects the validity of that value. This is useful when a selected shipping method depends on available methods, or a selected chip list depends on the options that still exist.

## Linked signals for writable dependent state · 2

The source and computation form lets you access both the new source and the previous linked value. On the first computation, initialize from the options marked selected. On subsequent option changes, retain the user's previous selections only where their identifiers still exist. This distinction matters. Reinitializing from selected flags on every new options array would erase the user's edits. Preserving everything forever would leave selections referring to deleted options. Reconciliation states the exact middle ground.

## Linked signals for writable dependent state · 3

The source must itself communicate changes through signals. Mutating an options array in place without publishing a new value does not reliably trigger reconciliation. Conversely, a parent that creates a fresh but equivalent array on every check can cause unnecessary recomputation. Recommend a stable signal or computed on the consumer side. If you add equality, compare all fields relevant to the contract, not only labels or array length. Also decide whether automatic pruning produces an output. A user-action event and an effective-state event are different promises, and a shared library should not blur them.

## Models and two-way component binding

A model input is a writable signal exposed as a component input. Angular also creates a corresponding change output. A checked model creates checkedChange, allowing a parent to use the conventional two-way binding syntax. The component can update checked directly; it does not need a second local signal plus a manual synchronization effect. A parent change updates the same value that the template reads.

## Models and two-way component binding · 2

This solves the ordinary reset problem: the parent turns a setting off and the switch renders off because both use one model value. It also supports a component used without a parent binding, where the model's default and user updates provide local behavior. Those are useful capabilities, but the API still needs a documented contract. Does the component commit a change immediately, or does it merely request permission from the parent? A model naturally performs the former.

## Models and two-way component binding · 3

A rejected change exposes the difference. If the model flips to true while the parent keeps its one-way bound false unchanged, Angular has no changed parent value to write back. The switch can remain on. Even an immediate two-way change-and-revert can collapse to the same previously bound value before Angular processes the input. Do not promise that any synchronous rollback automatically repairs this. For strict parent authority or asynchronous approval, use a read-only input plus a request output and render only the parent's accepted state. We will show that alternative explicitly during the switch walkthrough.

## Choosing a controlled component contract

In the controlled example, the switch reads checked from an input and emits a requested value from a separate output. Clicking does not change an internal checked signal. If the parent accepts, it updates checked and the view changes. If the parent rejects, checked remains unchanged and the view remains unchanged. There is no speculative local commit to undo. This can be particularly useful for authorization, confirmation dialogs, or server-validated settings.

## Choosing a controlled component contract · 2

The tradeoff is that an unbound controlled component does not automatically maintain a useful local value. If you need both behaviors, distinguish them explicitly through an API that consumers can understand and test. Avoid silently combining an input, a model, and a second local signal while hoping synchronization will settle conflicts. Also choose output names carefully. A request event says an interaction occurred, not that the effective state changed. A change event normally implies a committed change.

## Choosing a controlled component contract · 3

Boolean syntax, disabled behavior, accessible names, and forms integration are part of the same contract. A model does not accept an input transform like booleanAttribute. Document property binding for its boolean value. A controlled input can use that transform when appropriate. Native button disabled behavior is usually preferable to ignoring clicks in an event handler alone. Reactive forms require a clear ControlValueAccessor relationship; they should not create a second hidden value that fights with the signal model. These concerns are not extras after the reactivity fix. They are what makes the fix usable across product teams.

## Effects connect state to external systems

Use an effect when reactive state must synchronize with a non-reactive system, such as a browser storage API, a charting library, or an imperative event registration. It tracks signal reads and reruns when those dependencies change. That is different from calculating another piece of application state. For a value determined by signals, start with a computed or a linked signal and only use an effect when an external side effect is genuinely required.

## Effects connect state to external systems · 2

Consider the self-triggering pattern on screen. The effect reads selected and writes the result of filtering selected back into selected. Filter creates a fresh array even if the contents are identical. The write changes a dependency the effect has just read, scheduling another run. Each run writes another fresh reference. The problem is a feedback loop in the dependency graph, not a missing timeout. Adding a delay merely changes how fast the loop repeats. Using untracked to hide a dependency can remove one trigger while leaving an unclear synchronization design.

## Effects connect state to external systems · 3

Effects also have lifecycle requirements. When a new run replaces an external resource, the old resource must be released. If an effect installs a document listener every time a popover opens, closing the popover should release that listener. Destroying the component must release it too. A correct answer identifies both the resource and its intended lifetime. It does not merely say that Angular cleans up effects, because Angular cannot infer how to undo an arbitrary browser API call inside an effect callback.

## Cleanup is part of resource ownership

An effect callback receives a cleanup registration function. Register the action that undoes what this run created. Angular invokes that cleanup before the next run and when the effect is destroyed. A normal component-scoped effect is destroyed with its owning context unless you deliberately opt into another lifecycle. Resource cleanup inside the effect is still your responsibility.

## Cleanup is part of resource ownership · 2

The listener example uses one named handler for addition and removal. The same event type, function identity, and capture setting must match. Creating a second anonymous function that looks identical is not enough: it is a different function object. Registering removal only in the component's destruction hook may release the last listener at the end, but it does not manage repeated open-close cycles if every opening created another handler.

## Cleanup is part of resource ownership · 3

A one-time listener is not the same lifetime. With once enabled, the first keydown event removes the listener, even if that key was not Escape. A user pressing Tab before Escape would disable the desired close behavior. This illustrates a general review technique: reason about events that do not satisfy the handler's inner condition. For subscriptions, timers, observers, and listeners, describe acquisition, repeated use, replacement, and destruction. That lifecycle explanation is more valuable than memorizing a cleanup API name.

## DOM work after rendering

Ordinary effects are not a general guarantee that the final browser layout is ready to measure. DOM placement may depend on elements created by a conditional template, changes in other components, styles, and layout. When work specifically depends on rendered DOM, afterRenderEffect provides a post-render integration point. Its callbacks do not run during server-side rendering, where there is no browser layout to inspect.

## DOM work after rendering · 2

Separate reading layout from writing styles. The example reads an anchor rectangle in earlyRead, then passes the measurement to a write phase that positions the panel. The phase argument is exposed as a signal, so the write callback reads that measurement through its getter. Batching reads and writes across components helps reduce unnecessary layout recalculation. Mixing getBoundingClientRect with immediate style changes in many independent callbacks can force repeated layout work.

## DOM work after rendering · 3

This is still only a minimal positioning example. Scrolling, resizing, clipping containers, viewport edges, stacked overlays, and focus restoration require more design. A shared library should usually build on an established positioning and overlay system rather than ship a few coordinate assignments as a complete solution. Rendering at the right time fixes one class of defect; it does not establish collision handling, layer ownership, or accessible semantics. Separate the demonstrated correction from what you would require before a production release.

## Row identity and accessible derived views

Signals do not replace DOM identity. When a list is sorted, tracking by index associates a view with a position. The record occupying that position can change while local state stays with the reused view. A focused checkbox or expanded row may now appear attached to a different record. A stable unique record identifier tells Angular which views correspond to the same logical rows even when their positions move.

## Row identity and accessible derived views · 2

Stable tracking and stable inputs solve different problems. Tracking can preserve views across a new array of records, but it does not automatically eliminate sorting work or all binding updates. A stable computed in the parent can avoid producing an equivalent filtered array on every unrelated check. A column-specific comparator can correctly handle dates or numeric data. Sorting a copy preserves ownership. These are complementary decisions, not one universal performance switch.

## Row identity and accessible derived views · 3

Accessibility also changes the implementation. A click handler on a table header does not provide a keyboard-operable control. Use a real button in the header. Put aria sort on the sorted header to expose direction, and decide whether a live announcement helps users understand the resulting change. A chip toggle uses pressed state; a switch uses checked state. Match semantics to the interaction rather than copying attributes between components. Readability, state correctness, keyboard operation, and a stable public contract should be verified together.

## How to prove the correction

Before we begin the questions, turn each claim into a concrete observation. For immutable selection updates, inspect both the selected values and the rendered pressed state after a click. For linked selection, remove an option and confirm that invalid selections disappear while valid user choices remain. For a parent reset, change the bound value and confirm that the displayed switch follows it. For rejection, deliberately keep the parent's accepted value unchanged and verify the controlled contract.

## How to prove the correction · 2

For cleanup, open and close the popover repeatedly and confirm that the active listener count returns to zero. Destroy it while open and confirm cleanup again. For positioning, measure the anchor in an actual browser and compare the panel's assigned coordinates after rendering. For a table, retain a copy of the original order, sort the displayed view, and confirm that the consumer's array is unchanged. Keep a DOM reference for one record and confirm it remains that record's row after reordering.

## How to prove the correction · 3

Compilation is necessary but does not prove these behaviors. Strict template checking catches invalid bindings and missing members, but it cannot establish event lifetime or browser layout. A mocked rectangle does not prove that real layout occurs at the right time either. Conversely, one working browser demonstration does not prove every locale, assistive technology, or server-rendering scenario. State the conditions you actually checked, then explain the remaining production requirements. That evidence-first habit is the difference between an attractive answer and a dependable engineering decision.

## SIG-001 · Scenario

We now turn to SIG-001. Inspect state ownership, reactive dependencies, resource lifetimes, and the consumer contract.

## SIG-001 · Scenario

You maintain `@acme/ui`, the component library that every Acme product team builds on. A teammate opens a pull request for a new multi-select chip group. Product teams pass the options in, and some options arrive pre-selected.

## SIG-001 · Scenario · code 1/4

The chip group renders one native button per option.

## SIG-001 · Scenario · code 2/4

Trace the field initializers.

## SIG-001 · Scenario · code 3/4

Inspect the effect and toggle together.

## SIG-001 · Scenario · code 4/4

In the correction, the source is the options input.

## SIG-001 · Interview question

**Interviewer:** What problems do you see, and how would you fix each one? There are at least three. One of them freezes the page as soon as the component renders.

[pause 5s]

## SIG-001 · 1. The initial selection is read before the input has a value

Field initializers run inside the constructor, before Angular has set any input. `this.options()` returns the default, `[]`, so the initial selection is always empty. Options the consumer marks `selected: true` never appear selected, and nothing reports an error.

## SIG-001 · 1. The initial selection is read before the input has a value

If someone later makes the input required to "fix" it, the same line fails louder: reading a required input before it is set throws `NG0950` at runtime, and recent Angular compilers reject it at build time with `NG8118`.

## SIG-001 · 1. The initial selection is read before the input has a value

Fix: never read an input during construction. Derive the initial selection from the input reactively (see issue 3).

## SIG-001 · 2. `toggle` mutates the array, so nothing updates

`update` returns the same array it was given. Signals compare values with `Object.is`, so the signal sees no change and notifies nobody. `selectedSet` keeps its cached value, `aria-pressed` never changes, and the screen is out of step with the state.

## SIG-001 · 2. `toggle` mutates the array, so nothing updates

There is a second problem in the same lines: `selectionChange` emits the internal array. A consumer that sorts or pushes into the array it receives corrupts the component's state.

## SIG-001 · 2. `toggle` mutates the array, so nothing updates

Fix: return a new array from `update`, and type public arrays as `readonly` to reject mutations in typed consumer code:

## SIG-001 · Answer · code 1/1

The correction preserves valid selections and publishes fresh arrays for user changes.

## SIG-001 · 3. The `effect` never stops running

The effect reads `selected()` and writes `selected` with the result of `filter`, which is always a new array. Writing a new value to a signal the effect depends on schedules the effect again, so it runs forever and the page freezes as soon as the component renders. (This is easy to miss in review because each line looks reasonable.)

## SIG-001 · 3. The `effect` never stops running

Even without the loop, copying one signal into another is the job of a derived signal, not an effect:

## SIG-001 · 3. The `effect` never stops running

Effects run on their own schedule, so other code (a `computed`, a parent's binding) can briefly read selections that point at options that no longer exist. Writing signals inside effects makes the data flow hard to follow, and loops like this one are easy to create.

## SIG-001 · 3. The `effect` never stops running

Fix: `linkedSignal`. It is writable, like `signal`, but it recalculates whenever its source changes, and it receives the previous value so it can keep selections that are still valid.

## SIG-001 · Answer · code 1/4

The correction preserves valid selections and publishes fresh arrays for user changes.

## SIG-001 · Answer · code 2/4

The correction preserves valid selections and publishes fresh arrays for user changes.

## SIG-001 · Answer · code 3/4

The correction preserves valid selections and publishes fresh arrays for user changes.

## SIG-001 · Answer · code 4/4

The correction preserves valid selections and publishes fresh arrays for user changes.

## SIG-001 · What a strong candidate also mentions

The group needs an accessible name. `role="group"` is announced, but without `aria-label` or `aria-labelledby` a screen-reader user hears "group" and nothing else. Add an input for the label. Pruning is a behaviour change consumers must know about. When options change and a selection disappears, the fixed version does not emit `selectionChange`. That is a deliberate choice (outputs report user actions), and it must be documented, because a consumer storing the selection elsewhere will now hold a stale value. Controlled use. Consumers cannot set the selection after the first render. A `model()` makes the component usable both controlled and uncontrolled (see SIG-002).

## SIG-001 · Runtime boundary

A clarification about the public array: readonly is a compile-time contract, not runtime freezing. The minimal correction still emits the internal array reference. A defensive snapshot prevents a consumer from changing the component state through that emitted array. Use a copied array or a deliberately documented immutable contract where runtime isolation is required.

## SIG-001 · Follow-up 1

**Interviewer:** When is an effect the right tool in a library component? Give one example.

[pause 5s]

An effect is appropriate when a signal must synchronize with an imperative, non-reactive API. For example, a chart component may pass a newly derived data series to a third-party chart instance. The effect reads the series and calls the chart update method; cleanup releases any resource created for that run. It should not calculate the series by writing another application signal. Use a computed for the series and an effect only at the boundary to the chart. If the operation depends on the finished DOM, choose a post-render callback instead. In an interview, identify the external system, why template binding cannot do the job, and how the resource is released.

## SIG-001 · Follow-up 2

**Interviewer:** A consumer passes a new array with the same options on every change detection. What happens to linkedSignal, and how would you protect against it?

[pause 5s]

A new reference can invalidate the source, causing the linked computation to reconcile again. Our fixed chip implementation preserves previous values that remain valid, so equivalent options do not intentionally reset the user's selection. However, filter still allocates a new selection array, which can produce unnecessary downstream notifications. First recommend a stable signal or computed to the consumer rather than calling a method that creates arrays in the template. Where measurements justify it, return the previous selection reference when reconciliation produces the same ordered identifiers, or use an equality rule for the linked value. Do not compare only option count: changed identifiers or selected flags may matter. Add a test for equivalent replacement options and one for genuinely removed options, so an optimization cannot hide real changes.

## SIG-001 · Follow-up 3

**Interviewer:** Should selectionChange fire when pruning removes a selection? Argue both sides.

[pause 5s]

If selectionChange means a user committed a selection change, automatic pruning should not emit that event. The consumer initiated an options change, and an echoed output could create redundant updates or feedback loops. This convention is easy to understand when all outputs represent interactions. The cost is that a parent storing the selected identifiers independently can become stale unless it also reconciles them. If the output means any effective selection change, pruning should be observable. That keeps dependent application state synchronized, but you must define ordering, initialization behavior, and how the parent avoids echoing the same state back indefinitely. I would document the existing user-action contract and offer a separate effective-state notification only when consumers need it. The name, examples, and tests should distinguish the meanings.

## SIG-002 · Scenario

We now turn to SIG-002. Inspect state ownership, reactive dependencies, resource lifetimes, and the consumer contract.

## SIG-002 · Scenario

A product team reports a bug against `@acme/ui`: "When we reset our settings form, the switches still show the old values." Here is the switch component they are using:

## SIG-002 · Scenario · code 1/2

The template reads isOn, while the parent supplies checked.

## SIG-002 · Scenario · code 2/2

The initialization hook copies the parent only once.

## SIG-002 · Scenario

The team uses it like this:

## SIG-002 · Scenario · code 1/1

The template reads isOn, while the parent supplies checked.

## SIG-002 · Interview question

**Interviewer:** Why does the reset not work? Fix the component, then tell me what other problems a consumer could run into with your fixed version.

[pause 5s]

## SIG-002 · 1. Two sources of truth, synchronised once

`isOn` copies `checked` once, in `ngOnInit`. After that the component ignores its input. Reset changes `settings.emailAlerts`, Angular passes the new value to `checked`, and nothing reads it: the switch keeps showing `isOn`.

## SIG-002 · 1. Two sources of truth, synchronised once

The pattern "copy an input into local state" is the root cause, and it is common in libraries because the component needs to change the value itself and accept changes from outside.

## SIG-002 · 1. Two sources of truth, synchronised once

Fix: `model()`. A model is a writable signal that is also an input and an output. The parent writes it through the binding, the component writes it with `set` or `update`, and every write from inside emits `checkedChange`, so `[(checked)]` works with no extra code. There is only one value.

## SIG-002 · Answer · code 1/2

The corrected model commits immediately; a controlled input instead waits for parent acceptance.

## SIG-002 · Answer · code 2/2

The corrected model commits immediately; a controlled input instead waits for parent acceptance.

## SIG-002 · 1. Two sources of truth, synchronised once

This is also non-breaking for consumers: the public names `checked` and `checkedChange` are unchanged.

## SIG-002 · 2. A rejected change leaves the switch out of sync

This is the problem with the fixed version that strong candidates find. Suppose a consumer binds one way and decides in the handler whether to accept the change:

## SIG-002 · Answer · code 1/1

The corrected model commits immediately; a controlled input instead waits for parent acceptance.

## SIG-002 · 2. A rejected change leaves the switch out of sync

The user clicks. The model flips itself to `true` and emits. The parent refuses and leaves `allowed` as `false`. Angular only writes an input when the bound value changes, and `allowed` was `false` before and is still `false`, so nothing is written back. The switch shows "on" while the application believes it is "off".

## SIG-002 · 2. A rejected change leaves the switch out of sync

There is no single right answer, but a library must pick one and document it:

## SIG-002 · 2. A rejected change leaves the switch out of sync

Document ordinary two-way binding as an immediate-commit contract. A parent that must approve or reject a request needs a controlled contract. An immediate change-and-revert can leave the local model out of sync. Offer a separate request output (for example `checkedChangeRequest`) and a strictly controlled mode where the component never changes its own value.

## SIG-002 · 3. `<ui-switch checked>` does not work

Consumers expect HTML-like boolean attributes. A plain `input(false)` would need the `booleanAttribute` transform for `<ui-switch checked>` to mean `true`, but `model()` does not accept a `transform`. With strict templates the static attribute is a type error (a string `''` is not a `boolean`), which is at least caught at build time. Document `[checked]="true"`.

## SIG-002 · What a strong candidate also mentions

A disabled state. A switch with no `disabled` input forces consumers to wrap it or block clicks themselves. Use the native `disabled` attribute on the `<button>`, so it leaves the tab order and assistive technology reports it. Forms. Teams using reactive forms need a `ControlValueAccessor` as well (see API-004). The model and the form value must not become two sources of truth again. The accessible name. It comes from the projected content. A switch with no projected text needs an `aria-label` input, and the documentation must say so.

## SIG-002 · Strict parent authority

A clarification about rollback: an immediate two-way accept-and-revert can leave the final parent value identical to the last bound value. The component model may therefore remain changed. Do not rely on synchronous rollback for strict authority. Use a read-only checked input and checkedChangeRequest output, with the template rendering only the accepted parent state. The separate controlled example demonstrates both acceptance and rejection.

## SIG-002 · Follow-up 1

**Interviewer:** Would moving the copy into ngOnChanges have fixed the reset bug? What would still be wrong?

[pause 5s]

It can fix the case where the parent actually changes the input, because each new bound value is copied into local state. It does not remove the two sources of truth. If the component changes its local state and the parent rejects the proposed value without changing its binding, there may be no input change and no lifecycle callback to undo the local state. You have also introduced an ordering rule between local updates and parent updates that must be maintained indefinitely. A model removes the duplicate storage for ordinary two-way binding. A controlled input and request output is clearer when the parent must approve changes. The right answer starts with ownership, not with replacing one lifecycle hook with another.

## SIG-002 · Follow-up 2

**Interviewer:** How would you write a test that proves the rejected-change behavior you chose?

[pause 5s]

Mount a parent host with checked false and an event handler that records the proposed true value but refuses to update accepted state. Click the actual button. Assert that the request was received, the parent remains false, and the rendered checked state also remains false under the controlled contract. Then change the handler to accept the next request and assert that both parent and view become true. Test the ordinary model contract separately: with an unchanged one-way parent binding, show that a local model change can remain true. Also exercise an immediate two-way accept-and-revert in the same event cycle, because the final parent value can equal its previous binding. That boundary explains why the lesson recommends an explicit request API for vetoable changes rather than relying on a rollback timing trick.

## SIG-002 · Follow-up 3

**Interviewer:** When would you choose input plus output over model, even for a value the component can change itself?

[pause 5s]

Choose input plus output when the component proposes changes but another owner decides whether to commit them. Examples include a server-authorized setting, a confirmation step, or a component whose value is part of a larger transactional form. The output can carry a request while the read-only input represents accepted state. This can also support an input transform, such as booleanAttribute, that model does not provide. Choose model when committing the local value immediately and emitting its change matches the intended contract, especially straightforward two-way binding. The tradeoff is convenience versus authority. Neither API automatically integrates every forms, validation, or accessibility requirement. State the contract with an example where the parent refuses a request; that example makes the difference concrete.

## SIG-003 · Scenario

We now turn to SIG-003. Inspect state ownership, reactive dependencies, resource lifetimes, and the consumer contract.

## SIG-003 · Scenario

A popover in `@acme/ui` opens below an anchor element and closes on Escape. Product teams report two bugs: "pages get slower the more often users open popovers", and "the popover sometimes appears in the wrong place". Here is the component:

## SIG-003 · Scenario · code 1/3

The panel exists only while open is true, and its positioning uses fixed coordinates.

## SIG-003 · Scenario · code 2/3

The first effect adds an anonymous document handler without an inverse operation.

## SIG-003 · Scenario · code 3/3

The corrected keyboard handler has a stable identity for this effect run.

## SIG-003 · Interview question

**Interviewer:** Explain both bugs, then fix the component. Also tell me what you would still be unhappy about before shipping it to forty product teams.

[pause 5s]

## SIG-003 · 1. "Pages get slower": a listener leak

Every time `open` becomes `true`, the first effect adds a new `keydown` listener, and nothing ever removes one. After five opens there are five listeners. They also outlive the component: each closure holds `this`, so a destroyed popover and everything it references stay in memory for the life of the page. Every Escape press runs every listener ever added.

## SIG-003 · 1. "Pages get slower": a listener leak

Fix: register cleanup. An effect's callback receives `onCleanup`. The cleanup runs before the effect runs again and when the effect is destroyed, which happens automatically when the component is destroyed.

## SIG-003 · 2. "Wrong place": measuring the DOM in an `effect`

`effect()` is for synchronising state with something outside Angular's templates. It is not timed to the DOM: it runs during change detection, so the measurement can happen against a layout that is not final. Reading layout (`getBoundingClientRect`) and then writing styles in the same callback, for many popovers, also forces the browser to recalculate layout repeatedly.

## SIG-003 · 2. "Wrong place": measuring the DOM in an `effect`

Fix: `afterRenderEffect`. It runs after Angular has updated the DOM, splits work into phases (`earlyRead`, `write`, `mixedReadWrite`, `read`) so reads and writes from many components are batched, and never runs during server-side rendering, where there is no layout to measure.

## SIG-003 · Answer · code 1/4

The correction pairs registration with cleanup and separates geometry reads from coordinate writes.

## SIG-003 · Answer · code 2/4

The correction pairs registration with cleanup and separates geometry reads from coordinate writes.

## SIG-003 · Answer · code 3/4

The correction pairs registration with cleanup and separates geometry reads from coordinate writes.

## SIG-003 · Answer · code 4/4

The correction pairs registration with cleanup and separates geometry reads from coordinate writes.

## SIG-003 · Fixed version

Closing on Escape now also returns focus to the anchor. Without that, keyboard users lose their place when the panel disappears.

## SIG-003 · What a strong candidate is still unhappy about

Position only updates when signals change. Scrolling, resizing, or the anchor moving leaves the panel behind. A shared library should use a tested positioning engine, such as the CDK Overlay, or CSS anchor positioning where the supported browsers allow it, rather than hand-rolled coordinates. Escape is global. Every open popover closes on one Escape press, including ones underneath a dialog. Escape should close only the topmost layer. Edges of the viewport. There is no flipping when the panel would go off-screen. Semantics. The panel has no role, label or focus behaviour. Whether it is a `dialog`, a menu or a tooltip decides the ARIA pattern, and the component cannot guess.

## SIG-003 · Follow-up 1

**Interviewer:** Why is once true on the listener not a fix?

[pause 5s]

Once removes the listener after the first keydown event, not after the first Escape key. Pressing Tab or an arrow key can remove the handler while the popover is still open, so the next Escape does nothing. It also does not necessarily release a listener that never receives an event after the component closes or is destroyed. The intended lifetime is the period during which this layer is open. Register the handler when open becomes true and remove it through the effect cleanup when that run is replaced or destroyed. This test should include a non-Escape key before Escape and destruction without any key event. Those sequences expose why the browser option and the application lifecycle are different.

## SIG-003 · Follow-up 2

**Interviewer:** When is a plain effect the right tool in a component library? Give an example.

[pause 5s]

The open-state keyboard registration itself is a reasonable example. It connects reactive open state to a document event listener and does not depend on final element geometry. Another example is persisting a documented user preference to browser storage, provided the implementation handles browser availability, failures, and the correct lifetime. Avoid using an effect to copy one signal into another simply because you want the second to follow the first. Use a derivation for that relationship. An ordinary effect also should not be chosen for layout measurement merely because it eventually runs. Identify what timing the external operation requires. A listener can be installed without reading layout; measuring a rendered anchor requires a different integration point.

## SIG-003 · Follow-up 3

**Interviewer:** How would you make Escape close only the topmost layer across popovers, menus, and dialogs from different teams?

[pause 5s]

Introduce a shared layer coordinator or use the overlay infrastructure already provided by the component library. Each active layer registers a token, its ordering, an Escape handler, and the focus-restoration target. One shared keyboard dispatcher asks the topmost eligible layer to handle Escape, rather than every component independently subscribing and closing itself. Unregister a layer when it closes or is destroyed. Define what happens when a layer declines Escape, when a modal dialog is above a popover, and when the original focus target has disappeared. Test nested layers and verify that only the intended layer closes while the lower layer stays open. Keep the contract shared across teams; separate coordinators in each product package can recreate the global-listener problem.

## SIG-004 · Scenario

We now turn to SIG-004. Inspect state ownership, reactive dependencies, resource lifetimes, and the consumer contract.

## SIG-004 · Scenario

`@acme/ui` ships a data table. One product team reports: "After a user sorts the table, our 'Export CSV' button exports rows in the sorted order, and our row numbers are wrong." Another team reports that the table re-renders every row whenever anything on their page changes.

## SIG-004 · Scenario · code 1/4

Inspect the header interaction and the row tracking expression.

## SIG-004 · Scenario · code 2/4

The computed reads the consumer array, sorts it in place, and returns a wrapper containing that same array.

## SIG-004 · Scenario · code 3/4

The corrected header contains a native button and exposes the active sort direction.

## SIG-004 · Scenario · code 4/4

The readonly input type rejects accidental in-place sort at compile time.

## SIG-004 · Interview question

**Interviewer:** What is causing each reported bug, and what else would you change before this table is used across the organization? There are at least four issues.

[pause 5s]

## SIG-004 · 1. `sort()` mutates the consumer's array

`Array.prototype.sort` sorts in place and returns the same array. The `computed` therefore reorders the array the product team passed in, which is why their export and row numbers follow the table's sort order. A component must never modify data it receives through an input; the consumer owns it.

## SIG-004 · 1. `sort()` mutates the consumer's array

There is a second effect: `this.rows()` returns the same reference after sorting, so if the consumer keeps that reference in its own signal, its own computeds see no change even though the contents moved.

## SIG-004 · 1. `sort()` mutates the consumer's array

Fix: sort a copy, with `toSorted` (ES2023) or `[...rows].sort(...)`.

## SIG-004 · 2. `track $index` ties DOM rows to positions, not records

After sorting, row 0 holds a different record but Angular reuses the same `<tr>`. Any state inside a row (a focused checkbox, an expanded detail, a running animation) stays with the position and now belongs to the wrong record. It also means every row is re-bound on every sort.

## SIG-004 · 2. `track $index` ties DOM rows to positions, not records

Fix: let the consumer say how to identify a row, for example a `trackBy` input: `trackBy = input<(row: T) => unknown>(row => row)`, and use `track trackBy()(row)`.

## SIG-004 · 3. Expensive work on every new array, and one oversized `computed`

The second report usually comes from a binding like `[rows]="getOpenOrders()"`. That expression creates a new array on every change detection pass, so `rows` changes every time, the `computed` re-runs, and the whole table is re-sorted. With new row objects after every fetch, `track $index` (issue 2) cannot tell which rows are the same records either.

## SIG-004 · 3. Expensive work on every new array, and one oversized `computed`

The table cannot stop a consumer from passing a new array, but it can avoid making it worse:

## SIG-004 · 3. Expensive work on every new array, and one oversized `computed`

Keep each `computed` narrow. `view` bundles the rows and the count into a new object, so anything that reads `view().count` updates whenever the rows do. Separate `sortedRows` and `rowCount` computeds update independently. Use the `equal` option when a recomputation often produces an equivalent value that should not notify readers. Document the contract: pass a stable reference, ideally a signal or `computed` in the consumer, and provide a `trackBy` so re-fetched records keep their rows.

## SIG-004 · 4. Sorting is not accessible

A click handler on `<th>` cannot be reached by keyboard and is not announced as interactive. The header needs a real `<button type="button">` inside it. The current sort is invisible to assistive technology. The sorted header needs `aria-sort="ascending"` or `"descending"`; leave the attribute off unsorted columns rather than setting `"none"` everywhere, which adds noise.

## SIG-004 · 5. Locale-unaware and type-unaware comparison

`String(value).localeCompare` sorts `10` before `9`, sorts dates as text, and uses the browser's default locale. A shared table should accept a comparator per column and default to `Intl.Collator` with `numeric: true`.

## SIG-004 · Answer · code 1/5

The correction preserves consumer data, tracks records, and provides accessible sorting controls.

## SIG-004 · Answer · code 2/5

The correction preserves consumer data, tracks records, and provides accessible sorting controls.

## SIG-004 · Answer · code 3/5

The correction preserves consumer data, tracks records, and provides accessible sorting controls.

## SIG-004 · Answer · code 4/5

The correction preserves consumer data, tracks records, and provides accessible sorting controls.

## SIG-004 · Answer · code 5/5

The correction preserves consumer data, tracks records, and provides accessible sorting controls.

## SIG-004 · Fixed version

`readonly T[]` in the input type documents the contract ("the table will not change your array") and makes the compiler reject any future in-place `sort`.

## SIG-004 · Follow-up 1

**Interviewer:** The consumer passes a new array on every fetch, but most records are identical. How would you avoid rebuilding every row?

[pause 5s]

Track each row with a stable unique record identifier supplied by the consumer. Angular can then preserve the view associated with that record even if the array and record objects are newly allocated. Tracking by object identity alone loses that benefit when the fetch replaces objects; tracking by index can attach local state to the wrong record after sorting. Preserve references for unchanged records upstream if that is feasible, and use stable computed inputs to avoid unnecessary sorting on unrelated changes. Do not claim that tracking stops every render or every binding update. It chiefly establishes view identity. Measure sorting work, view creation, and binding updates separately, because they have different causes. Test with new objects containing the same identifiers and with genuinely added and removed records.

## SIG-004 · Follow-up 2

**Interviewer:** Should the sort state be internal, a model, or both? What does each choice mean for teams that sort on the server?

[pause 5s]

Internal sort state is convenient for an entirely client-side table: the component owns the interaction and derives the displayed rows locally. A model can expose that state for two-way use while retaining convenient local defaults. Server sorting needs a clearer boundary. A sort request should let the parent fetch a new page, and the table should not silently re-sort just that page as though it represented the full dataset. A controlled sort input plus request output supports server authority and rejected or pending requests. If both client and server modes are offered, make the mode explicit and document whether changing sort triggers local derivation or a request. Keep only one effective sort state within each mode. Test pending responses and stale fetches in the owning application rather than hiding network policy inside a generic table.

## SIG-004 · Follow-up 3

**Interviewer:** How would you announce Sorted by name, ascending after a user activates a header?

[pause 5s]

Keep a real button in the header so keyboard users can activate sorting, and expose the current direction with aria sort on the relevant header cell. If a supplemental announcement is needed, use a polite live region or the component library's LiveAnnouncer to report the accepted result, such as Sorted by name, ascending. Announce after the state has actually changed, not merely when a request was emitted, especially for server sorting. Avoid repeating a long message on every unrelated render or duplicating announcements unnecessarily. Maintain focus on the header button while rows reorder. Test the keyboard behavior and inspect the resulting accessibility attributes, then verify the announcement with the assistive technology supported by the project. A DOM assertion alone cannot prove what every screen reader will say.

## Final review checklist · 1

You have now examined every main question and follow-up in the signals topic. The APIs are useful because they express different kinds of ownership. Signal stores a writable fact. Computed derives a read-only fact. Linked signal maintains writable state whose validity depends on another fact. Model exposes a locally writable input and its change output. A controlled input and request output keeps the parent authoritative. Effect crosses into an imperative external system. After render effect handles work that depends on rendered browser DOM.

## Final review checklist · 2

When you answer these questions in an interview, lead with the observed defect and its mechanism. For the chip group, explain construction order, reference equality, and the feedback loop. For the switch, trace the two stored values and then discuss accepted versus requested changes. For the popover, identify the missing resource cleanup and the layout timing problem separately. For the table, explain input mutation, row identity, repeated computation, keyboard access, and comparison semantics. Then name a test that would fail before your correction and pass afterward.

## Final review checklist · 3

Finally, treat a shared component library as a contract with other teams. Document whether outputs represent interactions or effective state, what boolean syntax is accepted, what identifies a row, and what happens when options disappear. Keep minimal instructional fixes distinct from production overlay, forms, and accessibility requirements. The best answer is specific enough to implement and honest enough to state its limits. Use the transcript and code examples to revisit any section, and practice explaining the diagnosis without relying on the slide. That is the skill these scenarios are designed to develop.
