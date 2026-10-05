# Accessible Angular Components: Names, Focus, and Interaction

## Accessibility is observable behavior

Welcome to the accessibility lesson. We will examine an icon button, a modal dialog, tabs, a form field, toast announcements, and a complete listbox coding exercise. Accessibility is part of a component's behavior and public contract. A control must have a discoverable role, a meaningful name, appropriate states, and an interaction model that works without a pointer.

## Accessibility is observable behavior · 2

A screenshot cannot tell you whether pressing Tab reaches the control, whether the focused item is selected, or whether an error is connected to its input. A component can look correct while its accessibility tree tells a different story. Start a review by inspecting the native element, then its computed role and accessible name, then its states and relationships. Finally use the keyboard to operate it in the order a user would.

## Accessibility is observable behavior · 3

Our examples are teaching implementations. We will verify DOM relationships, keyboard events, native dialog behavior, and focus in a real browser. We will not treat those checks as proof of every screen reader's announcements. Speech output depends on browser and assistive technology combinations. A senior answer states which behavior was tested and where manual testing is still needed.

## Choose native semantics before adding ARIA

A native button already supports keyboard activation, focus, disabled behavior, and a button role. A clickable div has none of those properties automatically. Adding role button only changes its semantic description; it does not make Space activate it, put it in the tab order, or prevent activation while disabled. Prefer the native element when it provides the required behavior.

## Choose native semantics before adding ARIA · 2

ARIA supplements semantics when a native element does not express the complete widget. It describes roles, states, and relationships. The application remains responsible for keeping those states synchronized with behavior. A tab marked selected must show the corresponding panel. An option marked disabled must not become selectable through a separate click handler. An aria-modal attribute does not itself make the background inert.

## Choose native semantics before adding ARIA · 3

Use the WAI-ARIA Authoring Practices patterns as an interaction reference for composite widgets. They provide expected keyboard behavior and explain focus strategies. They are guidance rather than a blanket compliance certificate. Select the pattern that fits the user task, then implement the whole model. A row of buttons is not automatically a tablist, and a list of links may be better navigation than a custom listbox.

## Accessible names and descriptions

An accessible name identifies a control. For a visible text button, its content often supplies that name. An icon-only button needs another naming source, such as aria-label or aria-labelledby. Hide decorative icon markup from assistive technology so an SVG title or glyph does not compete with the intended label. The label should describe the action, such as Delete invoice, rather than the image, such as Trash can.

## Accessible names and descriptions · 2

An accessible description provides supporting information. Connect instructions, constraints, and errors with aria-describedby rather than replacing the name. A tooltip is not a reliable substitute for a required name. Keyboard users must be able to reveal and dismiss supplemental tooltip content, and the button should already make sense before the tooltip appears.

## Accessible names and descriptions · 3

Prefer aria-labelledby when visible text already provides the right wording, particularly when several labels contribute useful context. Ensure every referenced identifier exists and is unique. Generated identifiers must work across multiple instances. Module counters are convenient in simple browser examples, but server rendering and hydration require a stable strategy so the client does not produce different relationships from the server.

## Focus is a resource with an owner

Focus tells the keyboard user where the next operation will happen. Keep a visible focus indicator, avoid unnecessary positive tabindex values, and preserve a logical reading order. When a component moves focus, it should have a clear user-facing reason. Opening a modal is one such reason; receiving a background toast normally is not.

## Focus is a resource with an owner · 2

Before opening a modal, remember the invoking element. On open, focus an appropriate element inside the dialog. Contain interaction while it is modal and provide a keyboard dismissal path. On close, restore focus when the invoking element still exists and is usable. If a destructive action removed it, choose a logical next location rather than focusing a detached node. This fallback is a production design responsibility.

## Focus is a resource with an owner · 3

Initial focus depends on content and risk. A destructive confirmation commonly starts on the safe action. A long structured explanation can start at a heading or paragraph with tabindex minus one so users can read it before acting. Do not focus the entire dialog element merely because it is easy to query. Native dialog and the CDK reduce the amount of custom behavior, but they still need a name and a deliberate focus policy.

## Modal dialogs and content creation

Use showModal on a native dialog when its behavior fits. It places the dialog in the top layer and makes the rest of the document inert. Merely setting the open attribute creates an open dialog without the same modal operation. The distinction explains why visually covering a page does not prevent keyboard interaction with controls underneath.

## Modal dialogs and content creation · 2

Keep the Angular state and the native dialog state connected. Escape produces a cancel event. A form with method dialog can close the element through another path. Route those paths back to the component's model, and restore focus after closure. Invoke browser DOM operations after rendering, not during a constructor before the view query exists.

## Modal dialogs and content creation · 3

Projection is another source of surprises. A parent creates its projected content even if the child's ng-content appears inside a condition. Hiding a dialog does not prevent an expensive projected form from being created or making requests. Offer a template slot that is instantiated only when open, or a dialog service that creates a component on demand. This separates visibility from lifetime.

## Composite widgets and keyboard tables

A composite widget groups several related items into a coherent keyboard interaction. A tablist generally has one tab in the page's tab order. Arrow keys move within it, Home and End reach the extremes, and selection determines which panel is shown. Keep roles, aria-selected, tabindex, aria-controls, and panel labeling consistent.

## Composite widgets and keyboard tables · 2

Automatic activation selects a tab as focus moves. It works well when panels display immediately. Manual activation moves focus first and selects on Enter or Space, which can avoid repeated slow requests. Do not combine half of each model. If scrolling buttons are added for narrow screens, preserve keyboard access to the actual tabs and scroll the focused tab into view. The extra buttons should not replace the tablist semantics.

## Composite widgets and keyboard tables · 3

Track identity rather than assuming a static index is always enough. Removing the final tab must not leave an inaccessible panel or no reachable tab. Handle empty lists, disabled items if supported, right-to-left direction, and multiple groups. A key manager can help with traversal and wrapping, but it does not supply the entire semantic and selection contract.

