import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollRecord } from '../../../services/payroll.service';
import { LeaveService, LeaveBalance, LeaveRequest } from '../../../services/leave.service';
import { LoanService } from '../../../services/loan.service';
import { ExpenseService } from '../../../services/expense.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { DocumentService, EmployeeDocument, DocumentType } from '../../../services/document.service';
import { EmployeeService, EmployeeAsset, Employee } from '../../../services/employee.service';
import { SalarySlipService, SalarySlipData, EmployeeSlipInfo } from '../../../services/salary-slip.service';

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
  documents: EmployeeDocument[] = [];
  documentTypes: DocumentType[] = [];
  assets: EmployeeAsset[] = [];
  
  currentEmployeeId: number = 0;
  currentEmployee: Employee | null = null;
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

  companyName = 'Hao System Corporation';
  companyAddress = '123 Business Park, Suite 500, New York, NY 10001';

  constructor(
    private payrollService: PayrollService,
    private leaveService: LeaveService,
    private loanService: LoanService,
    private expenseService: ExpenseService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private documentService: DocumentService,
    private employeeService: EmployeeService,
    private salarySlipService: SalarySlipService
  ) {
    this.currentEmployeeId = this.authService.getCurrentUserId() || 0;
  }

  ngOnInit(): void {
    this.loadCurrentEmployee();
    this.loadPaystubs();
    this.loadLeaveBalances();
    this.loadLeaveRequests();
    this.loadLeaveTypes();
    this.loadLoans();
    this.loadExpenses();
    this.loadAttendance();
    this.loadDocuments();
    this.loadAssets();
  }

  loadCurrentEmployee(): void {
    this.employeeService.getById(this.currentEmployeeId).subscribe({
      next: (data) => this.currentEmployee = data,
      error: (err) => console.error('Error loading employee:', err)
    });
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
    const salarySlipData = this.buildSalarySlipData(record);
    this.salarySlipService.downloadSalarySlipPDF(salarySlipData);
  }

  printPaystub(record: PayrollRecord): void {
    const salarySlipData = this.buildSalarySlipData(record);
    this.salarySlipService.generateSalarySlipPDF(salarySlipData);
  }

  private buildSalarySlipData(record: PayrollRecord): SalarySlipData {
    const emp = this.currentEmployee;
    const payDate = record.payrollRun?.payDate ? new Date(record.payrollRun.payDate) : new Date();
    const payMonth = payDate.toLocaleString('en-US', { month: 'long' });
    const payYear = payDate.getFullYear();
    
    const employeeInfo: EmployeeSlipInfo = {
      name: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      employeeCode: emp?.employeeCode || `EMP-${this.currentEmployeeId}`,
      designation: emp?.designation?.title || 'Staff',
      dateOfJoining: emp?.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A',
      uanNumber: emp?.aadharNumber || undefined,
      pfAccountNumber: emp?.panNumber || undefined,
      bankAccountNumber: undefined,
      department: emp?.department?.name || undefined
    };
    
    return {
      employee: employeeInfo,
      payrollRecord: record,
      companyName: this.companyName,
      companyAddress: this.companyAddress,
      payMonth: payMonth,
      payYear: payYear,
      paidDays: 22,
      lopDays: 0
    };
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

  loadDocuments(): void {
    this.documentService.getEmployeeDocuments(this.currentEmployeeId).subscribe({
      next: (data) => this.documents = data,
      error: (err) => console.error('Error loading documents:', err)
    });
    this.documentService.getTypes().subscribe({
      next: (data) => this.documentTypes = data,
      error: (err) => console.error('Error loading document types:', err)
    });
  }

  loadAssets(): void {
    this.employeeService.getAssets(this.currentEmployeeId).subscribe({
      next: (data) => this.assets = data,
      error: (err) => console.error('Error loading assets:', err)
    });
  }

  getDocumentStatusClass(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING': return 'pending';
      default: return 'pending';
    }
  }

  getAssetStatusClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'approved';
      case 'RETURNED': return 'returned';
      case 'PENDING': return 'pending';
      default: return 'pending';
    }
  }

  isDocumentExpiring(doc: EmployeeDocument): boolean {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  isDocumentExpired(doc: EmployeeDocument): boolean {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    return expiry < new Date();
  }
}
