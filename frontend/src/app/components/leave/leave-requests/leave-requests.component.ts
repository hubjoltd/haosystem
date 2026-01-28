import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LeaveService, LeaveRequest, LeaveType, LeaveBalance, ApprovalActivity } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';
import { finalize } from 'rxjs/operators';
import { ActivityTimelineComponent, ActivityItem } from '../../shared/activity-timeline/activity-timeline.component';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ActivityTimelineComponent],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    emergencyContact: '',
    // Hourly leave fields
    startTime: '',
    endTime: '',
    totalHours: 0,
    isHourlyLeave: false
  };

  showApprovalModal = false;
  selectedRequest: LeaveRequest | null = null;
  approverRemarks = '';

  // Activity timeline
  showActivityModal = false;
  activityRequest: LeaveRequest | null = null;
  activityItems: ActivityItem[] = [];
  loadingActivity = false;

  // Approval type for 2-level system
  approvalType: 'manager' | 'hr' = 'manager';

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadLeaveTypes();
    this.loadEmployees();
  }

  loadRequests(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.leaveService.getAllRequests().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => {
        this.requests = data;
        this.filterRequests();
        this.cdr.markForCheck();
      },
      error: () => {
        console.error('Error loading leave requests');
      }
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getActiveLeaveTypes().pipe(
      finalize(() => this.cdr.markForCheck())
    ).subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading leave types:', err)
    });
  }

  loadEmployees(): void {
    this.employeeService.getActive().pipe(
      finalize(() => this.cdr.markForCheck())
    ).subscribe({
      next: (data) => {
        this.employees = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  onEmployeeChange(): void {
    if (this.formData.employeeId) {
      this.leaveService.getEmployeeBalancesByYear(this.formData.employeeId, new Date().getFullYear()).pipe(
        finalize(() => this.cdr.markForCheck())
      ).subscribe({
        next: (balances) => {
          this.employeeBalances = balances;
          this.cdr.markForCheck();
        },
        error: () => {
          this.employeeBalances = [];
          this.cdr.markForCheck();
        }
      });
    } else {
      this.employeeBalances = [];
      this.cdr.markForCheck();
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
      emergencyContact: '',
      startTime: '',
      endTime: '',
      totalHours: 0,
      isHourlyLeave: false
    };
    this.employeeBalances = [];
    this.showModal = true;
  }

  getSelectedLeaveType(): LeaveType | null {
    if (!this.formData.leaveTypeId) return null;
    return this.leaveTypes.find(lt => lt.id === this.formData.leaveTypeId) || null;
  }

  isHourlyLeaveType(): boolean {
    const lt = this.getSelectedLeaveType();
    return lt?.timeUnit === 'HOURS' || lt?.allowHourlyLeave === true;
  }

  onLeaveTypeChange(): void {
    this.formData.isHourlyLeave = this.isHourlyLeaveType();
  }

  calculateHours(): void {
    if (this.formData.startTime && this.formData.endTime) {
      const start = this.parseTime(this.formData.startTime);
      const end = this.parseTime(this.formData.endTime);
      if (end > start) {
        this.formData.totalHours = Math.round((end - start) / 60 * 100) / 100;
      } else {
        this.formData.totalHours = 0;
      }
    }
  }

  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  closeModal(): void {
    this.showModal = false;
    this.employeeBalances = [];
  }

  submitRequest(): void {
    if (this.saving) return;
    
    // Validate based on leave type (hourly vs day-based)
    if (this.isHourlyLeaveType()) {
      if (!this.formData.employeeId || !this.formData.leaveTypeId || !this.formData.startDate || !this.formData.startTime || !this.formData.endTime) {
        alert('Please fill in all required fields');
        return;
      }
      if (this.formData.totalHours <= 0) {
        alert('Please select valid start and end times');
        return;
      }
      // Set endDate same as startDate for hourly leave
      this.formData.endDate = this.formData.startDate;
    } else {
      if (!this.formData.employeeId || !this.formData.leaveTypeId || !this.formData.startDate || !this.formData.endDate) {
        alert('Please fill in all required fields');
        return;
      }
    }

    this.saving = true;
    this.cdr.markForCheck();
    
    this.leaveService.createRequest(this.formData).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadRequests();
        this.closeModal();
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.error?.message || 'Error submitting leave request';
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
      case 'PENDING': 
      case 'PENDING_MANAGER':
      case 'PENDING_HR':
        return 'pending';
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // 2-level approval methods
  managerApprove(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.managerApprove(this.selectedRequest.id, this.approverRemarks).subscribe({
        next: () => {
          this.toastService.success('Manager approval successful');
          this.loadRequests();
          this.closeApprovalModal();
        },
        error: (err: any) => {
          const errorMsg = err.error?.error || err.error?.message || err.message || 'Connection error. Please try again.';
          this.toastService.error('Error: ' + errorMsg);
        }
      });
    }
  }

  managerReject(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.managerReject(this.selectedRequest.id, this.approverRemarks).subscribe({
        next: () => {
          this.toastService.success('Request rejected by manager');
          this.loadRequests();
          this.closeApprovalModal();
        },
        error: (err: any) => {
          const errorMsg = err.error?.error || err.error?.message || err.message || 'Connection error. Please try again.';
          this.toastService.error('Error: ' + errorMsg);
        }
      });
    }
  }

  hrApprove(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.hrApprove(this.selectedRequest.id, this.approverRemarks).subscribe({
        next: () => {
          this.toastService.success('HR approval successful - Leave request approved');
          this.loadRequests();
          this.closeApprovalModal();
        },
        error: (err) => {
          const errorMsg = err.error?.error || err.error?.message || err.message || 'Connection error. Please try again.';
          this.toastService.error('Error: ' + errorMsg);
        }
      });
    }
  }

  hrReject(): void {
    if (this.selectedRequest?.id) {
      this.leaveService.hrReject(this.selectedRequest.id, this.approverRemarks).subscribe({
        next: () => {
          this.toastService.success('Request rejected by HR');
          this.loadRequests();
          this.closeApprovalModal();
        },
        error: (err: any) => {
          const errorMsg = err.error?.error || err.error?.message || err.message || 'Connection error. Please try again.';
          this.toastService.error('Error: ' + errorMsg);
        }
      });
    }
  }

  // Activity timeline methods
  openActivityModal(request: LeaveRequest): void {
    this.activityRequest = request;
    this.showActivityModal = true;
    this.loadActivity(request.id!);
  }

  closeActivityModal(): void {
    this.showActivityModal = false;
    this.activityRequest = null;
    this.activityItems = [];
  }

  loadActivity(requestId: number): void {
    this.loadingActivity = true;
    this.cdr.markForCheck();
    
    this.leaveService.getRequestActivity(requestId).pipe(
      finalize(() => {
        this.loadingActivity = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (activities) => {
        this.activityItems = activities.map(a => ({
          id: a.id,
          action: a.action,
          performedBy: a.performedBy,
          performedAt: a.performedAt,
          remarks: a.remarks,
          oldStatus: a.oldStatus,
          newStatus: a.newStatus
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.activityItems = this.generateMockActivity();
        this.cdr.markForCheck();
      }
    });
  }

  generateMockActivity(): ActivityItem[] {
    if (!this.activityRequest) return [];
    const activities: ActivityItem[] = [];
    
    activities.push({
      action: 'Request Created',
      performedBy: this.activityRequest.employee,
      performedAt: this.activityRequest.createdAt || this.activityRequest.startDate,
      remarks: this.activityRequest.reason,
      newStatus: 'PENDING_MANAGER'
    });

    if (this.activityRequest.managerApprovedAt) {
      activities.push({
        action: this.activityRequest.managerApprovalStatus === 'APPROVED' ? 'Manager Approved' : 'Manager Rejected',
        performedBy: this.activityRequest.managerApprovedBy,
        performedAt: this.activityRequest.managerApprovedAt,
        remarks: this.activityRequest.managerRemarks,
        oldStatus: 'PENDING_MANAGER',
        newStatus: this.activityRequest.managerApprovalStatus === 'APPROVED' ? 'PENDING_HR' : 'REJECTED'
      });
    }

    if (this.activityRequest.hrApprovedAt) {
      activities.push({
        action: this.activityRequest.hrApprovalStatus === 'APPROVED' ? 'HR Approved' : 'HR Rejected',
        performedBy: this.activityRequest.hrApprovedBy,
        performedAt: this.activityRequest.hrApprovedAt,
        remarks: this.activityRequest.hrRemarks,
        oldStatus: 'PENDING_HR',
        newStatus: this.activityRequest.hrApprovalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED'
      });
    }

    return activities.reverse();
  }

  onAddNote(note: string): void {
    if (this.activityRequest?.id) {
      this.leaveService.addActivityNote(this.activityRequest.id, note).subscribe({
        next: () => {
          this.toastService.success('Note added');
          this.loadActivity(this.activityRequest!.id!);
        },
        error: () => {
          this.toastService.error('Failed to add note');
        }
      });
    }
  }

  getApprovalStage(request: LeaveRequest): string {
    if (request.status === 'PENDING' || request.status === 'PENDING_MANAGER') {
      return 'manager';
    } else if (request.status === 'PENDING_HR') {
      return 'hr';
    }
    return '';
  }

  getApprovalStatusText(request: LeaveRequest): string {
    if (request.managerApprovalStatus === 'APPROVED' && !request.hrApprovalStatus) {
      return 'Awaiting HR Approval';
    } else if (!request.managerApprovalStatus) {
      return 'Awaiting Manager Approval';
    } else if (request.status === 'APPROVED') {
      return 'Fully Approved';
    } else if (request.status === 'REJECTED') {
      return 'Rejected';
    }
    return request.status || '';
  }
}