## Form relationships and error timing

A visible label needs a programmatic connection to the input. Match label for with input id, or use valid wrapping label semantics. A custom component wrapper cannot rely on an identifier on its host automatically naming an internal input. Form-field abstractions need an explicit relationship to the actual control.

## Form relationships and error timing · 2

Use aria-describedby for helper and error text and aria-invalid when the control is invalid according to the application's display policy. Do not announce every validation detail before the user has had a chance to enter data. An error shown after blur or submission usually needs a clear explanation and a route to correction. Preserve instructions when adding an error rather than dropping their identifier accidentally.

## Form relationships and error timing · 3

For live error updates, establish the live region before putting the message into it. Some assistive technology misses a region inserted together with its first text. Keep the name, description, visual error, and live announcement synchronized, but avoid redundant repeated speech. Verify the structural relationships automatically and test actual announcements manually on supported combinations.

## Live regions are asynchronous communication

A toast's presence on screen does not mean a screen reader will announce it. A persistent live region provides a communication channel. Polite announcements usually wait for an appropriate pause; assertive announcements may interrupt. Choose urgency according to the user impact, not the color of the toast. Routine success feedback should rarely interrupt what the user is reading.

## Live regions are asynchronous communication · 2

Separate the visible notification history from the announcement channel. Replacing a list of toasts can cause too much content to be spoken or can repeat old messages. Publish the specific new status through a live announcer or persistent region while leaving the visible items available for review. Do not move focus into a noninteractive toast simply to make it noticeable.

## Live regions are asynchronous communication · 3

Rapid changes can be coalesced or interrupted depending on the platform. A sequence such as three files uploaded, then four files uploaded, is not a reliable promise of two separate spoken sentences. Batch progress, announce a final summary, and offer stable visible status. Tests can verify that the intended text reaches a connected live region; they cannot assert a universal spoken transcript from a DOM change.

## Listbox focus and selection are different

A single-select listbox lets a user choose one option. The active option is the one keyboard navigation currently addresses. The selected value is the committed choice. These can differ when arrows move without selecting. Pick a documented behavior and keep it consistent for pointer and keyboard interaction. A native select is often preferable when it fits the product need.

## Listbox focus and selection are different · 2

With aria-activedescendant, DOM focus stays on the listbox container. The attribute points to the rendered active option, which must exist and have an identifier. Roving tabindex is an alternative for a standalone widget: focus moves among option elements. Do not mix both strategies casually. Neither strategy removes the need to scroll the active option into view and display a visible indicator.

## Listbox focus and selection are different · 3

Use roles listbox and option, an accessible name on the container, aria-selected on options, and aria-disabled where appropriate. Disabled options remain discoverable but must not be chosen. Keep identifiers unique across instances. In an empty or all-disabled list, remove an invalid active descendant reference and let navigation safely do nothing.

## Listbox state, typeahead, and dynamic data

The coding exercise uses a model for the selected value and a linked signal for the active index. When options change, reconcile the active item against current data instead of keeping an index that can point past the list. Object values may need compareWith because a refetch can return equal records with different references. Do not mutate the consumer's options to store local selection.

## Listbox state, typeahead, and dynamic data · 2

Arrow keys, Home, and End traverse enabled options; Enter and Space commit the active item in this example. Prevent the browser's scrolling default for handled navigation keys. Printable characters build a short typeahead buffer, with a reset timer and modifier-key filtering. Clear the timer on destruction. Repeated-letter cycling deserves special attention: a buffer that becomes two identical letters does not automatically implement cycling. We will document that limitation in the source example and show a correction.

## Listbox state, typeahead, and dynamic data · 3

Virtualization adds an important constraint. An active descendant cannot safely reference an option removed from the DOM. A large list needs an identity and rendering strategy that keeps the active option represented, correct position and set-size metadata where required, and integration tests. Do not add virtual scrolling to a semantic listbox and assume the accessibility contract survives unchanged.

## Style from state and verify transitions

Selection should remain recognizable without color. A check mark or another shape can supplement background and weight. Style from ARIA state where it reflects the actual behavioral state, so a separate CSS flag cannot drift. Use design tokens for focus rings, surfaces, spacing, and disabled colors, with forced-colors adjustments where necessary.

## Style from state and verify transitions · 2

Build tests around transitions: focus enters, arrows move, selection commits, options change, a disabled item is skipped, and focus returns after dismissal. Render two instances to catch duplicate identifiers. Test empty and all-disabled data. For dialogs, use real Tab and Escape events in browser automation because synthetic dispatch alone does not perform the browser's default focus behavior.

## Style from state and verify transitions · 3

An automated accessibility scanner catches many missing names and invalid relationships, but it does not prove the widget's full interaction pattern. A test can pass every scanner rule and still fail to move focus with ArrowRight. Combine structural checks, behavior tests, visual review, and manual assistive-technology checks. We will use this layered method in every walkthrough.

## A11Y-001 · Scenario

We now review A11Y-001: An icon button that keyboard and screen-reader users cannot use. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-001 · Scenario

`@acme/ui` has shipped this icon button for a year. It uses an icon font with ligatures, so the text `delete` renders as a bin icon. Hundreds of call sites look like the usage below. An accessibility audit has just failed three products because of it.

## A11Y-001 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on IconButtonComponent. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-001 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on icon, disabled, pressed. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-001 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-001 · Interview question

**Interviewer:** List the accessibility failures, fix the component, and explain how you would release the fix to hundreds of existing call sites.

[pause 5s]

## A11Y-001 · 1. It is not a button

A `<div>` with a click handler has no role, is not in the tab order, and does not respond to Enter or Space. Keyboard users cannot reach it; screen readers do not announce it as interactive. Adding `role="button"`, `tabindex="0"` and key handlers is possible but recreates what the native element already does, usually incompletely (Space activates on key up for native buttons, for example).

