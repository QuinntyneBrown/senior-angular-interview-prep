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

