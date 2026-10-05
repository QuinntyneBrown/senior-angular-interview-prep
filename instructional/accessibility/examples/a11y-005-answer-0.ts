import { Component, Injectable, computed, inject, input, signal } from '@angular/core';

export type ToastPoliteness = 'polite' | 'assertive';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastOptions {
  politeness?: ToastPoliteness;
  action?: ToastAction;
  /** Milliseconds before dismissal, or null to stay until dismissed. */
  duration?: number | null;
}

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly politeness: ToastPoliteness;
  readonly action?: ToastAction;
  readonly duration: number | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  show(message: string, options: ToastOptions = {}): number {
    const toast: Toast = {
      id: this.nextId++,
      message,
      politeness: options.politeness ?? 'polite',
      action: options.action,
      duration: options.duration !== undefined ? options.duration : options.action ? null : 8000,
    };
    this.toasts.update(list => [...list, toast]);
    this.resume(toast.id);
    return toast.id;
  }

  dismiss(id: number): void {
    this.pause(id);
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }

  pause(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }

  resume(id: number): void {
    const toast = this.toasts().find(t => t.id === id);
    if (!toast || toast.duration === null || this.timers.has(id)) return;
    this.timers.set(id, setTimeout(() => this.dismiss(id), toast.duration));
  }
}

@Component({
  selector: 'ui-toast',
  host: {
    class: 'ui-toast',
    '(mouseenter)': 'service.pause(toast().id)',
    '(mouseleave)': 'service.resume(toast().id)',
    '(focusin)': 'service.pause(toast().id)',
    '(focusout)': 'service.resume(toast().id)',
  },
  template: `
    <span>{{ toast().message }}</span>
    @if (toast().action; as action) {
      <button type="button" (click)="action.run(); service.dismiss(toast().id)">{{ action.label }}</button>
    }
    <button type="button" [attr.aria-label]="dismissLabel" (click)="service.dismiss(toast().id)">
      <span aria-hidden="true">×</span>
    </button>
  `,
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  protected readonly service = inject(ToastService);
  protected readonly dismissLabel = 'Dismiss notification';
}

@Component({
  selector: 'ui-toast-outlet',
  imports: [ToastComponent],
  template: `
    <div class="ui-toast-region" aria-live="polite">
      @for (toast of polite(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
    <div class="ui-toast-region" aria-live="assertive">
      @for (toast of assertive(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
  `,
})
export class ToastOutletComponent {
  private readonly service = inject(ToastService);
  protected readonly polite = computed(() => this.service.toasts().filter(t => t.politeness === 'polite'));
  protected readonly assertive = computed(() => this.service.toasts().filter(t => t.politeness === 'assertive'));
}

