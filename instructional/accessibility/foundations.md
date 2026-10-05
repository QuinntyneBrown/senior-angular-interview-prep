# Accessible Angular Components: Names, Focus, and Interaction

## Accessibility is observable behavior

Welcome to the accessibility lesson. We will examine an icon button, a modal dialog, tabs, a form field, toast announcements, and a complete listbox coding exercise. Accessibility is part of a component's behavior and public contract. A control must have a discoverable role, a meaningful name, appropriate states, and an interaction model that works without a pointer.

A screenshot cannot tell you whether pressing Tab reaches the control, whether the focused item is selected, or whether an error is connected to its input. A component can look correct while its accessibility tree tells a different story. Start a review by inspecting the native element, then its computed role and accessible name, then its states and relationships. Finally use the keyboard to operate it in the order a user would.

Our examples are teaching implementations. We will verify DOM relationships, keyboard events, native dialog behavior, and focus in a real browser. We will not treat those checks as proof of every screen reader's announcements. Speech output depends on browser and assistive technology combinations. A senior answer states which behavior was tested and where manual testing is still needed.

## Choose native semantics before adding ARIA

A native button already supports keyboard activation, focus, disabled behavior, and a button role. A clickable div has none of those properties automatically. Adding role button only changes its semantic description; it does not make Space activate it, put it in the tab order, or prevent activation while disabled. Prefer the native element when it provides the required behavior.

ARIA supplements semantics when a native element does not express the complete widget. It describes roles, states, and relationships. The application remains responsible for keeping those states synchronized with behavior. A tab marked selected must show the corresponding panel. An option marked disabled must not become selectable through a separate click handler. An aria-modal attribute does not itself make the background inert.

Use the WAI-ARIA Authoring Practices patterns as an interaction reference for composite widgets. They provide expected keyboard behavior and explain focus strategies. They are guidance rather than a blanket compliance certificate. Select the pattern that fits the user task, then implement the whole model. A row of buttons is not automatically a tablist, and a list of links may be better navigation than a custom listbox.

## Accessible names and descriptions

An accessible name identifies a control. For a visible text button, its content often supplies that name. An icon-only button needs another naming source, such as aria-label or aria-labelledby. Hide decorative icon markup from assistive technology so an SVG title or glyph does not compete with the intended label. The label should describe the action, such as Delete invoice, rather than the image, such as Trash can.

An accessible description provides supporting information. Connect instructions, constraints, and errors with aria-describedby rather than replacing the name. A tooltip is not a reliable substitute for a required name. Keyboard users must be able to reveal and dismiss supplemental tooltip content, and the button should already make sense before the tooltip appears.

Prefer aria-labelledby when visible text already provides the right wording, particularly when several labels contribute useful context. Ensure every referenced identifier exists and is unique. Generated identifiers must work across multiple instances. Module counters are convenient in simple browser examples, but server rendering and hydration require a stable strategy so the client does not produce different relationships from the server.

```html
<button type="button" aria-label="Delete invoice">
  <svg aria-hidden="true" focusable="false"></svg>
</button>
<label for="email">Email</label>
<input id="email" aria-describedby="email-help">
<p id="email-help">Use your work address.</p>
```

## Focus is a resource with an owner

Focus tells the keyboard user where the next operation will happen. Keep a visible focus indicator, avoid unnecessary positive tabindex values, and preserve a logical reading order. When a component moves focus, it should have a clear user-facing reason. Opening a modal is one such reason; receiving a background toast normally is not.

Before opening a modal, remember the invoking element. On open, focus an appropriate element inside the dialog. Contain interaction while it is modal and provide a keyboard dismissal path. On close, restore focus when the invoking element still exists and is usable. If a destructive action removed it, choose a logical next location rather than focusing a detached node. This fallback is a production design responsibility.

Initial focus depends on content and risk. A destructive confirmation commonly starts on the safe action. A long structured explanation can start at a heading or paragraph with tabindex minus one so users can read it before acting. Do not focus the entire dialog element merely because it is easy to query. Native dialog and the CDK reduce the amount of custom behavior, but they still need a name and a deliberate focus policy.

## Modal dialogs and content creation

Use showModal on a native dialog when its behavior fits. It places the dialog in the top layer and makes the rest of the document inert. Merely setting the open attribute creates an open dialog without the same modal operation. The distinction explains why visually covering a page does not prevent keyboard interaction with controls underneath.

Keep the Angular state and the native dialog state connected. Escape produces a cancel event. A form with method dialog can close the element through another path. Route those paths back to the component's model, and restore focus after closure. Invoke browser DOM operations after rendering, not during a constructor before the view query exists.

Projection is another source of surprises. A parent creates its projected content even if the child's ng-content appears inside a condition. Hiding a dialog does not prevent an expensive projected form from being created or making requests. Offer a template slot that is instantiated only when open, or a dialog service that creates a component on demand. This separates visibility from lifetime.

```ts
const dialog = document.querySelector('dialog');
// Browser-only teaching excerpt:
dialog?.showModal();
// Setting the open attribute is not equivalent.
// Heavy content can be created from a template on demand.
```

## Composite widgets and keyboard tables

A composite widget groups several related items into a coherent keyboard interaction. A tablist generally has one tab in the page's tab order. Arrow keys move within it, Home and End reach the extremes, and selection determines which panel is shown. Keep roles, aria-selected, tabindex, aria-controls, and panel labeling consistent.

