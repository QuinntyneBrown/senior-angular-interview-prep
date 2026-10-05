# Follow-up answers

## SIG-001 follow-ups

**Interviewer:** When is an effect the right tool in a library component? Give one example.

[pause 5s]

An effect is appropriate when a signal must synchronize with an imperative, non-reactive API. For example, a chart component may pass a newly derived data series to a third-party chart instance. The effect reads the series and calls the chart update method; cleanup releases any resource created for that run. It should not calculate the series by writing another application signal. Use a computed for the series and an effect only at the boundary to the chart. If the operation depends on the finished DOM, choose a post-render callback instead. In an interview, identify the external system, why template binding cannot do the job, and how the resource is released.

**Interviewer:** A consumer passes a new array with the same options on every change detection. What happens to linkedSignal, and how would you protect against it?

[pause 5s]

A new reference can invalidate the source, causing the linked computation to reconcile again. Our fixed chip implementation preserves previous values that remain valid, so equivalent options do not intentionally reset the user's selection. However, filter still allocates a new selection array, which can produce unnecessary downstream notifications. First recommend a stable signal or computed to the consumer rather than calling a method that creates arrays in the template. Where measurements justify it, return the previous selection reference when reconciliation produces the same ordered identifiers, or use an equality rule for the linked value. Do not compare only option count: changed identifiers or selected flags may matter. Add a test for equivalent replacement options and one for genuinely removed options, so an optimization cannot hide real changes.

**Interviewer:** Should selectionChange fire when pruning removes a selection? Argue both sides.

[pause 5s]

If selectionChange means a user committed a selection change, automatic pruning should not emit that event. The consumer initiated an options change, and an echoed output could create redundant updates or feedback loops. This convention is easy to understand when all outputs represent interactions. The cost is that a parent storing the selected identifiers independently can become stale unless it also reconciles them. If the output means any effective selection change, pruning should be observable. That keeps dependent application state synchronized, but you must define ordering, initialization behavior, and how the parent avoids echoing the same state back indefinitely. I would document the existing user-action contract and offer a separate effective-state notification only when consumers need it. The name, examples, and tests should distinguish the meanings.

## SIG-002 follow-ups

**Interviewer:** Would moving the copy into ngOnChanges have fixed the reset bug? What would still be wrong?

[pause 5s]

It can fix the case where the parent actually changes the input, because each new bound value is copied into local state. It does not remove the two sources of truth. If the component changes its local state and the parent rejects the proposed value without changing its binding, there may be no input change and no lifecycle callback to undo the local state. You have also introduced an ordering rule between local updates and parent updates that must be maintained indefinitely. A model removes the duplicate storage for ordinary two-way binding. A controlled input and request output is clearer when the parent must approve changes. The right answer starts with ownership, not with replacing one lifecycle hook with another.

**Interviewer:** How would you write a test that proves the rejected-change behavior you chose?

[pause 5s]

Mount a parent host with checked false and an event handler that records the proposed true value but refuses to update accepted state. Click the actual button. Assert that the request was received, the parent remains false, and the rendered checked state also remains false under the controlled contract. Then change the handler to accept the next request and assert that both parent and view become true. Test the ordinary model contract separately: with an unchanged one-way parent binding, show that a local model change can remain true. Also exercise an immediate two-way accept-and-revert in the same event cycle, because the final parent value can equal its previous binding. That boundary explains why the lesson recommends an explicit request API for vetoable changes rather than relying on a rollback timing trick.

**Interviewer:** When would you choose input plus output over model, even for a value the component can change itself?

[pause 5s]

Choose input plus output when the component proposes changes but another owner decides whether to commit them. Examples include a server-authorized setting, a confirmation step, or a component whose value is part of a larger transactional form. The output can carry a request while the read-only input represents accepted state. This can also support an input transform, such as booleanAttribute, that model does not provide. Choose model when committing the local value immediately and emitting its change matches the intended contract, especially straightforward two-way binding. The tradeoff is convenience versus authority. Neither API automatically integrates every forms, validation, or accessibility requirement. State the contract with an example where the parent refuses a request; that example makes the difference concrete.

## SIG-003 follow-ups

**Interviewer:** Why is once true on the listener not a fix?

[pause 5s]

Once removes the listener after the first keydown event, not after the first Escape key. Pressing Tab or an arrow key can remove the handler while the popover is still open, so the next Escape does nothing. It also does not necessarily release a listener that never receives an event after the component closes or is destroyed. The intended lifetime is the period during which this layer is open. Register the handler when open becomes true and remove it through the effect cleanup when that run is replaced or destroyed. This test should include a non-Escape key before Escape and destruction without any key event. Those sequences expose why the browser option and the application lifecycle are different.

