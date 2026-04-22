import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerRequestService, SellerRequestDTO } from '../../services/seller-request.service';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';

@Component({
  selector: 'app-seller-requests-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileTableComponent],
  templateUrl: './seller-requests-admin.html',
    styleUrls: ['../../shared/profile-table/profile-table.css', './profile.css', './seller-requests-admin.css']
})
export class SellerRequestsAdminComponent implements OnInit {
  requests: SellerRequestDTO[] = [];
  isLoading = false;
  selectedRequest: SellerRequestDTO | null = null;
  showRejectModal = false;
  rejectionReason = '';
  isProcessing = false;
  columns: string[] = ['Empresa', 'CUIT', 'Fecha', 'Estado'];
  keys: string[] = ['businessName', 'cuit', 'createdDate', 'status'];
  showProcessModal = false;

  constructor(private sellerRequestService: SellerRequestService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.sellerRequestService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoading = false;
        try { this.cd.detectChanges(); } catch (e) {}
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectRequest(request: SellerRequestDTO): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = false;
  }

  processRequest(request: SellerRequestDTO): void {
    this.selectRequest(request);
    this.rejectionReason = '';
    this.showProcessModal = true;
  }

  closeDetail(): void {
    this.selectedRequest = null;
  }

  openRejectModal(): void {
    this.showRejectModal = true;
    this.rejectionReason = '';
  }

  closeRejectModal(): void {
    if (!this.isProcessing) {
      this.showRejectModal = false;
      this.rejectionReason = '';
    }
  }

  approveRequest(): void {
    if (!this.selectedRequest || !this.selectedRequest.id) return;

    this.isProcessing = true;
    this.sellerRequestService.approveRequest(this.selectedRequest.id).subscribe({
      next: (updated) => {
        this.isProcessing = false;
        this.updateRequestInList(updated);
        this.selectedRequest = updated;
        this.showProcessModal = false;
        try { this.closeDetail(); this.cd.detectChanges(); } catch (e) {}
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }

  submitReject(): void {
    if (!this.selectedRequest || !this.selectedRequest.id || !this.rejectionReason.trim()) return;

    this.isProcessing = true;
    this.sellerRequestService.rejectRequest(this.selectedRequest.id, this.rejectionReason).subscribe({
      next: (updated) => {
        this.isProcessing = false;
        this.showProcessModal = false;
        this.updateRequestInList(updated);
        this.selectedRequest = updated;
        try { this.closeRejectModal(); this.closeDetail(); this.cd.detectChanges(); } catch (e) {}
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }

  private updateRequestInList(updated: SellerRequestDTO): void {
    const index = this.requests.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      this.requests[index] = updated;
      try { this.cd.detectChanges(); } catch (e) {}
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'PENDING': return 'En revisión';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return status || '';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  getStatusIconClass(status?: string): string {
    switch (status) {
      case 'PENDING': return 'ri-hourglass-line';
      case 'APPROVED': return 'ri-check-line';
      case 'REJECTED': return 'ri-close-line';
      default: return '';
    }
  }

  canApprove(): boolean {
    return this.selectedRequest?.status === 'PENDING' && !this.isProcessing;
  }

  canReject(): boolean {
    return this.selectedRequest?.status === 'PENDING' && !this.isProcessing;
  }
}
