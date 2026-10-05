# Angular Signals: State Ownership and Component Contracts

## Learning goals and the review method

Welcome to this instructional lesson on Angular signals for senior engineers building a shared component library. We will first build a working mental model, then review four real scenarios from this repository: a chip selection that drifts, a switch that ignores its parent, effects that leak resources, and a table that mutates consumer data. You will see the faulty code, hear the question, have time to think, and compare your answer with a detailed explanation. We will also answer every follow-up question. Pause the video whenever you want more time to inspect the code.

These questions are not mainly about remembering function names. They test whether you can identify who owns a value, what invalidates a derivation, when a resource is acquired and released, and how a component behaves when another team uses it differently from your own application. A senior answer connects the reported symptom to a precise mechanism. It then proposes a correction, identifies a test that would catch the defect, and explains the effect on consumers.

Use four steps in each review. First, trace the state from the parent through the input to the rendered template. Second, identify every write and the event that causes it. Third, distinguish derived values from values that users can independently change. Fourth, examine the public contract: inputs, outputs, accessibility, and compatibility. This method works beyond signals, but signals make the dependency graph unusually visible. Our examples use the Angular version installed in this repository. Version-dependent behavior will be identified rather than assumed to apply to every older release.

## Writable signals and tracked reads

A signal is a value container with a getter function. Calling the getter reads the current value. In a reactive context, Angular also records that read as a dependency. The context matters: a computed derivation, an effect, and a template establish reactive dependencies. Reading a signal once in an ordinary constructor field initializer does not turn the resulting plain value into a reactive relationship. That distinction explains several bugs we will encounter.

Look at the counter example. We create a count with an initial value of zero. Calling count gives zero. Setting it to three replaces the value. Updating it with a function that adds one derives a new value from the current value. Set is useful when the new value already exists, such as a server response. Update is useful when the change depends on the current state. Neither operation is a promise to notify consumers regardless of the result. Equality still determines whether a change occurred.

The template reads count by calling it. It does not receive a snapshot that we must manually refresh. Angular knows that this view depends on the signal. That relationship also works with OnPush components: signal changes can mark a consuming component for a subsequent update. This is not a guarantee that every arbitrary mutable object, asynchronous callback, or property change becomes reactive. Ask which signal changed and which consumer read it. If you cannot point to that connection, the word reactive is hiding an assumption rather than explaining the behavior.

## Equality and immutable collection updates

Signals use referential equality by default, through Object dot is. For primitive values that is usually intuitive. Setting false to false does not notify consumers. With an array, however, the reference can stay the same while its contents change. Pushing into an existing array and returning that array from update does not create a different reference. A computed that previously read the array can retain a cached result because the signal did not report a change.

The two collection examples show the difference. The incorrect version pushes a value into the list and returns the same list. The corrected version returns a fresh array containing the previous elements and the new element. Removing an item with filter also produces a fresh array. The point is not that the syntax is fashionable. The new reference is the observable state transition that tells dependent code its cached result may be invalid.

Immutability also defines an ownership boundary. A component receiving an array should not sort it in place, append to it, or change consumer-owned records while calculating a view. Otherwise a table can unexpectedly change an export elsewhere in the application. A readonly array type helps the compiler reject common mutations. It is not a runtime freeze and does not deeply freeze objects inside the array. If you hand an internal array to untrusted JavaScript, a type annotation cannot stop that caller from mutating it. Copies, stable immutable contracts, or deliberate defensive freezing may be appropriate depending on the API and cost.

## Computed values are cached derivations

A computed is a read-only signal whose value is derived from other signals. Its computation is lazy: it runs when a consumer first reads it. Its result is memoized until a dependency changes. Reading the computed repeatedly without invalidation should reuse the cached result. This is why a computed is often a good place for a filtered list or a selected-value lookup, rather than an ordinary template method that repeats the work whenever it is called.