**Interviewer:** When is a plain effect the right tool in a component library? Give an example.

[pause 5s]

The open-state keyboard registration itself is a reasonable example. It connects reactive open state to a document event listener and does not depend on final element geometry. Another example is persisting a documented user preference to browser storage, provided the implementation handles browser availability, failures, and the correct lifetime. Avoid using an effect to copy one signal into another simply because you want the second to follow the first. Use a derivation for that relationship. An ordinary effect also should not be chosen for layout measurement merely because it eventually runs. Identify what timing the external operation requires. A listener can be installed without reading layout; measuring a rendered anchor requires a different integration point.

**Interviewer:** How would you make Escape close only the topmost layer across popovers, menus, and dialogs from different teams?

[pause 5s]

Introduce a shared layer coordinator or use the overlay infrastructure already provided by the component library. Each active layer registers a token, its ordering, an Escape handler, and the focus-restoration target. One shared keyboard dispatcher asks the topmost eligible layer to handle Escape, rather than every component independently subscribing and closing itself. Unregister a layer when it closes or is destroyed. Define what happens when a layer declines Escape, when a modal dialog is above a popover, and when the original focus target has disappeared. Test nested layers and verify that only the intended layer closes while the lower layer stays open. Keep the contract shared across teams; separate coordinators in each product package can recreate the global-listener problem.

## SIG-004 follow-ups

**Interviewer:** The consumer passes a new array on every fetch, but most records are identical. How would you avoid rebuilding every row?

[pause 5s]

Track each row with a stable unique record identifier supplied by the consumer. Angular can then preserve the view associated with that record even if the array and record objects are newly allocated. Tracking by object identity alone loses that benefit when the fetch replaces objects; tracking by index can attach local state to the wrong record after sorting. Preserve references for unchanged records upstream if that is feasible, and use stable computed inputs to avoid unnecessary sorting on unrelated changes. Do not claim that tracking stops every render or every binding update. It chiefly establishes view identity. Measure sorting work, view creation, and binding updates separately, because they have different causes. Test with new objects containing the same identifiers and with genuinely added and removed records.

**Interviewer:** Should the sort state be internal, a model, or both? What does each choice mean for teams that sort on the server?

[pause 5s]

Internal sort state is convenient for an entirely client-side table: the component owns the interaction and derives the displayed rows locally. A model can expose that state for two-way use while retaining convenient local defaults. Server sorting needs a clearer boundary. A sort request should let the parent fetch a new page, and the table should not silently re-sort just that page as though it represented the full dataset. A controlled sort input plus request output supports server authority and rejected or pending requests. If both client and server modes are offered, make the mode explicit and document whether changing sort triggers local derivation or a request. Keep only one effective sort state within each mode. Test pending responses and stale fetches in the owning application rather than hiding network policy inside a generic table.

**Interviewer:** How would you announce Sorted by name, ascending after a user activates a header?

[pause 5s]

Keep a real button in the header so keyboard users can activate sorting, and expose the current direction with aria sort on the relevant header cell. If a supplemental announcement is needed, use a polite live region or the component library's LiveAnnouncer to report the accepted result, such as Sorted by name, ascending. Announce after the state has actually changed, not merely when a request was emitted, especially for server sorting. Avoid repeating a long message on every unrelated render or duplicating announcements unnecessarily. Maintain focus on the header button while rows reorder. Test the keyboard behavior and inspect the resulting accessibility attributes, then verify the announcement with the assistive technology supported by the project. A DOM assertion alone cannot prove what every screen reader will say.

## Final review checklist

You have now examined every main question and follow-up in the signals topic. The APIs are useful because they express different kinds of ownership. Signal stores a writable fact. Computed derives a read-only fact. Linked signal maintains writable state whose validity depends on another fact. Model exposes a locally writable input and its change output. A controlled input and request output keeps the parent authoritative. Effect crosses into an imperative external system. After render effect handles work that depends on rendered browser DOM.

When you answer these questions in an interview, lead with the observed defect and its mechanism. For the chip group, explain construction order, reference equality, and the feedback loop. For the switch, trace the two stored values and then discuss accepted versus requested changes. For the popover, identify the missing resource cleanup and the layout timing problem separately. For the table, explain input mutation, row identity, repeated computation, keyboard access, and comparison semantics. Then name a test that would fail before your correction and pass afterward.

Finally, treat a shared component library as a contract with other teams. Document whether outputs represent interactions or effective state, what boolean syntax is accepted, what identifies a row, and what happens when options disappear. Keep minimal instructional fixes distinct from production overlay, forms, and accessibility requirements. The best answer is specific enough to implement and honest enough to state its limits. Use the transcript and code examples to revisit any section, and practice explaining the diagnosis without relying on the slide. That is the skill these scenarios are designed to develop.
