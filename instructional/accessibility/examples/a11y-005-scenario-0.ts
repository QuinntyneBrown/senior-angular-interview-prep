import { Component, Injectable, inject, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private nextId = 0;

  show(message: string, action?: ToastAction): void {
    const toast: Toast = { id: this.nextId++, message, action };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }
}

@Component({
  selector: 'ui-toast-outlet',
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <div class="ui-toast" role="alert">
        {{ toast.message }}
        @if (toast.action; as action) {
          <button type="button" (click)="action.run()">{{ action.label }}</button>
        }
      </div>
    }
  `,
})
export class ToastOutletComponent {
  protected readonly service = inject(ToastService);
}