## A11Y-001 · 1. It is not a button

Fix: use a native `<button type="button">`. `type="button"` matters: a button inside a `<form>` defaults to `submit`.

## A11Y-001 · 2. The accessible name is the ligature text

The only text inside is `more_vert`, so assistive technology announces something like "more underscore vert". `title` on the custom element does not help: it is on a host element with no role, and `title` is not reliably exposed or shown to keyboard and touch users anyway.

## A11Y-001 · 2. The accessible name is the ligature text

Fix: a `label` input bound to `aria-label` on the button, and `aria-hidden="true"` on the icon so the ligature text is never read.

## A11Y-001 · 3. Disabled is visual only

The class greys the button out, but nothing tells assistive technology it is unavailable. There are two valid fixes, and the choice should be deliberate:

## A11Y-001 · 3. Disabled is visual only

Native `disabled`: removes the button from the tab order. Simple, but users cannot discover the control or a tooltip explaining why it is disabled. - `aria-disabled="true"`: keeps it focusable and announced as unavailable. The component must then block activation itself.

## A11Y-001 · 3. Disabled is visual only

The fixed version uses `aria-disabled` so that disabled actions in toolbars remain discoverable.

## A11Y-001 · Answer · block 1 · page 1

This is the answer code, part 1 of 2. Focus on aria-label, aria-disabled, aria-hidden. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-001 · Answer · block 2 · page 2

This is the answer code, part 2 of 2. Focus on IconButtonComponent, icon, label, disabled. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-001 · Fixed version

Making `label` required turns a recurring accessibility bug into a compile error: nobody can add an icon button without a name again.

## A11Y-001 · 4. Releasing it without breaking hundreds of call sites

A new required input is a breaking change: every existing `<ui-icon-button>` stops compiling. A safe rollout:

## A11Y-001 · 4. Releasing it without breaking hundreds of call sites · item 1

1. Minor release: add `label` as optional. When it is missing, fall back to the `title` attribute if present, and log a development-mode warning that names the icon, so teams can find each call site. Mark the old behaviour deprecated in the changelog.

## A11Y-001 · 4. Releasing it without breaking hundreds of call sites · item 2

2. Provide a migration: an `ng update` schematic that rewrites `title="..."` to `label="..."`, and reports call sites with neither for a person to fix.

## A11Y-001 · 4. Releasing it without breaking hundreds of call sites · item 3

3. Next major: make `label` required. The compiler now lists any remaining call sites.

## A11Y-001 · 4. Releasing it without breaking hundreds of call sites

The other changes (native button, `aria-hidden` icon, `aria-disabled`) fix behaviour without changing the API, so they can ship immediately in a minor or patch release. Mention them in the changelog: teams with styles targeting the internal `div` will notice.

## A11Y-001 · Follow-up 1

**Interviewer:** A team wants a tooltip on every icon button. How does a tooltip relate to the accessible name, and how should it behave for keyboard users?

[pause 5s]

A tooltip supplies supplemental explanation; the icon button still needs a name before it appears. Show it on keyboard focus as well as pointer hover, allow Escape to dismiss it, and avoid moving focus into a noninteractive tooltip. Associate useful descriptive content without making the name unexpectedly verbose. Ensure hoverable, dismissible, and persistent behavior where the content criterion applies. If the popup contains interactive controls, it is a different pattern and should not be presented as a simple tooltip.

## A11Y-001 · Follow-up 2

**Interviewer:** When is `aria-labelledby` better than `aria-label` here?

[pause 5s]

Use labelledby when visible text already provides the intended label or when combining a visible action with contextual text is clearer than duplicating a string. It keeps spoken wording aligned with the visible interface and can improve localization maintenance. The referenced elements need stable unique identifiers. Use aria-label for an otherwise unnamed icon control when no suitable visible text exists. Do not add both casually and assume both will be spoken; naming precedence determines the result.

## A11Y-001 · Follow-up 3

**Interviewer:** How would you test, automatically, that every icon button in a product has a name?

[pause 5s]

Run an accessibility scanner in the rendered product and add a browser test that queries buttons by their accessible name. Cover states where icons or labels change and multiple component instances. Required input typing can help library consumers, but an empty string can still pass a string type. Add runtime development diagnostics or tests for empty labels where useful. Automated checks establish that a name exists, not that every name is meaningful, so review representative wording as well.

## A11Y-002 · Scenario

We now review A11Y-002: A modal dialog that is not modal. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-002 · Scenario

`@acme/ui` ships the dialog below. It looks correct with a mouse. A screen-reader user reports they "can't tell a dialog opened, and Tab takes me to the page underneath". Another team reports that a heavy form inside a closed dialog still makes HTTP requests when the page loads.

## A11Y-002 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on role. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-002 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on DialogComponent, open, heading. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-002 · Interview question

**Interviewer:** What does a modal dialog have to do for keyboard and screen-reader users, and which of those does this one do? Fix it, and explain the second team's bug.

[pause 5s]

## A11Y-002 · Answer

A modal dialog must: move focus into itself when it opens, keep keyboard focus and screen-reader browsing inside, have an accessible name, close on Escape, and return focus to where the user was when it closes. This one does none of them.

## A11Y-002 · 1. Focus stays behind

Opening it does not move focus. A keyboard user's next Tab goes to whatever followed the trigger, and a screen-reader user hears nothing. The user may not know a dialog opened.

## A11Y-002 · 2. The rest of the page is still reachable

Nothing stops Tab from leaving the dialog, and nothing hides the page behind it from assistive technology. `role="dialog"` alone does not make anything modal.

## A11Y-002 · 3. No accessible name

`role="dialog"` with no `aria-labelledby` or `aria-label` is announced as just "dialog". The heading is right there; it needs an `id` and a reference.

