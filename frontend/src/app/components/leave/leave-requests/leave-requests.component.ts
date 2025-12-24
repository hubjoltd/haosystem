import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveRequest, LeaveType } from '../../../services/leave.service';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss']
})
export class LeaveRequestsComponent implements OnInit {
  requests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  leaveTypes: LeaveType[] = [];
  loading = false;
  showModal = false;
  statusFilter = 'ALL';
  searchTerm = '';

  formData = {
    employeeId: null as number | null,
    leaveTypeId: null as number | null,
    startDate: '',
    endDate: '',
    dayType: 'FULL_DAY',
    reason: '',
    emergencyContact: ''
  };

  showApprovalModal = false;
  selectedRequest: LeaveRequest | null = null;
  approverRemarks = '';

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadLeaveTypes();
  }

  loadRequests(): void {
    this.loading = false;
    this.leaveService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.filterRequests();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getActiveLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
      }
    });
  }

  filterRequests(): void {
    this.filteredRequests = this.requests.filter(r => {
      const matchesStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      const matchesSearch = !this.searchTerm ||
        r.employee?.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.employee?.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.leaveType?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  openCreateModal(): void {
    this.formData = {
      employeeId: null,
      leaveTypeId: null,
      startDate: '',
      endDate: '',
      dayType: 'FULL_DAY',
      reason: '',
      emergencyContact: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitRequest(): void {
    this.leaveService.createRequest(this.formData).subscribe({
      next: () => {
        this.loadRequests();
        this.closeModal();
      }
    });
  }

  openApprovalModal(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.approverRemarks = '';
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedRequest = null;
  }

  approveRequest(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.approveRequest(this.selectedRequest.id, undefined, this.approverRemarks).subscribe({
        next: () => {
          this.loadRequests();
          this.closeApprovalModal();
        }
      });
    }
  }

  rejectRequest(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.rejectRequest(this.selectedRequest.id, undefined, this.approverRemarks).subscribe({
        next: () => {
          this.loadRequests();
          this.closeApprovalModal();
        }
      });
    }
  }

  cancelRequest(id: number): void {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this.leaveService.cancelRequest(id).subscribe({
        next: () => this.loadRequests()
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