The total example reads quantity and unit price, then multiplies them. There is no reason to create a separate writable total and an effect that copies the multiplication result into it. Total is determined by two existing facts. Maintaining an extra stored total creates another write path and another opportunity for disagreement. A pure computed says directly what the value means. It also makes a useful test easy: change quantity, read total, and assert the expected result.

Keep a derivation pure. Do not emit an output, mutate an input array, or register an event listener while evaluating a computed. Consumers can read the result at times you do not control, and memoization means the computation is not an event handler. A derivation may allocate a new result, but it should not change the facts from which it derives that result. When a table sorts a copy of its input, that is a derivation. When it sorts the input itself, it is an unexpected write disguised as a calculation.

## Dynamic dependencies and narrow derivations

Dependencies are determined by the signals actually read during the latest execution, not by all the signals mentioned in the source code. In the conditional example, the detailed view reads the price only when showDetails is true. When it is false, the computation returns a simple label without reading price. A price change therefore does not invalidate that result through a dependency that was never established in that branch. When showDetails changes, the computation can establish a different set of dependencies.

This behavior makes narrow computeds useful. Imagine one computed that returns an object containing sorted rows and a count. Changing the sort may allocate a new wrapper even though the count is unchanged. Consumers interested only in the count now depend on the wrapper's identity. Separate sortedRows and rowCount computeds communicate the independent meanings more clearly. A custom equality function can suppress equivalent results, but it should express a real equivalence rule rather than conceal mutations or stale data.

Do not assume that equality prevents the expensive computation itself. Angular must obtain the new computed result before it can compare that result with the old one. If sorting thousands of records is the costly part, a result equality function does not eliminate the sort. First stabilize inputs and measure the cost. Then consider narrow dependencies, sensible caching, or a different data strategy. Deep comparison also has a cost, and an equality function that ignores a relevant field can leave the view stale. Correctness comes before suppressing notifications.

## Inputs and construction order

An input signal represents data supplied by Angular's binding system. Input declarations belong in component initialization, but consuming the eventual bound value during construction is different. Field initializers and constructors run before Angular has assigned the inputs for the first render. A non-required input read at that moment returns its declared default. A required input read before assignment can fail because there is not yet a value to read.

Suppose options has an empty-array default. If a selected field is initialized by immediately filtering options, selected starts empty even when the parent is about to supply selected options. Angular will later update the input signal, but selected is an independent writable signal created from an earlier snapshot. Nothing in that field initializer declares an ongoing dependency. Moving the snapshot to the first lifecycle callback can fix the first assignment while still leaving later changes unsynchronized.

The correct design depends on the meaning of the value. If selection is entirely determined by options, use a computed. If the user can edit selection but changes to options must reset or reconcile it, consider linkedSignal. If the parent owns the selection, make that ownership explicit in the input and output contract. Never pick a lifecycle hook as a substitute for defining state ownership. In a review, say what happens before binding, after the first binding, after user interaction, and after a later parent update. Those four moments reveal whether your design is actually complete.

## Linked signals for writable dependent state

A linked signal combines writable state with a dependency that determines when it should be recomputed. Unlike a computed, the user can change its value. Unlike an ordinary independent signal, it also knows that a source change affects the validity of that value. This is useful when a selected shipping method depends on available methods, or a selected chip list depends on the options that still exist.

The source and computation form lets you access both the new source and the previous linked value. On the first computation, initialize from the options marked selected. On subsequent option changes, retain the user's previous selections only where their identifiers still exist. This distinction matters. Reinitializing from selected flags on every new options array would erase the user's edits. Preserving everything forever would leave selections referring to deleted options. Reconciliation states the exact middle ground.

The source must itself communicate changes through signals. Mutating an options array in place without publishing a new value does not reliably trigger reconciliation. Conversely, a parent that creates a fresh but equivalent array on every check can cause unnecessary recomputation. Recommend a stable signal or computed on the consumer side. If you add equality, compare all fields relevant to the contract, not only labels or array length. Also decide whether automatic pruning produces an output. A user-action event and an effective-state event are different promises, and a shared library should not blur them.