## A11Y-002 · 4. No keyboard way to close, and focus is lost on close

There is no Escape handling, and the close control is a `<span>`: not focusable, not a button, and its only text, `×`, is announced as "times" or "multiplication". When the dialog closes, its content is destroyed while it contains focus, so focus falls back to `<body>` and the user has to find their place again.

## A11Y-002 · Fix: use the native `<dialog>` element

`showModal()` gives most of this for free: the dialog renders in the top layer, the rest of the document becomes inert (unreachable by Tab and hidden from assistive technology), focus moves into the dialog, and Escape fires a `cancel` event. The component then only needs to name it, provide a real close button, and restore focus.

## A11Y-002 · Answer · block 1 · page 1

This is the answer code, part 1 of 5. Read this part in the context of Fix: use the native `<dialog>` element. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-002 · Answer · block 2 · page 2

This is the answer code, part 2 of 5. Focus on aria-labelledby, aria-label, aria-hidden. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-002 · Answer · block 3 · page 3

This is the answer code, part 3 of 5. Focus on DialogComponent, open, heading, closeLabel. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-002 · Answer · block 4 · page 4

This is the answer code, part 4 of 5. Focus on onCancel. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-002 · Answer · block 5 · page 5

This is the answer code, part 5 of 5. Focus on onClose. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-002 · Fix: use the native `<dialog>` element

Design notes:

## A11Y-002 · Fix: use the native `<dialog>` element

The model stays the single source of truth. Escape is cancelled and turned into `open.set(false)`, and the effect calls `close()`. Focus restoration happens in the `close` event handler, so it runs for every way of closing. - `afterRenderEffect` is used because `showModal()` needs the element to be rendered; it never runs during server rendering. The close label is an input so applications can translate it. The page backdrop is now the `::backdrop` pseudo-element, styled with tokens.

## A11Y-002 · 5. The second team's bug: projected content is always created

`<ng-content>` inside `@if` does not delay anything. Projected content belongs to the parent's template, so the parent creates it, and runs its lifecycle hooks, whether or not the dialog ever shows it. That is why the hidden form makes HTTP requests on page load. The fixed version renders the content all the time inside a closed `<dialog>` (which is hidden), so the cost is the same.

## A11Y-002 · 5. The second team's bug: projected content is always created

For heavy or lazy content, the library should offer one of:

## A11Y-002 · 5. The second team's bug: projected content is always created

A template slot: the consumer passes an `<ng-template>`, and the dialog renders it with `ngTemplateOutlet` only while open. A dialog service that creates the content component on demand (the CDK `Dialog` does this). Consumers can also wrap their content in `@defer` or their own `@if`.

## A11Y-002 · Follow-up 1

**Interviewer:** A team wants clicking the backdrop to close the dialog. How would you implement it with `<dialog>`, and should it be the default?

[pause 5s]

Detect a pointer interaction outside the dialog's content rectangle and route it through the component's normal close request. A dialog-target click alone can also occur in content padding, so account for geometry and pointer down/up behavior to avoid accidental closure after dragging. Make backdrop dismissal an explicit policy rather than a universal default. A destructive confirmation or unsaved form may require deliberate cancellation. Keep Escape and a visible close or cancel control available according to the product's requirements.

## A11Y-002 · Follow-up 2

**Interviewer:** Which element should receive focus first in a destructive confirmation dialog? Why?

[pause 5s]

Usually focus the least destructive action so an accidental Enter does not commit the destructive operation. If the dialog begins with important structured information, focus a static heading or paragraph with tabindex minus one so the content can be read first. Choose according to the task rather than always focusing the first element in DOM order. Give the dialog a meaningful name and ensure the destructive action is clear. Confirm focus restoration and a sensible fallback if the invoking item is deleted.

## A11Y-002 · Follow-up 3

**Interviewer:** How would you test focus return and background inertness in an automated test?

[pause 5s]

In a real browser, focus the invoking button, open the modal, verify focus enters, and press Tab and Shift Tab to ensure background controls are unreachable. Press Escape and verify the model closes and focus returns. Try programmatically focusing a background control while the modal is open to check native inertness. Cover close-button and form-dialog paths too. DOM attributes alone do not prove native modality; showModal and actual interaction are the behavior under test.

## A11Y-003 · Scenario

We now review A11Y-003: Tabs that only work with a mouse. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-003 · Scenario

This is the first version of the `@acme/ui` tabs component. It is already used on a settings page that shows two tab groups at once: "Profile" and "Notifications".

## A11Y-003 · Scenario · block 1 · page 1

This is the original code, part 1 of 3. Focus on TabComponent, label, active. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-003 · Scenario · block 2 · page 2

This is the original code, part 2 of 3. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-003 · Scenario · block 3 · page 3

This is the original code, part 3 of 3. Focus on TabsComponent, tabs. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-003 · Scenario · block 4 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-003 · Interview question

**Interviewer:** Describe how tabs should behave for keyboard and screen-reader users, list what is missing, and fix the component. Point out any bug that only appears because there are two tab groups on the page.

[pause 5s]

## A11Y-003 · Answer

The WAI-ARIA tabs pattern: a `tablist` contains `tab` elements, each controlling a `tabpanel`. Only the selected tab is in the Tab order (a roving `tabindex`); arrow keys move between tabs, and Home and End jump to the first and last. Each tab says whether it is selected, and each panel is labelled by its tab.

## A11Y-003 · 1. No roles or states

Divs with click handlers expose nothing. A screen reader announces plain text, not "Security, tab, 2 of 2, selected". Needed: `role="tablist"` (with a label), `role="tab"` with `aria-selected` and `aria-controls`, and `role="tabpanel"` with `aria-labelledby`.

## A11Y-003 · 2. Not keyboard operable

The tabs are not focusable at all. Making each one a plain `<button>` would fix reachability but produce the wrong pattern: five Tab presses to get past five tabs. Only the selected tab should have `tabindex="0"`; the rest get `-1`, and arrow keys move between them.

