import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord } from '../../../services/payroll.service';
import { LeaveService, LeaveBalance, LeaveRequest } from '../../../services/leave.service';

@Component({
  selector: 'app-employee-self-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-self-service.component.html',
  styleUrls: ['./employee-self-service.component.scss']
})
export class EmployeeSelfServiceComponent implements OnInit {
  activeTab = 'paystubs';
  paystubs: PayrollRecord[] = [];
  leaveBalances: LeaveBalance[] = [];
  leaveRequests: LeaveRequest[] = [];
  
  currentEmployeeId = 1;
  selectedPaystub: PayrollRecord | null = null;
  showPaystubModal = false;
  
  showLeaveRequestModal = false;
  newLeaveRequest = {
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  };
  leaveTypes: any[] = [];

  constructor(
    private payrollService: PayrollService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.loadPaystubs();
    this.loadLeaveBalances();
    this.loadLeaveRequests();
    this.loadLeaveTypes();
  }

  loadPaystubs(): void {
    this.payrollService.getPaystubs(this.currentEmployeeId).subscribe({
      next: (data) => this.paystubs = data,
      error: (err) => console.error('Error loading paystubs:', err)
    });
  }

  loadLeaveBalances(): void {
    this.leaveService.getEmployeeBalances(this.currentEmployeeId).subscribe({
      next: (data: LeaveBalance[]) => this.leaveBalances = data,
      error: (err: Error) => console.error('Error loading leave balances:', err)
    });
  }

  loadLeaveRequests(): void {
    this.leaveService.getRequestsByEmployee(this.currentEmployeeId).subscribe({
      next: (data: LeaveRequest[]) => this.leaveRequests = data,
      error: (err: Error) => console.error('Error loading leave requests:', err)
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllLeaveTypes().subscribe({
      next: (data: any[]) => this.leaveTypes = data,
      error: (err: Error) => console.error('Error loading leave types:', err)
    });
  }

  viewPaystub(paystub: PayrollRecord): void {
    this.selectedPaystub = paystub;
    this.showPaystubModal = true;
  }

  closePaystubModal(): void {
    this.showPaystubModal = false;
    this.selectedPaystub = null;
  }

  openLeaveRequestModal(): void {
    this.newLeaveRequest = {
      leaveTypeId: this.leaveTypes.length > 0 ? this.leaveTypes[0].id : 0,
      startDate: '',
      endDate: '',
      reason: ''
    };
    this.showLeaveRequestModal = true;
  }

  closeLeaveRequestModal(): void {
    this.showLeaveRequestModal = false;
  }

  submitLeaveRequest(): void {
    const request = {
      employeeId: this.currentEmployeeId,
      leaveTypeId: this.newLeaveRequest.leaveTypeId,
      startDate: this.newLeaveRequest.startDate,
      endDate: this.newLeaveRequest.endDate,
      reason: this.newLeaveRequest.reason
    };

    this.leaveService.createRequest(request).subscribe({
      next: () => {
        this.closeLeaveRequestModal();
        this.loadLeaveRequests();
        this.loadLeaveBalances();
        alert('Leave request submitted successfully!');
      },
      error: (err: Error) => {
        console.error('Error submitting leave request:', err);
        alert('Error submitting leave request');
      }
    });
  }

  getPayPeriod(record: PayrollRecord): string {
    if (record.payrollRun) {
      const start = new Date(record.payrollRun.periodStartDate);
      const end = new Date(record.payrollRun.periodEndDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'N/A';
  }

  getPayDate(record: PayrollRecord): string {
    if (record.payrollRun?.payDate) {
      return new Date(record.payrollRun.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return 'N/A';
  }

  getLeaveTypeName(leaveTypeId: number): string {
    const type = this.leaveTypes.find(t => t.id === leaveTypeId);
    return type ? type.name : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  }

  downloadPaystub(record: PayrollRecord): void {
    alert('Pay stub download functionality will be implemented');
  }

  getTotalEntitlement(balance: LeaveBalance): number {
    return (balance.openingBalance || 0) + (balance.credited || 0) + (balance.carryForward || 0);
  }

  getBalancePercentage(balance: LeaveBalance): number {
    const total = this.getTotalEntitlement(balance);
    if (total === 0) return 0;
    return ((balance.availableBalance || 0) / total) * 100;
  }

  getLeaveDays(request: LeaveRequest): number {
    if (request.totalDays !== undefined && request.totalDays !== null) {
      return request.totalDays;
    }
    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }
}