## Models and two-way component binding

A model input is a writable signal exposed as a component input. Angular also creates a corresponding change output. A checked model creates checkedChange, allowing a parent to use the conventional two-way binding syntax. The component can update checked directly; it does not need a second local signal plus a manual synchronization effect. A parent change updates the same value that the template reads.

This solves the ordinary reset problem: the parent turns a setting off and the switch renders off because both use one model value. It also supports a component used without a parent binding, where the model's default and user updates provide local behavior. Those are useful capabilities, but the API still needs a documented contract. Does the component commit a change immediately, or does it merely request permission from the parent? A model naturally performs the former.

A rejected change exposes the difference. If the model flips to true while the parent keeps its one-way bound false unchanged, Angular has no changed parent value to write back. The switch can remain on. Even an immediate two-way change-and-revert can collapse to the same previously bound value before Angular processes the input. Do not promise that any synchronous rollback automatically repairs this. For strict parent authority or asynchronous approval, use a read-only input plus a request output and render only the parent's accepted state. We will show that alternative explicitly during the switch walkthrough.

## Choosing a controlled component contract

In the controlled example, the switch reads checked from an input and emits a requested value from a separate output. Clicking does not change an internal checked signal. If the parent accepts, it updates checked and the view changes. If the parent rejects, checked remains unchanged and the view remains unchanged. There is no speculative local commit to undo. This can be particularly useful for authorization, confirmation dialogs, or server-validated settings.

The tradeoff is that an unbound controlled component does not automatically maintain a useful local value. If you need both behaviors, distinguish them explicitly through an API that consumers can understand and test. Avoid silently combining an input, a model, and a second local signal while hoping synchronization will settle conflicts. Also choose output names carefully. A request event says an interaction occurred, not that the effective state changed. A change event normally implies a committed change.

Boolean syntax, disabled behavior, accessible names, and forms integration are part of the same contract. A model does not accept an input transform like booleanAttribute. Document property binding for its boolean value. A controlled input can use that transform when appropriate. Native button disabled behavior is usually preferable to ignoring clicks in an event handler alone. Reactive forms require a clear ControlValueAccessor relationship; they should not create a second hidden value that fights with the signal model. These concerns are not extras after the reactivity fix. They are what makes the fix usable across product teams.

## Effects connect state to external systems

Use an effect when reactive state must synchronize with a non-reactive system, such as a browser storage API, a charting library, or an imperative event registration. It tracks signal reads and reruns when those dependencies change. That is different from calculating another piece of application state. For a value determined by signals, start with a computed or a linked signal and only use an effect when an external side effect is genuinely required.

Consider the self-triggering pattern on screen. The effect reads selected and writes the result of filtering selected back into selected. Filter creates a fresh array even if the contents are identical. The write changes a dependency the effect has just read, scheduling another run. Each run writes another fresh reference. The problem is a feedback loop in the dependency graph, not a missing timeout. Adding a delay merely changes how fast the loop repeats. Using untracked to hide a dependency can remove one trigger while leaving an unclear synchronization design.

Effects also have lifecycle requirements. When a new run replaces an external resource, the old resource must be released. If an effect installs a document listener every time a popover opens, closing the popover should release that listener. Destroying the component must release it too. A correct answer identifies both the resource and its intended lifetime. It does not merely say that Angular cleans up effects, because Angular cannot infer how to undo an arbitrary browser API call inside an effect callback.

## Cleanup is part of resource ownership

An effect callback receives a cleanup registration function. Register the action that undoes what this run created. Angular invokes that cleanup before the next run and when the effect is destroyed. A normal component-scoped effect is destroyed with its owning context unless you deliberately opt into another lifecycle. Resource cleanup inside the effect is still your responsibility.