## A11Y-003 · 3. Duplicate ids across instances

Both groups render `id="tab-0"` and `id="tab-1"`. Duplicate ids are invalid, and any `aria-labelledby` or `aria-controls` reference resolves to the first match in the document, so the second group's panels would be labelled by the first group's tabs. Ids must be unique per instance: generate them from a counter, never from the position alone.

## A11Y-003 · 4. Nothing is selected initially

No tab starts active, so every panel is hidden until a click. With a roving `tabindex`, no tab would be focusable either, and the whole component would be unreachable by keyboard.

## A11Y-003 · 5. State is pushed into children imperatively

`select` writes into each child's signal. If tabs are added or removed (`@if` around a `<ui-tab>`), nothing updates their state. Deriving "am I selected?" from one source in the parent avoids that.

## A11Y-003 · Answer · block 1 · page 1

This is the answer code, part 1 of 8. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 2 · page 2

This is the answer code, part 2 of 8. Focus on selectedTab. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 3 · page 3

This is the answer code, part 3 of 8. Focus on TabComponent, label, tabId, panelId. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 4 · page 4

This is the answer code, part 4 of 8. Focus on role, aria-label, aria-controls, aria-selected. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 5 · page 5

This is the answer code, part 5 of 8. Focus on TabsComponent, label, selectedIndex, tabs. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 6 · page 6

This is the answer code, part 6 of 8. Focus on activeIndex, selectedTab, buttons, onKeydown. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 7 · page 7

This is the answer code, part 7 of 8. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Answer · block 8 · page 8

This is the answer code, part 8 of 8. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-003 · Fixed version

This uses automatic activation: moving with the arrow keys also selects the tab. That suits panels that render instantly. If showing a panel is slow (it fetches data), use *manual activation* instead: arrows move focus, and Enter or Space selects.

## A11Y-003 · Fixed version

The panel has `tabindex="0"` so keyboard users can reach a panel that has no focusable content. If every panel always starts with a focusable element, that can be dropped.

## A11Y-003 · What a strong candidate also mentions

Right-to-left layouts reverse the meaning of the left and right arrow keys. Read the direction (for example with the CDK `Directionality`) instead of hard-coding it. - `selectedIndex` as a `model()` lets consumers control the selected tab, for example to sync it with the URL. The label input is required, so a tablist is never nameless. Adding it to an existing component is breaking, so it would be staged (see A11Y-001).

## A11Y-003 · Follow-up 1

**Interviewer:** When would you choose manual activation over automatic activation?

[pause 5s]

Use manual activation when showing a panel is slow or costly, such as a network request or heavy render. Arrows move focus, while Enter or Space commits selection. Automatic activation is appropriate when panel changes are immediate and moving through tabs remains responsive. Keep focused and selected indices separate for manual activation and document the keyboard model. Do not change between models unpredictably based on a transient request duration.

## A11Y-003 · Follow-up 2

**Interviewer:** The tabs overflow on a phone. What happens to keyboard and screen-reader behaviour if you add scroll buttons?

[pause 5s]

Keep tab roles, selection, panel relationships, and the one-tab-stop strategy intact. Scroll the focused tab into view and make scroll controls named native buttons if they are needed. The extra controls should not cause the arrow handler to treat them as tabs or hide selected tabs from assistive technology. Test touch, keyboard, narrow layouts, and right-to-left direction. A visual overflow solution should preserve the widget's semantic interaction model.

## A11Y-003 · Follow-up 3

**Interviewer:** Would you build this on the CDK's `FocusKeyManager`? What would it give you and what would it cost?

[pause 5s]

FocusKeyManager can manage active items, wrapping, orientation, disabled skipping, and typeahead depending on configuration. It can reduce bespoke traversal code. You still own tab semantics, selected state, panels, identifiers, rendering, and automatic versus manual activation. It also introduces an adapter contract and a CDK dependency that must fit the supported framework range. Use it when the shared behavior outweighs that cost, and test the complete component rather than assuming the manager supplies accessibility automatically.

## A11Y-004 · Scenario

We now review A11Y-004: A form field where nothing is connected. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-004 · Scenario

Every form in every Acme product uses this text field from `@acme/ui`. It looks right. A screen-reader user testing the sign-up form says: "I hear 'edit text, blank' for every field, and when I submit I don't know what went wrong."

## A11Y-004 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-004 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on TextFieldComponent, label, hint, error. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-004 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-004 · Interview question

**Interviewer:** List everything a screen-reader user misses, and fix the component. The value binding is covered by another question (API-004); focus on labels, hints, errors and required state.

[pause 5s]

## A11Y-004 · 1. The input has no accessible name

The label is a `<span>`, not a `<label>` associated with the input, so the input is announced as "edit text" with no name. Clicking the label text also does not focus the input, which matters for users with motor impairments.

## A11Y-004 · 1. The input has no accessible name

Fix: a `<label for>` pointing at a per-instance input `id`.

## A11Y-004 · 2. The hint is a placeholder

Placeholder text disappears as soon as the user types, is often low contrast, and is not reliably announced as a description. Users with memory or cognitive impairments lose the instruction exactly when they need it.

## A11Y-004 · 2. The hint is a placeholder

Fix: render the hint as visible text and reference it with `aria-describedby`.

## A11Y-004 · 3. Errors are visual only

A red border is not announced, and the error text is not connected to the input. A screen-reader user hears nothing about the error, now or when they return to the field.

## A11Y-004 · 3. Errors are visual only

Fix:

## A11Y-004 · 3. Errors are visual only

`aria-invalid="true"` on the input while there is an error. Add the error's `id` to `aria-describedby`, so it is read when the field gets focus. Show something besides colour (an icon or the word "Error"), for WCAG 1.4.1. To announce an error that appears while the user is in the field, the error container needs to be a live region that is always in the DOM. A live region inserted together with its text is often not announced.

