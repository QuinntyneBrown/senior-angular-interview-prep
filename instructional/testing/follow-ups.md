## TST-001 follow-ups

### Answer 1

Expose task-level operations and observable state: select a tab by label, read the selected label, send a supported key, and inspect focus when that is meaningful. Hide private fields, raw nodes, styling classes, and internal component hierarchy. The harness can use internal selectors because the library owns their maintenance. Publish filters and useful errors, and version the harness API. If consumers still need to query private DOM after obtaining the harness, revisit the missing supported operation.

### Answer 2

Verify a connected persistent live region receives the intended new text with the chosen politeness and timing, or verify the announcer boundary in a focused unit test. Then use real browser integration to ensure the region exists and updates. An automated DOM assertion cannot prove the exact speech emitted by a screen reader. Perform manual checks on supported combinations for repetition, interruption, and rapid changes, and record those limits in the test evidence.

### Answer 3

Classify flakes before changing thresholds: fonts, animation, data, timing, viewport, and actual layout races need different fixes. Freeze irrelevant variability and wait for a deterministic ready condition. Map each screenshot to a risk, keep representative themes and states, and remove redundant captures only when coverage remains. Review baseline changes deliberately. Do not approve all two thousand images blindly or disable the suite; rebuild a smaller reliable signal with clear ownership.
