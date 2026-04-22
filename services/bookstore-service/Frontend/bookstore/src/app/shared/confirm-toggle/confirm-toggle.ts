import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileToggleService, ProfileTogglePayload } from '../../pages/profile/profile-toggle.service';

@Component({
  selector: 'app-confirm-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-toggle.html',
  styleUrls: ['./confirm-toggle.css'],
})
export class ConfirmToggleComponent implements OnDestroy {
  show = false;
  payload: ProfileTogglePayload | null = null;
  private sub?: Subscription;

  constructor(private profileToggle: ProfileToggleService, private router: Router) {
    this.sub = this.profileToggle.toggle$.subscribe((p) => {
      // only react to explicit payload objects; ignore void notifications
      if (!p) return;
      // avoid showing when we're on /profile because ProfileWrapper will handle it
      const url = this.router.url || '';
      if (url.includes('/profile')) return;
      this.payload = p as ProfileTogglePayload;
      this.show = true;
    });
  }

  confirm(): void {
    this.show = false;
    try {
      if (this.payload?.onConfirm) {
        this.payload.onConfirm();
      } else {
        // default behavior: switch role to client and navigate to profile/client
        // (mimic ProfileWrapper default)
        // attempt to set active role via localStorage flag if available
        try {
          // nothing else available here; rely on callbacks when needed
        } catch (e) {}
      }
    } catch (e) {}
    this.payload = null;
  }

  cancel(): void {
    this.show = false;
    try {
      if (this.payload?.onCancel) this.payload.onCancel();
    } catch (e) {}
    this.payload = null;
  }

  ngOnDestroy(): void {
    try { this.sub?.unsubscribe(); } catch (e) {}
  }
}