## A11Y-004 · 4. Required is visual only

The asterisk is read as "star" (or not at all), and the input does not say it is required. Use the `required` attribute (or `aria-required="true"` if native validation is unwanted) and hide the asterisk from assistive technology. The form should also explain what the asterisk means.

## A11Y-004 · 5. Ids must be unique per instance

A sign-up form has many fields. Every `id` the component generates (input, hint, error) must be unique per instance, or `for` and `aria-describedby` point at the wrong field.

## A11Y-004 · Answer · block 1 · page 1

This is the answer code, part 1 of 4. Focus on aria-hidden. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-004 · Answer · block 2 · page 2

This is the answer code, part 2 of 4. Focus on aria-invalid, aria-describedby, aria-live, aria-hidden. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-004 · Answer · block 3 · page 3

This is the answer code, part 3 of 4. Focus on TextFieldComponent, label, hint, error. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-004 · Answer · block 4 · page 4

This is the answer code, part 4 of 4. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-004 · Fixed version

The error paragraph is always rendered (empty when there is no error), so the live region exists before its text changes. It is only referenced from `aria-describedby` while it has content.

## A11Y-004 · What a strong candidate also mentions

When to show errors is a product decision the library must support, not make. Showing an error on the first keystroke is hostile; the usual pattern is after the field is left (touched) or after submit. The component receives `error` as an input, which keeps that decision with the consumer, and the documentation should recommend a default. On submit, the form, not the field, should move focus to the first invalid field or to an error summary at the top. The library can provide a helper for this. Announcing every keystroke's validation through the live region is noisy. Debounce the error or only set it on blur. - `autocomplete` must be passable to the inner input (`autocomplete="email"`), for WCAG 1.3.5 (Identify Input Purpose). That is a reason to consider the attribute-selector design in API-002.

## A11Y-004 · Follow-up 1

**Interviewer:** Why do many screen readers ignore a live region that is inserted at the same time as its text?

[pause 5s]

Assistive technology often observes changes to an already registered live region. If the region and its first message appear in one insertion, some combinations treat it as initial content rather than an update to announce. Keep a persistent empty region, then change its text after the relevant interaction. Timing varies across platforms, so a delayed write is not a universal guarantee. Verify the DOM sequence automatically and test announcements with the supported browser and screen reader combinations.

## A11Y-004 · Follow-up 2

**Interviewer:** Should the error be announced politely or assertively? What changes if you get it wrong?

[pause 5s]

Polite is usually appropriate for field validation while the user is entering data. Assertive can interrupt the current speech and should be reserved for genuinely urgent information. Repeated assertive errors on every keystroke can make a form difficult to use. Decide when errors become visible, connect the error as a description, and avoid announcing unchanged messages repeatedly. Submission may need an error summary and deliberate focus management instead of several competing live announcements.

## A11Y-004 · Follow-up 3

**Interviewer:** How would this component expose the inner input to consumers who need `autocomplete`, `inputmode` or `maxlength`?

[pause 5s]

Prefer a form-field that wraps a projected native input enhanced by a directive, so native attributes stay on the real control. The field and directive can share a control interface through dependency injection and register label, helper, and error identifiers. If an internal input is necessary, document explicit attribute forwarding and a focus API. Do not assume arbitrary attributes on the wrapper automatically reach the descendant. Include autocomplete and forms integration in consumer examples.

## A11Y-005 · Scenario

We now review A11Y-005: Toasts that vanish before anyone can use them. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-005 · Scenario

`@acme/ui` provides a toast service. Products use it for messages like "Saved", "Message deleted — Undo", and "Payment failed". Accessibility testing found that screen-reader users sometimes hear nothing, are interrupted mid-sentence by "Saved", and that nobody using a keyboard has ever managed to press Undo.

## A11Y-005 · Scenario · block 1 · page 1

This is the original code, part 1 of 4. Focus on ToastAction, Toast. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-005 · Scenario · block 2 · page 2

This is the original code, part 2 of 4. Focus on ToastService, toasts, Toast, nextId. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-005 · Scenario · block 3 · page 3

This is the original code, part 3 of 4. Focus on role. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-005 · Scenario · block 4 · page 4

This is the original code, part 4 of 4. Focus on ToastOutletComponent, service. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-005 · Interview question

**Interviewer:** Explain each of the three findings and redesign the service and outlet. Keep the API easy for product teams to use correctly.

[pause 5s]

## A11Y-005 · 1. "Sometimes hear nothing": live regions created with their content

Each toast element is created already containing `role="alert"` and its text. Screen readers announce changes inside live regions they already know about, and support for regions inserted together with their content is inconsistent. The reliable pattern is a live region that exists from page load and stays empty until a message is added to it.

## A11Y-005 · 1. "Sometimes hear nothing": live regions created with their content

Fix: the outlet renders permanent live-region containers; toasts are added inside them.

## A11Y-005 · 2. "Interrupted by 'Saved'": everything is assertive

`role="alert"` is assertive: it interrupts whatever the screen reader is saying. That suits "Payment failed", not "Saved". The service must let callers choose politeness, with polite as the default so the easy path is the considerate one.

## A11Y-005 · 3. "Nobody can press Undo": the timer

Three seconds is too short to read for many users (screen magnifier users may not even have the toast in view), and far too short to reach a button at the end of the document by keyboard. WCAG 2.2.1 (Timing Adjustable) requires that users can turn off, adjust or extend time limits like this.

## A11Y-005 · 3. "Nobody can press Undo": the timer

Fix:

## A11Y-005 · 3. "Nobody can press Undo": the timer

Toasts with an action do not auto-dismiss by default; they stay until used or dismissed. Informational toasts use a longer default and pause while hovered or focused. Every toast has a dismiss button. Do not move focus to toasts: that would interrupt the user's work. Instead, important actions such as Undo should also be available somewhere persistent (for example, in the item's menu).

