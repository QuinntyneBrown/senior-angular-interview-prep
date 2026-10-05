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

