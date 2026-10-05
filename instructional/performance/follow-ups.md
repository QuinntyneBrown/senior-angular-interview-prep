## PERF-001 follow-ups

### Answer 1

Important notifications include a template-consumed signal changing, markForCheck, component setInput, bound template or host listeners, and async-pipe emissions. Attaching an already dirty view also participates. A raw promise, timeout, or plain field assignment is not a notification on its own. NgZone.run does not substitute for a zoneless notification, although it can remain relevant to zone-based consumers. Test async updates without manually forcing every render.

### Answer 2

Adapt the callback to a signal consumed by the template, an observable exposed through the async pipe, or a controlled markForCheck path. Keep subscription cleanup and stale callback handling tied to destruction. Avoid copying the data into an unobserved field and hoping another event triggers a render. If callbacks are extremely frequent, batch according to the UI's needs and profile the result, while preserving the final state. Retain zone-boundary optimizations where they matter for zone-based consumers.

### Answer 3

Search for zone lifecycle observables, plain fields written by promises or timers, subscriptions without teardown, and constructor DOM reads. Treat matches as review candidates. Run consumer hosts zoneless and exercise async completion, input updates, repeated interaction, and destruction. Add regression tests for missing notifications instead of forcing global change detection. Use profiling after correctness to find excessive work, and test supported framework ranges before claiming library-wide compatibility.