## A11Y-005 · Answer · block 1 · page 1

This is the answer code, part 1 of 8. Focus on ToastPoliteness, ToastAction, ToastOptions. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 2 · page 2

This is the answer code, part 2 of 8. Focus on Toast, id, message, politeness. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 3 · page 3

This is the answer code, part 3 of 8. Focus on nextId. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 4 · page 4

This is the answer code, part 4 of 8. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 5 · page 5

This is the answer code, part 5 of 8. Read this part in the context of Fixed version. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 6 · page 6

This is the answer code, part 6 of 8. Focus on ToastComponent, toast, service, dismissLabel. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 7 · page 7

This is the answer code, part 7 of 8. Focus on aria-live. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Answer · block 8 · page 8

This is the answer code, part 8 of 8. Focus on ToastOutletComponent, service, polite, assertive. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-005 · Fixed version

Notes on the design:

## A11Y-005 · Fixed version

The two regions exist as soon as the outlet renders, so a toast added later is a change inside a known live region. - `show()` returns the id, so callers can dismiss a toast when the situation resolves. The defaults make the safe choice the easy one: polite, a long duration, and no timer at all when there is an action. The dismiss label is fixed English here for brevity; in the library it would come from an injected, translatable configuration.

## A11Y-005 · What a strong candidate also mentions

The CDK `LiveAnnouncer` already manages a hidden live region and can be used instead of the visible regions for the announcement itself. Focus is lost if a focused toast is dismissed. When the user dismisses a toast they tabbed into, focus should go somewhere sensible, such as back to where it was before. Stacking: five toasts at once are unreadable. Limit how many are visible and queue the rest.

## A11Y-005 · Follow-up 1

**Interviewer:** A toast says "3 files uploaded" and then "4 files uploaded" a second later. What will a screen reader say, and how would you improve it?

[pause 5s]

Speech may skip, merge, or interrupt rapid updates; do not promise that both counts are read exactly. Batch progress updates and announce a useful final summary, while keeping current visible status available. A live announcer can replace an outdated progress message rather than queueing every intermediate number. Avoid repeatedly speaking the entire toast history. Test the message sequence and manually evaluate the supported assistive technology to choose a useful cadence.

## A11Y-005 · Follow-up 2

**Interviewer:** Should the outlet be a landmark region? What are the trade-offs?

[pause 5s]

A named region can make a persistent notification history discoverable, especially if it contains actions users may revisit. But turning every transient toast into a landmark creates navigation noise. Prefer one meaningful named outlet when it serves a navigable purpose, and use a separate status announcement channel for new messages. Do not move focus to the region merely because a toast appeared. Evaluate the page's existing landmarks and the user's recovery task.

## A11Y-005 · Follow-up 3

**Interviewer:** How would you test that a toast is announced?

[pause 5s]

Automate the structural contract: a persistent connected live region, the intended politeness, and the new message reaching it after the event. Spy on a live announcer at a unit boundary only when testing the call contract; also exercise the browser integration. A DOM test cannot prove the exact spoken output, so include manual screen reader checks for repeated messages, interruption, and timing. Document the tested combinations rather than declaring announcement behavior universally certified.

## A11Y-006 · Scenario

We now review A11Y-006: Live coding: build an accessible listbox. Inspect the consumer contract and identify the mechanism behind each reported defect.

## A11Y-006 · Scenario

`@acme/ui` needs a single-select listbox. It will be used on its own (for example, choosing a shipping method) and later inside a select and a combobox, so it must be correct, accessible, and easy for product teams to understand.

## A11Y-006 · Scenario

You have 40 minutes. Talk through your decisions as you go. The interviewer cares more about the order you tackle things in and the reasons you give than about finishing every step.

## A11Y-006 · Scenario

Starting point:

## A11Y-006 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Focus on ListboxOption. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-006 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Focus on ListboxComponent, options, ListboxOption, value. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-006 · Scenario · block 3 · page 1

This is the original code, part 1 of 1. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## A11Y-006 · Interview question

**Interviewer:** Work through these steps in order. Each builds on the last. 1. Render and select (5 min). Show the options; clicking an enabled option selects it and updates `value`. 2. Semantics (5 min). Make a screen reader announce it as a listbox with a name, and announce each option and whether it is selected or disabled. 3. Keyboard (12 min). Tab moves focus to the listbox. Up and Down move the active option, skipping disabled ones; Home and End jump; Enter and Space select. Screen readers must announce the active option. Explain why you chose `aria-activedescendant` or a roving `tabindex`. 4. Type-ahead (5 min). Typing letters moves to the next matching option. 5. Styling with tokens (5 min). Show active, selected, disabled and focus states using only design tokens, and keep them visible in forced-colors mode. 6. Discussion (8 min). How would this work with reactive forms? With object values? How would you test it, and what would you give product teams for their tests?

[pause 5s]

## A11Y-006 · Answer · block 1 · page 1

This is the answer code, part 1 of 12. Focus on ListboxOption. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 2 · page 2

This is the answer code, part 2 of 12. Focus on role, tabindex. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 3 · page 3

This is the answer code, part 3 of 12. Focus on aria-label, aria-activedescendant, role, aria-selected. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 4 · page 4

This is the answer code, part 4 of 12. Focus on ListboxComponent, options, ListboxOption, label. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 5 · page 5

This is the answer code, part 5 of 12. Focus on activeIndex, activeId. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 6 · page 6

This is the answer code, part 6 of 12. Focus on typed, typedTimer, optionId. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 7 · page 7

This is the answer code, part 7 of 12. Focus on isSelected, choose. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 8 · page 8

This is the answer code, part 8 of 12. Focus on onKeydown. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 9 · page 9

This is the answer code, part 9 of 12. Read this part in the context of Reference solution (steps 1 to 4). Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 10 · page 10

