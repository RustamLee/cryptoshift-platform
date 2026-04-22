import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ProfileTogglePayload = {
  target?: 'client' | 'seller' | null;
  title?: string;
  message?: string;
  onConfirm?: (() => void) | null;
  onCancel?: (() => void) | null;
};

@Injectable({ providedIn: 'root' })
export class ProfileToggleService {
  private toggleSubject = new Subject<ProfileTogglePayload | void>();
  readonly toggle$ = this.toggleSubject.asObservable();

  requestToggle(payload?: ProfileTogglePayload): void {
    if (payload) this.toggleSubject.next(payload);
    else this.toggleSubject.next();
  }
}
