import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, UserDTO } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile-default',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<div></div>`,
})
export class ProfileDefaultComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    try {
      console.log('ProfileDefaultComponent - router.config:', this.router.config);
    } catch (e) {}

    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('ProfileDefaultComponent - localStorage currentUser:', parsed);
        if (parsed?.roles?.includes('ROLE_ADMIN')) {
          this.router.navigate(['/profile', 'admin']);
          return;
        }
        if (parsed?.roles?.includes('ROLE_SELLER')) {
          this.router.navigate(['/profile', 'seller']);
          return;
        }
        this.router.navigate(['/profile', 'client']);
        return;
      }
    } catch (e) {}

    this.auth.currentUser$
      .pipe(
        filter((u) => u != null),
        take(1)
      )
      .subscribe((u: UserDTO) => {
        try {
          console.log('ProfileDefaultComponent - currentUser$', u);
          if (u.roles?.includes('ROLE_ADMIN')) {
            this.router.navigate(['/profile', 'admin']);
            return;
          }
          if (u.roles?.includes('ROLE_SELLER')) {
            this.router.navigate(['/profile', 'seller']);
            return;
          }
        } catch (e) {
          console.error('ProfileDefaultComponent redirect error', e);
        }
        this.router.navigate(['/profile', 'client']);
      });
  }
}
