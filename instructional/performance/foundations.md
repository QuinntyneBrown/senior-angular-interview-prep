# Angular Performance: Zoneless Rendering and Resource Lifetimes

## Correct rendering comes before optimization

Welcome to the performance lesson. The question is a copy button that depends on zone.js, measures its width through a zone event, and resets its status too early after repeated clicks. We will first understand rendering notifications, then fix state, timing, layout, error feedback, and resource cleanup.

Performance is not just making a component execute fewer times. A fast component that fails to show the current state is incorrect. Start by tracing the operation: the click begins a clipboard request, the promise settles, the copied state changes, a timer later resets it, and the view must reflect both transitions. Ask which API tells Angular that each transition needs rendering.

A senior answer connects scheduling to observable behavior. It also questions whether the JavaScript work is needed. Measuring a button can be more complex and less reliable than allowing CSS to reserve space for both labels. Removing an unnecessary layout read improves performance and simplifies correctness at the same time.

## Zone-based and zoneless change detection

Zone-based applications use patched asynchronous activity as a broad indication that something may have changed. This can make plain fields appear to update after timers or promises. It is not a universal guarantee: work outside the zone, unpatched APIs, and native asynchronous behavior can still require explicit notification. Avoid teaching that every promise completion automatically fixes every state update.

Zoneless rendering relies on Angular notifications. Signals read by a template notify when they change. Bound template and host listeners, component setInput, markForCheck, and the async pipe are other important paths. A plain field assignment in an arbitrary asynchronous callback is not a notification. Neither is a raw timer merely because it ran.

OnPush is compatible with this model when the component observes its inputs and notifications correctly. It does not make all mutable state observable. Some dynamic-host library components require additional care for children with different assumptions. Test the behavior in a zoneless consumer rather than treating an OnPush annotation as proof of compatibility.

```ts
readonly copied = signal(false);
async copy(): Promise<void> {
  await navigator.clipboard.writeText(this.text());
  this.copied.set(true);
}
// A template that reads copied() receives a notification.
```

## Async boundaries and view notifications

A click listener can schedule a render before its awaited work finishes. If the handler later writes a plain copied field, that earlier render does not promise another check after the write. An unrelated event may make the label appear, which creates the misleading impression that the code usually works. Tests should isolate the completion and observe whether it schedules its own update.

Use a signal for state consumed by the template or explicitly mark a suitable view for checking. For observable data, the async pipe connects emissions to rendering. For third-party callbacks, adapt data at the boundary instead of requiring product teams to click somewhere else to refresh. NgZone.run is not itself a zoneless notification mechanism, although retaining run and runOutsideAngular can still matter for zone-based consumers.

Server rendering has a related but separate stability contract. Pending asynchronous work that must complete before serialization may need PendingTasks. A render notification tells Angular that a view changed; it does not automatically describe every server-side task. Keep browser clipboard actions out of server execution and document environment-dependent APIs.

## Use render hooks for DOM timing

NgZone onStable and related observables do not emit in a zoneless application. They are the wrong boundary for deciding that a view is ready. Use the supported render callbacks when a DOM operation truly depends on the rendered view. afterNextRender handles a one-time operation; a post-render effect can react to dependencies after rendering.

Separate geometry reads from style writes when doing coordinated DOM work. A write followed by a read can force layout repeatedly. Render phases help organize that work, but the best improvement can be removing the measurement entirely. Ask what the measurement is trying to guarantee, whether it survives translation and font loading, and whether CSS already expresses the requirement.

Render callbacks do not execute during server rendering. That is useful for browser-only DOM work, but it also means the initial server output should not depend on a callback that never ran. Give the component a sensible CSS-first state and use browser work as an enhancement where necessary. Test the measured result in a real browser if you make a layout claim.

## Prefer a layout that handles both labels

Locking a button to the width of Copy does not stop the longer label Copied from making it grow. Translations can reverse which label is longer, and a loaded font can change both widths. Measuring once before those changes is fragile. Place both labels in the same grid cell so the intrinsic width accommodates the larger one.