The listener example uses one named handler for addition and removal. The same event type, function identity, and capture setting must match. Creating a second anonymous function that looks identical is not enough: it is a different function object. Registering removal only in the component's destruction hook may release the last listener at the end, but it does not manage repeated open-close cycles if every opening created another handler.

A one-time listener is not the same lifetime. With once enabled, the first keydown event removes the listener, even if that key was not Escape. A user pressing Tab before Escape would disable the desired close behavior. This illustrates a general review technique: reason about events that do not satisfy the handler's inner condition. For subscriptions, timers, observers, and listeners, describe acquisition, repeated use, replacement, and destruction. That lifecycle explanation is more valuable than memorizing a cleanup API name.

## DOM work after rendering

Ordinary effects are not a general guarantee that the final browser layout is ready to measure. DOM placement may depend on elements created by a conditional template, changes in other components, styles, and layout. When work specifically depends on rendered DOM, afterRenderEffect provides a post-render integration point. Its callbacks do not run during server-side rendering, where there is no browser layout to inspect.

Separate reading layout from writing styles. The example reads an anchor rectangle in earlyRead, then passes the measurement to a write phase that positions the panel. The phase argument is exposed as a signal, so the write callback reads that measurement through its getter. Batching reads and writes across components helps reduce unnecessary layout recalculation. Mixing getBoundingClientRect with immediate style changes in many independent callbacks can force repeated layout work.

This is still only a minimal positioning example. Scrolling, resizing, clipping containers, viewport edges, stacked overlays, and focus restoration require more design. A shared library should usually build on an established positioning and overlay system rather than ship a few coordinate assignments as a complete solution. Rendering at the right time fixes one class of defect; it does not establish collision handling, layer ownership, or accessible semantics. Separate the demonstrated correction from what you would require before a production release.

## Row identity and accessible derived views

Signals do not replace DOM identity. When a list is sorted, tracking by index associates a view with a position. The record occupying that position can change while local state stays with the reused view. A focused checkbox or expanded row may now appear attached to a different record. A stable unique record identifier tells Angular which views correspond to the same logical rows even when their positions move.

Stable tracking and stable inputs solve different problems. Tracking can preserve views across a new array of records, but it does not automatically eliminate sorting work or all binding updates. A stable computed in the parent can avoid producing an equivalent filtered array on every unrelated check. A column-specific comparator can correctly handle dates or numeric data. Sorting a copy preserves ownership. These are complementary decisions, not one universal performance switch.

Accessibility also changes the implementation. A click handler on a table header does not provide a keyboard-operable control. Use a real button in the header. Put aria sort on the sorted header to expose direction, and decide whether a live announcement helps users understand the resulting change. A chip toggle uses pressed state; a switch uses checked state. Match semantics to the interaction rather than copying attributes between components. Readability, state correctness, keyboard operation, and a stable public contract should be verified together.

## How to prove the correction

Before we begin the questions, turn each claim into a concrete observation. For immutable selection updates, inspect both the selected values and the rendered pressed state after a click. For linked selection, remove an option and confirm that invalid selections disappear while valid user choices remain. For a parent reset, change the bound value and confirm that the displayed switch follows it. For rejection, deliberately keep the parent's accepted value unchanged and verify the controlled contract.

For cleanup, open and close the popover repeatedly and confirm that the active listener count returns to zero. Destroy it while open and confirm cleanup again. For positioning, measure the anchor in an actual browser and compare the panel's assigned coordinates after rendering. For a table, retain a copy of the original order, sort the displayed view, and confirm that the consumer's array is unchanged. Keep a DOM reference for one record and confirm it remains that record's row after reordering.

Compilation is necessary but does not prove these behaviors. Strict template checking catches invalid bindings and missing members, but it cannot establish event lifetime or browser layout. A mocked rectangle does not prove that real layout occurs at the right time either. Conversely, one working browser demonstration does not prove every locale, assistive technology, or server-rendering scenario. State the conditions you actually checked, then explain the remaining production requirements. That evidence-first habit is the difference between an attractive answer and a dependable engineering decision.