Automatic activation selects a tab as focus moves. It works well when panels display immediately. Manual activation moves focus first and selects on Enter or Space, which can avoid repeated slow requests. Do not combine half of each model. If scrolling buttons are added for narrow screens, preserve keyboard access to the actual tabs and scroll the focused tab into view. The extra buttons should not replace the tablist semantics.

Track identity rather than assuming a static index is always enough. Removing the final tab must not leave an inaccessible panel or no reachable tab. Handle empty lists, disabled items if supported, right-to-left direction, and multiple groups. A key manager can help with traversal and wrapping, but it does not supply the entire semantic and selection contract.

## Form relationships and error timing

A visible label needs a programmatic connection to the input. Match label for with input id, or use valid wrapping label semantics. A custom component wrapper cannot rely on an identifier on its host automatically naming an internal input. Form-field abstractions need an explicit relationship to the actual control.

Use aria-describedby for helper and error text and aria-invalid when the control is invalid according to the application's display policy. Do not announce every validation detail before the user has had a chance to enter data. An error shown after blur or submission usually needs a clear explanation and a route to correction. Preserve instructions when adding an error rather than dropping their identifier accidentally.

For live error updates, establish the live region before putting the message into it. Some assistive technology misses a region inserted together with its first text. Keep the name, description, visual error, and live announcement synchronized, but avoid redundant repeated speech. Verify the structural relationships automatically and test actual announcements manually on supported combinations.

## Live regions are asynchronous communication

A toast's presence on screen does not mean a screen reader will announce it. A persistent live region provides a communication channel. Polite announcements usually wait for an appropriate pause; assertive announcements may interrupt. Choose urgency according to the user impact, not the color of the toast. Routine success feedback should rarely interrupt what the user is reading.

Separate the visible notification history from the announcement channel. Replacing a list of toasts can cause too much content to be spoken or can repeat old messages. Publish the specific new status through a live announcer or persistent region while leaving the visible items available for review. Do not move focus into a noninteractive toast simply to make it noticeable.

Rapid changes can be coalesced or interrupted depending on the platform. A sequence such as three files uploaded, then four files uploaded, is not a reliable promise of two separate spoken sentences. Batch progress, announce a final summary, and offer stable visible status. Tests can verify that the intended text reaches a connected live region; they cannot assert a universal spoken transcript from a DOM change.

## Listbox focus and selection are different

A single-select listbox lets a user choose one option. The active option is the one keyboard navigation currently addresses. The selected value is the committed choice. These can differ when arrows move without selecting. Pick a documented behavior and keep it consistent for pointer and keyboard interaction. A native select is often preferable when it fits the product need.

With aria-activedescendant, DOM focus stays on the listbox container. The attribute points to the rendered active option, which must exist and have an identifier. Roving tabindex is an alternative for a standalone widget: focus moves among option elements. Do not mix both strategies casually. Neither strategy removes the need to scroll the active option into view and display a visible indicator.

Use roles listbox and option, an accessible name on the container, aria-selected on options, and aria-disabled where appropriate. Disabled options remain discoverable but must not be chosen. Keep identifiers unique across instances. In an empty or all-disabled list, remove an invalid active descendant reference and let navigation safely do nothing.

```html
<ul role="listbox" tabindex="0"
    aria-label="Country"
    aria-activedescendant="country-ca">
  <li role="option" id="country-ca"
      aria-selected="true">Canada</li>
  <li role="option" id="country-us"
      aria-selected="false">United States</li>
</ul>
```

## Listbox state, typeahead, and dynamic data

The coding exercise uses a model for the selected value and a linked signal for the active index. When options change, reconcile the active item against current data instead of keeping an index that can point past the list. Object values may need compareWith because a refetch can return equal records with different references. Do not mutate the consumer's options to store local selection.

Arrow keys, Home, and End traverse enabled options; Enter and Space commit the active item in this example. Prevent the browser's scrolling default for handled navigation keys. Printable characters build a short typeahead buffer, with a reset timer and modifier-key filtering. Clear the timer on destruction. Repeated-letter cycling deserves special attention: a buffer that becomes two identical letters does not automatically implement cycling. We will document that limitation in the source example and show a correction.

Virtualization adds an important constraint. An active descendant cannot safely reference an option removed from the DOM. A large list needs an identity and rendering strategy that keeps the active option represented, correct position and set-size metadata where required, and integration tests. Do not add virtual scrolling to a semantic listbox and assume the accessibility contract survives unchanged.

## Style from state and verify transitions

Selection should remain recognizable without color. A check mark or another shape can supplement background and weight. Style from ARIA state where it reflects the actual behavioral state, so a separate CSS flag cannot drift. Use design tokens for focus rings, surfaces, spacing, and disabled colors, with forced-colors adjustments where necessary.

Build tests around transitions: focus enters, arrows move, selection commits, options change, a disabled item is skipped, and focus returns after dismissal. Render two instances to catch duplicate identifiers. Test empty and all-disabled data. For dialogs, use real Tab and Escape events in browser automation because synthetic dispatch alone does not perform the browser's default focus behavior.

An automated accessibility scanner catches many missing names and invalid relationships, but it does not prove the widget's full interaction pattern. A test can pass every scanner rule and still fail to move focus with ArrowRight. Combine structural checks, behavior tests, visual review, and manual assistive-technology checks. We will use this layered method in every walkthrough.