Hide the inactive label with visibility hidden. It continues to participate in layout but is removed from normal rendering and the accessibility tree. Display none would remove its contribution to width; opacity zero would leave it in the accessibility tree unless other measures were taken. The choice of hiding mechanism is part of both layout and naming behavior.

Verify the button's bounding rectangle before and after the status change with representative translated labels. Check the accessible name contains the visible label only. This is a concrete example of performance work that removes a layout read, a style mutation, a zone subscription, and timing assumptions while improving the user experience.

```css
.labels { display: inline-grid; }
.labels > span { grid-area: 1 / 1; }
.hidden { visibility: hidden; }
/* Both labels size the grid; only one is visible. */
```

## Timers and promises have resource lifetimes

Every timer has an owner and an end condition. Starting a new reset timer without cancelling the previous one lets an earlier click reset a later success message. Clear the old timer when beginning the next operation and before installing a new one. Clear it on destruction so callbacks do not update a component that no longer exists.

Promises introduce another edge case. Two clipboard requests can finish out of order. A first request can settle after a second one, creating a stale announcement or another reset timer. A completion can also arrive after destruction. Clearing a timer alone does not cancel an already pending promise. Use a request sequence and a destroyed-state check when the UI must ignore stale completions.

The source correction improves the timer behavior for ordinary sequential completions, but it does not fully guard those overlapping promise cases. We will provide an additional hardened teaching example and verify the sequence guard. State the limitation rather than presenting the minimal correction as a complete concurrency solution.

```ts
const request = ++this.requestId;
const text = this.text();
await navigator.clipboard.writeText(text);
if (this.destroyed || request !== this.requestId) return;
clearTimeout(this.timer);
this.copied.set(true);
this.timer = setTimeout(() => this.copied.set(false), 2000);
```

## Errors and announcements are part of completion

The clipboard API can reject because permission was denied, the environment is unsupported, or the page is not a secure context. Catch failures and provide useful feedback. Do not show Copied before the operation succeeds. Do not leave a rejected promise unhandled while the UI silently remains unchanged.

A changing button label is not a dependable status announcement for screen readers. A live announcer can communicate success or failure without moving focus. Success is ordinarily polite. An assertive failure announcement should be justified by urgency and interruption cost; it is not automatically required for every rejected clipboard request. Expose translatable messages to the application.

Keep the final state coherent when a later operation fails. Clear or replace stale success, avoid allowing an old completion to overwrite a newer failure, and keep the button operable for retry. Tests should cover success, failure, overlap, reset, and destruction. These are correctness cases that prevent seemingly random performance or rendering reports.

## Test notifications instead of forcing every render

A test that manually runs detectChanges after an asynchronous plain-field assignment can hide the production defect. For notification-sensitive cases, use zoneless change detection and wait for the fixture to become stable. Complete a controlled promise, then assert the visible label without forcing a render that Angular did not schedule.

Mock the clipboard boundary so success and failure are deterministic. Control pending requests independently to finish them out of order. Use a short configurable reset delay in the hardened teaching example to verify the timer path without a slow test. Destroy the fixture while a request is pending, then complete it and confirm no new timer or announcement is created.

Real browser tests are necessary for intrinsic layout and accessible names. A DOM emulator cannot prove that the two labels have the same outer button width or that native focus behaves correctly. Compile-time validation remains useful for types, but use the appropriate runtime evidence for every claim.

## Audit a library systematically

Search for zone lifecycle subscriptions, plain fields written by timers or promises, direct DOM measurements, subscriptions without cleanup, and effects that allocate resources without an inverse operation. These searches identify candidates; they do not prove that every match is a defect. Review each candidate according to its ownership and notification path.

Run representative consumers without zone.js and interact with components through their actual templates. Include asynchronous data, input changes, multiple instances, and destruction. Add regression tests where behavior fails. A debug check for unnotified binding changes can help find gaps, but do not fix failures by forcing global change detection after every callback.

Profile only after the behavior is correct. Look for repeated expensive derivations, layout thrashing, unnecessary allocations, and excessive renders using measured traces. A signal is not a performance certificate, and a faster benchmark that dropped needed updates is misleading. In the question walkthrough, explain both why the original fails and why the corrected mechanism supplies the missing notification.
