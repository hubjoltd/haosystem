import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveRequest, LeaveType, LeaveBalance } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';

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
  employees: any[] = [];
  employeeBalances: LeaveBalance[] = [];
  loading = false;
  saving = false;
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

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadLeaveTypes();
    this.loadEmployees();
  }

  loadRequests(): void {
    this.loading = true;
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

  loadEmployees(): void {
    this.employeeService.getActive().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  onEmployeeChange(): void {
    if (this.formData.employeeId) {
      this.leaveService.getEmployeeBalancesByYear(this.formData.employeeId, new Date().getFullYear()).subscribe({
        next: (balances) => {
          this.employeeBalances = balances;
        },
        error: () => {
          this.employeeBalances = [];
        }
      });
    } else {
      this.employeeBalances = [];
    }
  }

  getBalanceForLeaveType(leaveTypeId: number | null): LeaveBalance | null {
    if (!leaveTypeId) return null;
    return this.employeeBalances.find(b => b.leaveTypeId === leaveTypeId || b.leaveType?.id === leaveTypeId) || null;
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
    this.employeeBalances = [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.employeeBalances = [];
  }

  submitRequest(): void {
    if (this.saving) return;
    
    if (!this.formData.employeeId || !this.formData.leaveTypeId || !this.formData.startDate || !this.formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    this.leaveService.createRequest(this.formData).subscribe({
      next: () => {
        this.loadRequests();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        const errorMsg = err.error?.error || 'Error submitting leave request';
        alert(errorMsg);
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
        },
        error: (err) => {
          alert('Error approving request: ' + (err.error?.error || 'Unknown error'));
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
        },
        error: (err) => {
          alert('Error rejecting request: ' + (err.error?.error || 'Unknown error'));
        }
      });
    }
  }

  cancelRequest(id: number): void {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this.leaveService.cancelRequest(id).subscribe({
        next: () => this.loadRequests(),
        error: (err) => {
          alert('Error cancelling request: ' + (err.error?.error || 'Unknown error'));
        }
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
