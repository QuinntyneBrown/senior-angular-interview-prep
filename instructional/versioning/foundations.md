# Versioning Angular Libraries: Compatibility and Safe Migration

## Define the public contract before choosing a version

Welcome to the versioning lesson. We will classify twelve proposed changes, review an input deprecation, and repair a package that leaks internals and duplicates Angular. Semantic versioning becomes useful only when the package defines what its public contract includes. For a component library, that contract extends beyond method signatures.

Inputs, outputs, selectors, tokens, documented DOM hooks, keyboard behavior, forms integration, defaults, peer ranges, and testing harnesses can all affect consumers. An accidental export can become an external dependency even if its author intended it to be private. A private intention does not remove a name from the package that was actually published.

Ask whether a supported consumer that worked before can continue to work without modification. Then distinguish an intentional public promise from an unsupported dependency and consider the practical rollout. A change can be formally compatible and still deserve a visual review. A change can fix a bug and still break a workaround. State the compatibility policy instead of assuming that the word fix determines the release number.

## Input acceptance and output obligations

An input accepts values from consumers. Widening its accepted type usually permits more existing uses without invalidating them. Narrowing it can make an existing template stop compiling. A new required input forces consumers to provide information they did not previously need. An optional input with a harmless default is generally additive.

An output is different. Consumers handle the values the library emits. Widening an output to include null can break a handler that dereferences the original non-null value. The library has increased the obligations of the receiver. Do not classify input and output changes with the same rule merely because both use a union type.

Defaults also carry meaning. Changing medium to small can alter layout in every template that omitted the size. Even if no compile error appears, consumers may rely on the old visual result. Evaluate documented guarantees, snapshots, and product impact. A complete interview answer says which changes are clearly breaking and which depend on the contract, then explains the evidence that resolves each uncertain case.

```ts
// Input: accept more values.
readonly value = input<SelectOption | null>();
// Output: consumers must now handle null.
readonly selectionChange = output<SelectOption | null>();
// These changes have different compatibility consequences.
```

## Behavior and presentation can break consumers

Switching to OnPush can expose consumers that mutate an object in place or dynamically insert a child that relies on zone-triggered checks. A keyboard change can improve conformance while changing how existing interactions behave. Internal DOM changes may be safe under a documented encapsulation policy, but tests, selectors, and custom styles can still depend on them in practice.

Build an inventory of supported customization points. If teams were instructed to use an internal class, it is not really internal. If the harness supplies the supported interaction API, update the harness with the component. Theme tokens need contrast and visual checks; a darker color is not automatically a breaking change or automatically harmless.

Raise a minimum Angular peer version only when dropping support is intentional and tested. A package that claims compatibility with a range should install and compile representative consumers across that range, including its forms and testing entry points. Passing on the newest framework alone does not validate the minimum.

## Deprecation preserves behavior while changing guidance

A deprecation introduces a supported replacement while keeping the old contract usable for an announced period. In the button rename, both inputs need an unset state so resolution can distinguish absence from an explicitly selected primary value. The new input wins, then the old input, then the default.

Warnings should be actionable and limited to actual deprecated usage in development. A computed derivation should stay pure. Put the diagnostic side effect in an appropriate effect and choose whether once means once per instance or once per application. Document that choice. Do not teach teams to ignore a flood of warnings from components that already use the new name.

Compatibility also includes direct component references. If callers read the old input getter, changing its default from primary to undefined is observable even when the rendered appearance is unchanged. State that limitation and inventory such uses. For strict compatibility, consider a distinct resolved property or a bridging API. A visual equivalence claim should not erase a public property change.

```ts
readonly kind = input<ButtonVariant>();
readonly variant = input<ButtonVariant>();
readonly resolvedVariant = computed(() =>
  this.variant() ?? this.kind() ?? 'primary'
);
// New name wins; explicit old default is still detectable.
```

## Migrations need more than a search and replace

A template migration can rename a static kind attribute and a bound kind input when it knows the element is the library component. It should not rewrite every unrelated kind attribute in the repository. Parse templates and resolve symbols where the tooling supports it, then report uncertain cases rather than applying a destructive guess.

Programmatic setInput calls, host directive aliases, dynamic templates, and computed property names need separate analysis. A migration can handle statically resolvable string names and known imports, while emitting a report for dynamic uses. Make migrations repeatable and test both changed and unchanged files. The report should explain the manual correction and replacement API.

Publish a changelog, replacement examples, editor deprecation hints, and a removal version. Gather data from repository scans, CI builds, and consumer owners before removing the old contract. Runtime diagnostics can help during development, but avoid secretly transmitting consumer code or telemetry. Migration evidence should be explicit and proportionate to the organization.

## Package boundaries and peer dependencies

Angular libraries should cooperate with the application's Angular installation. Declaring Angular framework packages as ordinary runtime dependencies can allow multiple incompatible copies. That can lead to injection context and identity problems, although a specific NG0203 error still needs diagnosis rather than a one-cause assumption. Peer dependencies express the versions the consumer must supply.

Use explicit exports to keep the public surface deliberate. A wildcard export can publish internal helpers and component rows accidentally. Separate entry points let consumers import the feature they need, and a testing entry point can expose harnesses without making them part of the main application API. However, an entry point alone does not make a dependency optional at installation time.

If a date picker depends on a date library, simply moving it to a secondary entry point may improve imports and bundles but still leave a required root dependency. Making an optional peer safe requires isolating references and documenting the feature's requirement, or using a separate package. Evaluate package manager installation, TypeScript resolution, and bundling separately. They are different phases with different failure modes.

## Release gates and support policy

A release gate can compare public declarations, compile representative templates, run behavior and accessibility tests, inspect the packed artifact, and review theme snapshots. A generated API diff is useful, but it cannot understand every default or keyboard change. Combine mechanical checks with a release checklist that asks whether consumer behavior changed.

Decide how many major lines to support according to staffing and consumer upgrade schedules. Support should state security patches, critical fixes, supported framework ranges, and the end date. A breaking security fix may need a new major and compatible backports or a documented mitigation for older lines. Communicate urgency and migration steps; do not silently redefine a minor release as breaking while claiming ordinary semantic versioning.

Before publishing, install the packed package into a clean consumer project. Test each supported entry point without relying on monorepo path mappings. Verify peers, declarations, exports, assets, and dependency isolation. The consumer should receive the package you tested, not an internal build layout that accidentally makes missing files available.