This is the answer code, part 10 of 12. Focus on enabledIndexes, typeahead. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 11 · page 11

This is the answer code, part 11 of 12. Read this part in the context of Reference solution (steps 1 to 4). Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 12 · page 12

This is the answer code, part 12 of 12. Read this part in the context of Reference solution (steps 1 to 4). Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Step-by-step notes · item 1

Step

## A11Y-006 · Step-by-step notes · item 2

1. `value` is a `model()`, so `[(value)]` works and selection is one signal. Options are `readonly` and never mutated (see SIG-004). `track option` uses object identity, which is correct here because options carry no per-row state.

## A11Y-006 · Step-by-step notes · item 1

Step

## A11Y-006 · Step-by-step notes · item 2

2. `role="listbox"` with `aria-label`, `role="option"` with `aria-selected`, and `aria-disabled` on disabled options. Disabled options stay visible and announced, which helps users understand what is unavailable. `label` is a required input, so a nameless listbox does not compile.

## A11Y-006 · Step-by-step notes · item 1

Step

## A11Y-006 · Step-by-step notes · item 2

3. `aria-activedescendant` keeps DOM focus on the listbox and tells assistive technology which option is active. It fits a listbox well, and it is the pattern a combobox needs later, where focus must stay in the text input. A roving `tabindex` (focus moves to each option) is also valid for a standalone listbox, and the candidate should be able to say so.

## A11Y-006 · Step-by-step notes

Edge cases a strong candidate handles:

## A11Y-006 · Step-by-step notes

First focus: the active option is the selected one, or the first enabled one. A selected option that later becomes disabled is not made active. All options disabled: `activeIndex` is `-1`, `aria-activedescendant` is removed, and the keyboard does nothing. Options change: `linkedSignal` recomputes the active option from the new options, so it never points past the end of the list. Unique ids: derived from a per-instance counter, never from the index alone. Scrolling: the active option is scrolled into view after rendering, with `afterRenderEffect`.

## A11Y-006 · Step-by-step notes · item 1

Step

## A11Y-006 · Step-by-step notes · item 2

4. Type-ahead buffers keystrokes for 500 ms, ignores modifier shortcuts, skips disabled options and wraps around. The timer is cleared on destroy.

## A11Y-006 · Step 5: styles using only tokens

These go in the component's stylesheet.

## A11Y-006 · Answer · block 13 · page 1

This is the answer code, part 1 of 4. Focus on background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 14 · page 2

This is the answer code, part 2 of 4. Focus on background. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 15 · page 3

This is the answer code, part 3 of 4. Focus on aria-selected, aria-disabled. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Answer · block 16 · page 4

This is the answer code, part 4 of 4. Focus on aria-disabled. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## A11Y-006 · Step 5: styles using only tokens

States are styled from the ARIA attributes, so the visual state and the announced state cannot disagree. Selection shows a check mark as well as weight, so it does not depend on colour. The active option uses an outline, which forced-colors mode keeps.

## A11Y-006 · Step 6: discussion points

Forms: implement `ControlValueAccessor` writing the same `value` signal, following the contract in API-004 (`writeValue` never calls `onChange`; touched on blur; disabled state). Object values: `compareWith` lets teams pass objects that are equal but not identical, such as options rebuilt after a fetch. Tests: a host component with real options, keyboard interactions from the APG keyboard table, two instances on one page for id uniqueness, and axe in a real browser. For product teams: a `ListboxHarness` with `selectOption`, `getSelectedOptionLabel` and `pressKey`, published from a testing entry point (see TST-001).

## A11Y-006 · Follow-up 1

**Interviewer:** How would you extend this to multiple selection? What changes in ARIA and keyboard behaviour?

[pause 5s]

Represent selection as a collection, add aria-multiselectable true, and expose aria-selected for each option. Choose an APG-supported multiple-selection keyboard model. In a modifier-free model, Space toggles the active option, with optional range and select-all behavior documented. Keep focus independent of selection so navigation does not unexpectedly clear choices. Define disabled behavior, output payloads, and reconciliation when options disappear. This is a new public contract, not just changing value to an array.

## A11Y-006 · Follow-up 2

**Interviewer:** The list has 10,000 options. What breaks, and how would virtual scrolling interact with `aria-activedescendant`?

[pause 5s]

Rendering ten thousand options can cost layout and memory, but virtualization can remove the element referenced by aria-activedescendant. Keep the active option rendered or provide a compatible identity strategy, and expose position and set-size information where the virtualized pattern requires it. Coordinate scrolling and rendering before assigning the reference. Test navigation across window boundaries, typeahead to offscreen items, and screen reader behavior. Consider filtering or a native control before adding complexity that the task does not need.

## A11Y-006 · Follow-up 3

**Interviewer:** How would you build a select (a button that opens this listbox in a popup) on top of it?

[pause 5s]

A popup select needs a named trigger, expanded state, an appropriate popup relationship, opening and closing keys, selection commitment, Escape handling, and focus restoration. Define whether DOM focus moves to the listbox or remains on a combobox-like trigger with active descendant management; follow the selected pattern consistently. Use an overlay strategy for positioning and outside interaction. Keep the standalone listbox's selection logic reusable, but do not assume adding a button and hiding the list supplies the complete popup contract.

## Implementation clarification · Repeated-letter typeahead

The reference buffer accumulates repeated letters, so typing the same letter twice quickly searches for a doubled prefix rather than cycling. The supplemental listbox example resets repeated single-letter input to a one-letter search and verifies cycling. The source remains unchanged.

## Implementation clarification · Browser checks and announcements

DOM and browser interaction checks establish names, relationships, and focus in the tested browser. They do not establish a universal screen-reader announcement or server-hydration identifier strategy.

## Final review checklist

Review the lesson by answering each main question and follow-up aloud. For Accessible Angular Components: Names, Focus, and Interaction, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.
