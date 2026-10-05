# Complete source examples

These marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.

## TOK-001 · Scenario · excerpt 1

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:root {
  --color-blue-500: #0b5fff;
  --color-blue-700: #0842b3;
  --color-red-500: #d92d20;
  --color-red-700: #a51f15;
}

```

## TOK-001 · Scenario · excerpt 2

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.ui-button {
  background: #0b5fff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font: 600 14px/20px "Inter", sans-serif;
}

.ui-button:hover {
  background: var(--color-blue-700);
}

.ui-button--danger {
  background: var(--color-red-500);
}

.ui-button--danger:hover {
  background: var(--color-red-700);
}

.ui-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.4);
}

```

## TOK-001 · Answer · excerpt 3

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:root {
  --ui-palette-blue-300: #6b9bff;
  --ui-palette-blue-500: #0b5fff;
  --ui-palette-blue-700: #0842b3;
  --ui-palette-neutral-0: #ffffff;
  --ui-palette-neutral-950: #0b0d12;

  --ui-color-action-primary: var(--ui-palette-blue-500);
  --ui-color-action-primary-hover: var(--ui-palette-blue-700);
  --ui-color-on-action-primary: var(--ui-palette-neutral-0);
  --ui-color-focus-ring: var(--ui-palette-blue-700);
}

[data-ui-theme='dark'] {
  --ui-color-action-primary: var(--ui-palette-blue-300);
  --ui-color-action-primary-hover: var(--ui-palette-blue-500);
  --ui-color-on-action-primary: var(--ui-palette-neutral-950);
  --ui-color-focus-ring: var(--ui-palette-blue-300);
}

```

## TOK-001 · Answer · excerpt 4

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.ui-button {
  --_background: var(--ui-button-background, var(--ui-color-action-primary));
  --_background-hover: var(--ui-button-background-hover, var(--ui-color-action-primary-hover));
  --_foreground: var(--ui-button-foreground, var(--ui-color-on-action-primary));

  background: var(--_background);
  color: var(--_foreground);
  padding: var(--ui-space-2) var(--ui-space-4);
  border: none;
  border-radius: var(--ui-radius-control);
  font: var(--ui-font-label);
}

.ui-button:hover {
  background: var(--_background-hover);
}

.ui-button--danger {
  --_background: var(--ui-button-danger-background, var(--ui-color-action-danger));
  --_background-hover: var(--ui-button-danger-background-hover, var(--ui-color-action-danger-hover));
  --_foreground: var(--ui-button-danger-foreground, var(--ui-color-on-action-danger));
}

.ui-button:focus-visible {
  outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring);
  outline-offset: var(--ui-focus-ring-offset);
}

```

## TOK-002 · Scenario · excerpt 5

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.ui-button {
  background: var(--ui-button-bg, var(--ui-color-action-primary));
}

```

## TOK-002 · Scenario · excerpt 6

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:host {
  --ui-button-background: var(--ui-color-action-primary);
}

.ui-button {
  background: var(--ui-button-background);
}

```

## TOK-002 · Scenario · excerpt 7

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.checkout ui-button {
  --ui-button-bg: var(--ui-color-success);
}

```

## TOK-002 · Answer · excerpt 8

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.ui-button {
  background: var(--ui-button-background, var(--ui-button-bg, var(--ui-color-action-primary)));
}

```

## TOK-003 · Scenario · excerpt 9

Complete verified TypeScript module.

```ts
import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  constructor() {
    effect(() => {
      document.body.className = `theme-${this.theme()}`;
    });
  }

  toggle(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }
}

```

## TOK-003 · Scenario · excerpt 10

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.theme-light {
  --ui-color-surface: #ffffff;
  --ui-color-on-surface: #1a1c21;
  --ui-color-selected: #dce6ff;
}

.theme-dark {
  --ui-color-surface: #0b0d12;
  --ui-color-on-surface: #e6e8ee;
  --ui-color-selected: #1d3a7a;
}

.ui-chip {
  border: none;
  background: var(--ui-color-surface);
  color: var(--ui-color-on-surface);
}

.ui-chip[aria-pressed='true'] {
  background: var(--ui-color-selected);
}

```

## TOK-003 · Answer · excerpt 11

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:root {
  color-scheme: light dark;
  --ui-color-surface: light-dark(#ffffff, #0b0d12);
  --ui-color-on-surface: light-dark(#1a1c21, #e6e8ee);
  --ui-color-selected: light-dark(#dce6ff, #1d3a7a);
}

:root[data-ui-theme='light'] {
  color-scheme: light;
}

:root[data-ui-theme='dark'] {
  color-scheme: dark;
}

```

## TOK-003 · Answer · excerpt 12

Complete verified TypeScript module.

```ts
import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly preference = signal<ThemePreference>('system');

  constructor() {
    effect(() => {
      const preference = this.preference();
      if (preference === 'system') this.root.removeAttribute('data-ui-theme');
      else this.root.setAttribute('data-ui-theme', preference);
    });
  }
}

```

## TOK-003 · Answer · excerpt 13

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
.ui-chip {
  border: 1px solid transparent;
}

.ui-chip[aria-pressed='true']::before {
  content: '✓ ' / '';
}

@media (forced-colors: active) {
  .ui-chip[aria-pressed='true'] {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
}

```

## TOK-004 · Scenario · excerpt 14

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:root {
  --ui-font-size-label: 14px;
  --ui-line-height-label: 20px;
  --ui-control-height: 32px;
  --ui-icon-button-size: 20px;
}

.ui-button {
  height: var(--ui-control-height);
  overflow: hidden;
  white-space: nowrap;
  font-size: var(--ui-font-size-label);
  line-height: var(--ui-line-height-label);
}

.ui-icon-button {
  width: var(--ui-icon-button-size);
  height: var(--ui-icon-button-size);
  padding: 0;
}

```

## TOK-004 · Answer · excerpt 15

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```css
:root {
  --ui-font-size-label: 0.875rem;
  --ui-line-height-label: 1.43;
  --ui-control-min-height: 2.5rem;
  --ui-icon-size: 1.25rem;
  --ui-target-size: 2.75rem;
}

.ui-button {
  min-height: var(--ui-control-min-height);
  padding-block: var(--ui-space-2);
  font-size: var(--ui-font-size-label);
  line-height: var(--ui-line-height-label);
}

.ui-icon-button {
  display: inline-grid;
  place-items: center;
  min-width: var(--ui-target-size);
  min-height: var(--ui-target-size);
  padding: 0;
}

.ui-icon-button svg {
  width: var(--ui-icon-size);
  height: var(--ui-icon-size);
}

```
