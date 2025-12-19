import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord } from '../../../services/payroll.service';
import { LeaveService, LeaveBalance, LeaveRequest } from '../../../services/leave.service';
import { LoanService } from '../../../services/loan.service';
import { ExpenseService } from '../../../services/expense.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';

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
  loans: any[] = [];
  expenses: any[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  
  currentEmployeeId: number = 0;
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
    private leaveService: LeaveService,
    private loanService: LoanService,
    private expenseService: ExpenseService,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {
    this.currentEmployeeId = this.authService.getCurrentUserId() || 0;
  }

  ngOnInit(): void {
    this.loadPaystubs();
    this.loadLeaveBalances();
    this.loadLeaveRequests();
    this.loadLeaveTypes();
    this.loadLoans();
    this.loadExpenses();
    this.loadAttendance();
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

  loadLoans(): void {
    this.loanService.getLoansByEmployee(this.currentEmployeeId).subscribe({
      next: (data) => this.loans = data,
      error: (err) => console.error('Error loading loans:', err)
    });
  }

  loadExpenses(): void {
    this.expenseService.getRequestsByEmployee(this.currentEmployeeId).subscribe({
      next: (data) => this.expenses = data,
      error: (err) => console.error('Error loading expenses:', err)
    });
  }

  loadAttendance(): void {
    this.attendanceService.getByEmployee(this.currentEmployeeId).subscribe({
      next: (data) => this.attendanceRecords = data,
      error: (err) => console.error('Error loading attendance:', err)
    });
  }

  downloadPaystub(record: PayrollRecord): void {
    const period = this.getPayPeriod(record);
    const html = this.generatePaystubHTML(record);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paystub_${period.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generatePaystubHTML(record: PayrollRecord): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pay Stub</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .paystub { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; }
          .pay-period { font-size: 14px; margin-top: 10px; }
          .section { margin-bottom: 30px; }
          .section-title { font-weight: bold; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
          .detail-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .total-row { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
          .net-pay { font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="paystub">
          <div class="header">
            <div class="company-name">Pay Stub</div>
            <div class="pay-period">Period: ${this.getPayPeriod(record)}</div>
            <div class="pay-period">Paid: ${this.getPayDate(record)}</div>
          </div>

          <div class="section">
            <div class="section-title">Earnings</div>
            <div class="detail-row">
              <span>Base Pay</span>
              <span>$${(record.basePay || 0).toFixed(2)}</span>
            </div>
            ${record.overtimePay ? `<div class="detail-row">
              <span>Overtime Pay</span>
              <span>$${record.overtimePay.toFixed(2)}</span>
            </div>` : ''}
            <div class="detail-row total-row">
              <span>Gross Pay</span>
              <span>$${(record.grossPay || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Deductions</div>
            ${record.healthInsurance ? `<div class="detail-row">
              <span>Health Insurance</span>
              <span>$${record.healthInsurance.toFixed(2)}</span>
            </div>` : ''}
            ${record.retirement401k ? `<div class="detail-row">
              <span>401(k)</span>
              <span>$${record.retirement401k.toFixed(2)}</span>
            </div>` : ''}
            ${record.federalTax ? `<div class="detail-row">
              <span>Federal Tax</span>
              <span>$${record.federalTax.toFixed(2)}</span>
            </div>` : ''}
            ${record.stateTax ? `<div class="detail-row">
              <span>State Tax</span>
              <span>$${record.stateTax.toFixed(2)}</span>
            </div>` : ''}
            ${record.socialSecurityTax ? `<div class="detail-row">
              <span>Social Security</span>
              <span>$${record.socialSecurityTax.toFixed(2)}</span>
            </div>` : ''}
            ${record.medicareTax ? `<div class="detail-row">
              <span>Medicare</span>
              <span>$${record.medicareTax.toFixed(2)}</span>
            </div>` : ''}
            <div class="detail-row total-row">
              <span>Total Deductions</span>
              <span>$${(record.totalDeductions || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="section net-pay">
            Net Pay: $${(record.netPay || 0).toFixed(2)}
          </div>
        </div>
      </body>
      </html>
    `;
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

  getLoanStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'DISBURSED': return 'disbursed';
      case 'PENDING': return 'pending';
      default: return 'draft';
    }
  }

  getExpenseStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING_APPROVAL': return 'pending';
      case 'DRAFT': return 'draft';
      default: return 'submitted';
    }
  }

  getAttendanceStatusBadge(record: AttendanceRecord): string {
    return record.status || 'ABSENT';
  }
}
