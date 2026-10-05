## A11Y-001 follow-ups

### Answer 1

A tooltip supplies supplemental explanation; the icon button still needs a name before it appears. Show it on keyboard focus as well as pointer hover, allow Escape to dismiss it, and avoid moving focus into a noninteractive tooltip. Associate useful descriptive content without making the name unexpectedly verbose. Ensure hoverable, dismissible, and persistent behavior where the content criterion applies. If the popup contains interactive controls, it is a different pattern and should not be presented as a simple tooltip.

### Answer 2

Use labelledby when visible text already provides the intended label or when combining a visible action with contextual text is clearer than duplicating a string. It keeps spoken wording aligned with the visible interface and can improve localization maintenance. The referenced elements need stable unique identifiers. Use aria-label for an otherwise unnamed icon control when no suitable visible text exists. Do not add both casually and assume both will be spoken; naming precedence determines the result.

### Answer 3

Run an accessibility scanner in the rendered product and add a browser test that queries buttons by their accessible name. Cover states where icons or labels change and multiple component instances. Required input typing can help library consumers, but an empty string can still pass a string type. Add runtime development diagnostics or tests for empty labels where useful. Automated checks establish that a name exists, not that every name is meaningful, so review representative wording as well.

## A11Y-002 follow-ups

### Answer 1

Detect a pointer interaction outside the dialog's content rectangle and route it through the component's normal close request. A dialog-target click alone can also occur in content padding, so account for geometry and pointer down/up behavior to avoid accidental closure after dragging. Make backdrop dismissal an explicit policy rather than a universal default. A destructive confirmation or unsaved form may require deliberate cancellation. Keep Escape and a visible close or cancel control available according to the product's requirements.

### Answer 2

Usually focus the least destructive action so an accidental Enter does not commit the destructive operation. If the dialog begins with important structured information, focus a static heading or paragraph with tabindex minus one so the content can be read first. Choose according to the task rather than always focusing the first element in DOM order. Give the dialog a meaningful name and ensure the destructive action is clear. Confirm focus restoration and a sensible fallback if the invoking item is deleted.

### Answer 3

In a real browser, focus the invoking button, open the modal, verify focus enters, and press Tab and Shift Tab to ensure background controls are unreachable. Press Escape and verify the model closes and focus returns. Try programmatically focusing a background control while the modal is open to check native inertness. Cover close-button and form-dialog paths too. DOM attributes alone do not prove native modality; showModal and actual interaction are the behavior under test.

## A11Y-003 follow-ups

### Answer 1

Use manual activation when showing a panel is slow or costly, such as a network request or heavy render. Arrows move focus, while Enter or Space commits selection. Automatic activation is appropriate when panel changes are immediate and moving through tabs remains responsive. Keep focused and selected indices separate for manual activation and document the keyboard model. Do not change between models unpredictably based on a transient request duration.

### Answer 2

Keep tab roles, selection, panel relationships, and the one-tab-stop strategy intact. Scroll the focused tab into view and make scroll controls named native buttons if they are needed. The extra controls should not cause the arrow handler to treat them as tabs or hide selected tabs from assistive technology. Test touch, keyboard, narrow layouts, and right-to-left direction. A visual overflow solution should preserve the widget's semantic interaction model.

### Answer 3

FocusKeyManager can manage active items, wrapping, orientation, disabled skipping, and typeahead depending on configuration. It can reduce bespoke traversal code. You still own tab semantics, selected state, panels, identifiers, rendering, and automatic versus manual activation. It also introduces an adapter contract and a CDK dependency that must fit the supported framework range. Use it when the shared behavior outweighs that cost, and test the complete component rather than assuming the manager supplies accessibility automatically.

## A11Y-004 follow-ups

### Answer 1

Assistive technology often observes changes to an already registered live region. If the region and its first message appear in one insertion, some combinations treat it as initial content rather than an update to announce. Keep a persistent empty region, then change its text after the relevant interaction. Timing varies across platforms, so a delayed write is not a universal guarantee. Verify the DOM sequence automatically and test announcements with the supported browser and screen reader combinations.

### Answer 2

Polite is usually appropriate for field validation while the user is entering data. Assertive can interrupt the current speech and should be reserved for genuinely urgent information. Repeated assertive errors on every keystroke can make a form difficult to use. Decide when errors become visible, connect the error as a description, and avoid announcing unchanged messages repeatedly. Submission may need an error summary and deliberate focus management instead of several competing live announcements.

### Answer 3

Prefer a form-field that wraps a projected native input enhanced by a directive, so native attributes stay on the real control. The field and directive can share a control interface through dependency injection and register label, helper, and error identifiers. If an internal input is necessary, document explicit attribute forwarding and a focus API. Do not assume arbitrary attributes on the wrapper automatically reach the descendant. Include autocomplete and forms integration in consumer examples.

## A11Y-005 follow-ups

### Answer 1

Speech may skip, merge, or interrupt rapid updates; do not promise that both counts are read exactly. Batch progress updates and announce a useful final summary, while keeping current visible status available. A live announcer can replace an outdated progress message rather than queueing every intermediate number. Avoid repeatedly speaking the entire toast history. Test the message sequence and manually evaluate the supported assistive technology to choose a useful cadence.

### Answer 2

A named region can make a persistent notification history discoverable, especially if it contains actions users may revisit. But turning every transient toast into a landmark creates navigation noise. Prefer one meaningful named outlet when it serves a navigable purpose, and use a separate status announcement channel for new messages. Do not move focus to the region merely because a toast appeared. Evaluate the page's existing landmarks and the user's recovery task.

### Answer 3

Automate the structural contract: a persistent connected live region, the intended politeness, and the new message reaching it after the event. Spy on a live announcer at a unit boundary only when testing the call contract; also exercise the browser integration. A DOM test cannot prove the exact spoken output, so include manual screen reader checks for repeated messages, interruption, and timing. Document the tested combinations rather than declaring announcement behavior universally certified.

## A11Y-006 follow-ups

### Answer 1

Represent selection as a collection, add aria-multiselectable true, and expose aria-selected for each option. Choose an APG-supported multiple-selection keyboard model. In a modifier-free model, Space toggles the active option, with optional range and select-all behavior documented. Keep focus independent of selection so navigation does not unexpectedly clear choices. Define disabled behavior, output payloads, and reconciliation when options disappear. This is a new public contract, not just changing value to an array.

### Answer 2

Rendering ten thousand options can cost layout and memory, but virtualization can remove the element referenced by aria-activedescendant. Keep the active option rendered or provide a compatible identity strategy, and expose position and set-size information where the virtualized pattern requires it. Coordinate scrolling and rendering before assigning the reference. Test navigation across window boundaries, typeahead to offscreen items, and screen reader behavior. Consider filtering or a native control before adding complexity that the task does not need.

### Answer 3

A popup select needs a named trigger, expanded state, an appropriate popup relationship, opening and closing keys, selection commitment, Escape handling, and focus restoration. Define whether DOM focus moves to the listbox or remains on a combobox-like trigger with active descendant management; follow the selected pattern consistently. Use an overlay strategy for positioning and outside interaction. Keep the standalone listbox's selection logic reusable, but do not assume adding a button and hiding the list supplies the complete popup contract.
