import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { EditEmailModalComponent } from '../../shared/edit-email-modal/edit-email-modal';
import { ResetPasswordModalComponent } from '../../shared/reset-password-modal/reset-password-modal';
import { AuthService } from '../../services/auth.service';

interface UserRow {
  id?: number;
  name: string;
  roles: string;
  status?: string;
  deletable?: boolean;
}

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileTableComponent, ConfirmDialogComponent, EditEmailModalComponent, ResetPasswordModalComponent],
  templateUrl: './users-admin.html',
  styleUrls: ['../../shared/profile-table/profile-table.css'],
})
export class UsersAdminComponent implements OnInit {
  users: UserRow[] = [];
  loading = false;
  showDeleteModal = false;
  deleteTarget: UserRow | null = null;
  deleting = false;
  deleteMessage = '';
  deleteError: string | null = null;
  showEditModal = false;
  showResetModal = false;
  modalRow: UserRow | null = null;
  modalLoading = false;
  modalError: string | null = null;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<any[]>('/api/users').subscribe({
      next: (res) => {
        this.zone.run(() => {
          const current = this.auth.user;
          const currentId = current?.id;
          const currentName = current?.name;
          this.users = (res || [])
            .filter((u: any) => {
              if (!u) return false;
              if (currentId != null && u.id === currentId) return false;
              const uname = u.name || '';
              if (currentName && uname === currentName) return false;
              return true;
            })
            .map((u: any) => ({
              id: u.id,
              name: u.name || '',
              status: u.status || 'ACTIVE',
              roles: (u.roles || []).map((r: string) => r.replace(/^ROLE_/, '')).join(', '),
              deletable: undefined,
            }));
          for (const usr of this.users) {
            if (!usr.id) continue;
            const token = localStorage.getItem('jwtToken');
            const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
            this.http.get<boolean>(`/api/users/${usr.id}/admin/can-delete`, headers ? { headers } : {}).subscribe({
              next: (resFlag) => {
                usr.deletable = !!resFlag;
                try { this.cd.detectChanges(); } catch (e) {}
              },
              error: () => {
                usr.deletable = false;
              }
            });
          }
          this.loading = false;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: () => {
        this.zone.run(() => (this.loading = false));
      },
    });
  }

  deleteUser(row: UserRow): void {
    this.deleteTarget = row;
    this.deleteMessage = `¿Estás seguro que deseas eliminar al usuario "${row.name}"?`;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (!this.showDeleteModal) return;
    this.showDeleteModal = false;
    this.deleteTarget = null;
    this.deleteError = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || !this.deleteTarget.id) return;
    const id = this.deleteTarget.id;
    this.deleting = true;
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.delete(`/api/users/${id}`, headers ? { headers } : {}).subscribe({
      next: () => {
        setTimeout(() => {
          this.zone.run(() => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.deleteTarget = null;
            this.loadUsers();
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        }, 350);
      },
      error: (err) => {
        this.zone.run(() => {
          this.deleting = false;
          this.deleteError = err?.error?.message || 'Error al eliminar el usuario.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  openEditEmail(row: UserRow): void {
    this.modalRow = row;
    this.modalError = null;
    this.showEditModal = true;
  }

  onEditEmailConfirm(newEmail: string): void {
    if (!this.modalRow) return;
    this.modalLoading = true;
    const id = this.modalRow.id;
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.put(`/api/users/${id}/admin`, { name: newEmail }, headers ? { headers } : {}).subscribe({
      next: () => {
        this.modalLoading = false;
        this.showEditModal = false;
        this.modalRow = null;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to update email', err);
        this.modalLoading = false;
        this.modalError = err?.error?.message || 'Error al actualizar nombre.';
      },
    });
  }

  onEditEmailCancel(): void {
    this.showEditModal = false;
    this.modalRow = null;
    this.modalError = null;
  }

  openResetPassword(row: UserRow): void {
    this.modalRow = row;
    this.modalError = null;
    this.showResetModal = true;
  }

  onResetPasswordConfirm(payload: { password: string; temporary: boolean }) {
    if (!this.modalRow) return;
    this.modalLoading = true;
    const id = this.modalRow.id;
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http
      .put(`/api/users/${id}/admin`, { password: payload.password, isTemporaryPassword: payload.temporary }, headers ? { headers } : {})
      .subscribe({
        next: () => {
          this.modalLoading = false;
          this.showResetModal = false;
          this.modalRow = null;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Failed to reset password', err);
          this.modalLoading = false;
          this.modalError = err?.error?.message || 'Error al resetear contraseña.';
        },
      });
  }

  onResetPasswordCancel() {
    this.showResetModal = false;
    this.modalRow = null;
    this.modalError = null;
  }

  toggleStatus(row: UserRow): void {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.http
      .put(`/api/users/${row.id}/admin`, { status: newStatus }, headers ? { headers } : {})
      .subscribe({
        next: () => this.loadUsers(),
        error: (err) => {
          console.error('Failed to toggle status', err);
          this.deleteError = err?.error?.message || 'Error al cambiar estado.';
        },
      });
  }
}
