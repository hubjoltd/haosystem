import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, PayrollRecord } from '../../../services/payroll.service';
import { LeaveService, LeaveBalance, LeaveRequest, ApprovalActivity } from '../../../services/leave.service';
import { LoanService } from '../../../services/loan.service';
import { ExpenseService } from '../../../services/expense.service';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { DocumentService, EmployeeDocument, DocumentType, ChecklistCategory, ChecklistDocumentType } from '../../../services/document.service';
import { EmployeeService, EmployeeAsset, Employee } from '../../../services/employee.service';
import { SalarySlipService, SalarySlipData, EmployeeSlipInfo } from '../../../services/salary-slip.service';
import { PayslipComponent, PayslipData } from '../payslip/payslip.component';
import { ActivityTimelineComponent, ActivityItem } from '../../shared/activity-timeline/activity-timeline.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-employee-self-service',
  standalone: true,
  imports: [CommonModule, FormsModule, PayslipComponent, TranslateModule, ActivityTimelineComponent],
  templateUrl: './employee-self-service.component.html',
  styleUrls: ['./employee-self-service.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  documentChecklist: ChecklistCategory[] = [];
  assets: EmployeeAsset[] = [];
  policies: any[] = [];
  expenseCategories: any[] = [];
  
  currentEmployeeId: number = 0;
  currentEmployee: Employee | null = null;
  selectedPaystub: PayrollRecord | null = null;
  showPaystubModal = false;
  payslipData: PayslipData | null = null;
  
  showLeaveRequestModal = false;
  newLeaveRequest = {
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  };
  leaveTypes: any[] = [];

  // Expense Request Modal
  showExpenseRequestModal = false;
  newExpenseRequest: {
    categoryId: number;
    amount: number;
    description: string;
    expenseDate: string;
    receiptNumber: string;
    receiptFile: File | null;
    receiptPreview: string;
  } = {
    categoryId: 0,
    amount: 0,
    description: '',
    expenseDate: '',
    receiptNumber: '',
    receiptFile: null,
    receiptPreview: ''
  };
  showReceiptPreviewModal = false;
  selectedReceiptUrl = '';

  // Loan Request Modal
  showLoanRequestModal = false;
  newLoanRequest = {
    loanType: 'PERSONAL',
    amount: 0,
    numberOfEmi: 12,
    reason: ''
  };
  loanTypes = ['PERSONAL', 'SALARY_ADVANCE', 'EMERGENCY', 'EDUCATION', 'MEDICAL', 'TRAVEL'];

  // Attendance Summary
  attendanceSummary = {
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 0,
    totalWorkingHours: 0,
    currentMonth: ''
  };

  companyName = 'Hao System Corporation';
  companyAddress = '123 Business Park, Suite 500, New York, NY 10001';

  submittingLeave = false;
  submittingExpense = false;
  submittingLoan = false;

  // Activity modal for leave requests
  showLeaveActivityModal = false;
  selectedLeaveRequest: LeaveRequest | null = null;
  leaveActivityItems: ActivityItem[] = [];
  loadingLeaveActivity = false;

  // Activity modal for expense requests
  showExpenseActivityModal = false;
  selectedExpenseRequest: any = null;
  expenseActivityItems: ActivityItem[] = [];
  loadingExpenseActivity = false;

  constructor(
    private payrollService: PayrollService,
    private leaveService: LeaveService,
    private loanService: LoanService,
    private expenseService: ExpenseService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private documentService: DocumentService,
    private employeeService: EmployeeService,
    private salarySlipService: SalarySlipService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
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
    this.loadExpenseCategories();
    this.loadAttendance();
    this.loadDocuments();
    this.loadAssets();
    this.loadPolicies();
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
    this.leaveService.initializeBalances(this.currentEmployeeId).subscribe({
      next: () => {
        this.leaveService.getEmployeeBalances(this.currentEmployeeId).subscribe({
          next: (data: LeaveBalance[]) => {
            this.leaveBalances = data;
            this.cdr.markForCheck();
          },
          error: (err: Error) => console.error('Error loading leave balances:', err)
        });
      },
      error: () => {
        this.leaveService.getEmployeeBalances(this.currentEmployeeId).subscribe({
          next: (data: LeaveBalance[]) => {
            this.leaveBalances = data;
            this.cdr.markForCheck();
          },
          error: (err: Error) => console.error('Error loading leave balances:', err)
        });
      }
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
    this.payslipData = this.convertToPayslipData(paystub);
    this.showPaystubModal = true;
  }

  closePaystubModal(): void {
    this.showPaystubModal = false;
    this.selectedPaystub = null;
    this.payslipData = null;
  }

  convertToPayslipData(record: PayrollRecord): PayslipData {
    const emp = record.employee || this.currentEmployee;
    const run = record.payrollRun;
    return {
      employeeId: emp?.employeeCode || `EMP${String(this.currentEmployeeId).padStart(3, '0')}`,
      employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Employee',
      employeeDesignation: emp?.designation?.name || emp?.jobTitle || 'Employee',
      department: emp?.department?.name || 'General',
      payPeriod: run?.payFrequency?.name || 'Monthly',
      payDate: run?.payDate || new Date().toISOString().split('T')[0],
      periodFrom: run?.periodStartDate || '',
      periodTo: run?.periodEndDate || '',
      basePay: record.basePay || 0,
      regularHours: record.regularHours || 0,
      overtimeHours: record.overtimeHours || 0,
      overtimePay: record.overtimePay || 0,
      bonuses: record.bonuses || 0,
      allowances: 0,
      reimbursements: record.reimbursements || 0,
      grossPay: record.grossPay || 0,
      federalTax: record.federalTax || 0,
      stateTax: record.stateTax || 0,
      socialSecurityTax: record.socialSecurityTax || 0,
      medicareTax: record.medicareTax || 0,
      healthInsurance: record.healthInsurance || 0,
      retirement401k: record.retirement401k || 0,
      loanDeductions: record.loanDeductions || 0,
      otherDeductions: 0,
      totalDeductions: record.totalDeductions || 0,
      netPay: record.netPay || 0,
      expenses: record.reimbursements || 0
    };
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
    if (this.submittingLeave) return;
    if (!this.newLeaveRequest.startDate || !this.newLeaveRequest.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    this.submittingLeave = true;
    this.cdr.markForCheck();
    const request = {
      employeeId: this.currentEmployeeId,
      leaveTypeId: this.newLeaveRequest.leaveTypeId,
      startDate: this.newLeaveRequest.startDate,
      endDate: this.newLeaveRequest.endDate,
      reason: this.newLeaveRequest.reason
    };

    this.leaveService.createRequest(request).subscribe({
      next: () => {
        this.submittingLeave = false;
        this.cdr.markForCheck();
        this.closeLeaveRequestModal();
        this.loadLeaveRequests();
        this.loadLeaveBalances();
        this.toastService.success('Leave request submitted successfully!');
      },
      error: (err: any) => {
        this.submittingLeave = false;
        this.cdr.markForCheck();
        console.error('Error submitting leave request:', err);
        const message = err.error?.message || err.message || 'Error submitting leave request';
        this.toastService.error(message);
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
      next: (data) => {
        this.attendanceRecords = data;
        this.calculateAttendanceSummary();
      },
      error: (err) => console.error('Error loading attendance:', err)
    });
  }

  calculateAttendanceSummary(): void {
    const now = new Date();
    this.attendanceSummary.currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    const currentMonthRecords = this.attendanceRecords.filter(r => {
      const recordDate = new Date(r.attendanceDate);
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    });

    this.attendanceSummary.presentDays = currentMonthRecords.filter(r => 
      r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LATE'
    ).length;
    this.attendanceSummary.absentDays = currentMonthRecords.filter(r => r.status === 'ABSENT').length;
    this.attendanceSummary.lateDays = currentMonthRecords.filter(r => r.status === 'LATE').length;
    this.attendanceSummary.overtimeHours = currentMonthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    this.attendanceSummary.totalWorkingHours = currentMonthRecords.reduce((sum, r) => sum + (r.regularHours || 0), 0);
  }

  loadExpenseCategories(): void {
    this.expenseService.getCategories().subscribe({
      next: (data) => this.expenseCategories = data,
      error: (err) => console.error('Error loading expense categories:', err)
    });
  }

  loadPolicies(): void {
    // Load HR Policies (using a mock for now, can be connected to backend)
    this.policies = [
      { id: 1, title: 'Leave Policy', category: 'HR', description: 'Guidelines for leave applications and approvals', updatedAt: '2024-01-15' },
      { id: 2, title: 'Expense Reimbursement Policy', category: 'Finance', description: 'Rules for expense claims and reimbursements', updatedAt: '2024-02-01' },
      { id: 3, title: 'Code of Conduct', category: 'HR', description: 'Employee behavior and ethics guidelines', updatedAt: '2024-01-10' },
      { id: 4, title: 'Remote Work Policy', category: 'HR', description: 'Guidelines for work from home arrangements', updatedAt: '2024-03-01' },
      { id: 5, title: 'IT Security Policy', category: 'IT', description: 'Information security and data protection guidelines', updatedAt: '2024-02-15' },
      { id: 6, title: 'Performance Review Policy', category: 'HR', description: 'Annual performance evaluation process', updatedAt: '2024-01-20' }
    ];
  }

  // Expense Request Methods
  openExpenseRequestModal(): void {
    this.newExpenseRequest = {
      categoryId: this.expenseCategories.length > 0 ? this.expenseCategories[0].id : 0,
      amount: 0,
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      receiptFile: null,
      receiptPreview: ''
    };
    this.showExpenseRequestModal = true;
  }

  closeExpenseRequestModal(): void {
    this.showExpenseRequestModal = false;
  }

  onReceiptFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 500 * 1024) {
        alert('File size must be less than 500KB');
        input.value = '';
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image (JPEG, PNG, GIF) or PDF file');
        input.value = '';
        return;
      }
      this.newExpenseRequest.receiptFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newExpenseRequest.receiptPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeReceiptFile(): void {
    this.newExpenseRequest.receiptFile = null;
    this.newExpenseRequest.receiptPreview = '';
  }

  openReceiptPreview(receiptUrl: string): void {
    this.selectedReceiptUrl = receiptUrl;
    this.showReceiptPreviewModal = true;
  }

  closeReceiptPreview(): void {
    this.showReceiptPreviewModal = false;
    this.selectedReceiptUrl = '';
  }

  submitExpenseRequest(): void {
    if (this.submittingExpense) return;
    if (!this.newExpenseRequest.amount || !this.newExpenseRequest.description) {
      alert('Please fill in all required fields');
      return;
    }

    this.submittingExpense = true;
    this.cdr.markForCheck();
    
    let receiptUrl = '';
    if (this.newExpenseRequest.receiptPreview) {
      receiptUrl = this.newExpenseRequest.receiptPreview;
    }
    
    const request = {
      employeeId: this.currentEmployeeId,
      categoryId: this.newExpenseRequest.categoryId,
      totalAmount: this.newExpenseRequest.amount,
      description: this.newExpenseRequest.description,
      expenseDate: this.newExpenseRequest.expenseDate,
      receiptNumber: this.newExpenseRequest.receiptNumber,
      receiptUrl: receiptUrl,
      status: 'PENDING_APPROVAL'
    };

    this.expenseService.createRequest(request).subscribe({
      next: () => {
        this.submittingExpense = false;
        this.closeExpenseRequestModal();
        this.loadExpenses();
        this.cdr.markForCheck();
        this.toastService.success('Expense request submitted successfully!');
      },
      error: (err: any) => {
        this.submittingExpense = false;
        this.cdr.markForCheck();
        console.error('Error submitting expense request:', err);
        const message = err.error?.message || err.message || 'Error submitting expense request';
        this.toastService.error(message);
      }
    });
  }

  // Loan Request Methods
  openLoanRequestModal(): void {
    this.newLoanRequest = {
      loanType: 'PERSONAL',
      amount: 0,
      numberOfEmi: 12,
      reason: ''
    };
    this.showLoanRequestModal = true;
  }

  closeLoanRequestModal(): void {
    this.showLoanRequestModal = false;
  }

  submitLoanRequest(): void {
    if (this.submittingLoan) return;
    if (!this.newLoanRequest.amount || !this.newLoanRequest.reason) {
      alert('Please fill in all required fields');
      return;
    }

    this.submittingLoan = true;
    this.cdr.markForCheck();
    const request = {
      employeeId: this.currentEmployeeId,
      loanType: this.newLoanRequest.loanType,
      requestedAmount: this.newLoanRequest.amount,
      requestedTenureMonths: this.newLoanRequest.numberOfEmi,
      purpose: this.newLoanRequest.reason,
      status: 'PENDING'
    };

    this.loanService.createApplication(request).subscribe({
      next: () => {
        this.submittingLoan = false;
        this.cdr.markForCheck();
        this.closeLoanRequestModal();
        this.loadLoans();
        this.toastService.success('Loan application submitted successfully!');
      },
      error: (err: any) => {
        this.submittingLoan = false;
        this.cdr.markForCheck();
        console.error('Error submitting loan application:', err);
        const message = err.error?.message || err.message || 'Error submitting loan application';
        this.toastService.error(message);
      }
    });
  }

  getEmiAmount(): number {
    if (this.newLoanRequest.amount > 0 && this.newLoanRequest.numberOfEmi > 0) {
      return this.newLoanRequest.amount / this.newLoanRequest.numberOfEmi;
    }
    return 0;
  }

  downloadPaystub(record: PayrollRecord): void {
    const salarySlipData = this.buildSalarySlipData(record);
    this.salarySlipService.generateSalarySlipPDF(salarySlipData);
  }

  printPaystub(record: PayrollRecord): void {
    const salarySlipData = this.buildSalarySlipData(record);
    this.salarySlipService.printSalarySlipPDF(salarySlipData);
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

  getAvailableBalance(balance: LeaveBalance): number {
    if (balance.availableBalance !== undefined && balance.availableBalance !== null) {
      return balance.availableBalance;
    }
    const total = this.getTotalEntitlement(balance);
    const usedAmt = balance.used || 0;
    const pendingAmt = balance.pending || 0;
    const lapsedAmt = balance.lapsed || 0;
    const encashedAmt = balance.encashed || 0;
    return total - usedAmt - pendingAmt - lapsedAmt - encashedAmt;
  }

  getBalancePercentage(balance: LeaveBalance): number {
    const total = this.getTotalEntitlement(balance);
    if (total === 0) return 0;
    return (this.getAvailableBalance(balance) / total) * 100;
  }

  getLeaveTypeClass(typeName: string | undefined): string {
    if (!typeName) return 'leave-default';
    const name = typeName.toLowerCase();
    if (name.includes('annual') || name.includes('vacation')) return 'leave-annual';
    if (name.includes('sick') || name.includes('medical')) return 'leave-sick';
    if (name.includes('casual')) return 'leave-casual';
    if (name.includes('maternity')) return 'leave-maternity';
    if (name.includes('paternity')) return 'leave-paternity';
    if (name.includes('unpaid')) return 'leave-unpaid';
    return 'leave-default';
  }

  getLeaveTypeIcon(typeName: string | undefined): string {
    if (!typeName) return 'fas fa-calendar-alt';
    const name = typeName.toLowerCase();
    if (name.includes('annual') || name.includes('vacation')) return 'fas fa-umbrella-beach';
    if (name.includes('sick') || name.includes('medical')) return 'fas fa-heartbeat';
    if (name.includes('casual')) return 'fas fa-coffee';
    if (name.includes('maternity')) return 'fas fa-baby';
    if (name.includes('paternity')) return 'fas fa-baby-carriage';
    if (name.includes('unpaid')) return 'fas fa-calendar-times';
    return 'fas fa-calendar-alt';
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
    this.documentService.getEmployeeDocumentChecklist(this.currentEmployeeId).subscribe({
      next: (data) => this.documentChecklist = data,
      error: (err) => console.error('Error loading document checklist:', err)
    });
  }

  getCategoryColorClass(code: string): string {
    switch (code) {
      case 'ID_WORK_AUTH': return 'category-blue';
      case 'TAX_PAYROLL': return 'category-yellow';
      case 'EMPLOYMENT_HR': return 'category-green';
      case 'FEDERAL_COMPLIANCE': return 'category-orange';
      case 'CERTIFICATIONS': return 'category-red';
      case 'OTHER_DOCS': return 'category-purple';
      default: return 'category-default';
    }
  }

  getTotalDocuments(): number {
    return this.documentChecklist.reduce((sum, cat) => sum + cat.totalDocuments, 0);
  }

  getTotalUploaded(): number {
    return this.documentChecklist.reduce((sum, cat) => sum + cat.uploadedDocuments, 0);
  }

  downloadDocument(doc: ChecklistDocumentType): void {
    if (doc.fileUrl) {
      if (doc.fileUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.fileName || 'document';
        link.click();
      } else {
        window.open(doc.fileUrl, '_blank');
      }
    }
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

  getCategoryColor(code: string): string {
    const colors: { [key: string]: string } = {
      'TRAVEL': '#3498db',
      'MEALS': '#e67e22',
      'OFFICE': '#9b59b6',
      'COMMUNICATION': '#1abc9c',
      'TRANSPORT': '#f39c12',
      'EQUIPMENT': '#e74c3c',
      'TRAINING': '#2ecc71',
      'ENTERTAINMENT': '#e91e63',
      'ACCOMMODATION': '#00bcd4',
      'MEDICAL': '#ff5722',
      'SUPPLIES': '#795548',
      'UTILITIES': '#607d8b',
      'MARKETING': '#673ab7',
      'SOFTWARE': '#009688',
      'MISC': '#9e9e9e'
    };
    return colors[code] || '#008080';
  }

  getCategoryIcon(code: string): string {
    const icons: { [key: string]: string } = {
      'TRAVEL': 'fa-plane',
      'MEALS': 'fa-utensils',
      'OFFICE': 'fa-building',
      'COMMUNICATION': 'fa-phone',
      'TRANSPORT': 'fa-car',
      'EQUIPMENT': 'fa-laptop',
      'TRAINING': 'fa-graduation-cap',
      'ENTERTAINMENT': 'fa-film',
      'ACCOMMODATION': 'fa-hotel',
      'MEDICAL': 'fa-medkit',
      'SUPPLIES': 'fa-box',
      'UTILITIES': 'fa-bolt',
      'MARKETING': 'fa-bullhorn',
      'SOFTWARE': 'fa-code',
      'MISC': 'fa-ellipsis-h'
    };
    return icons[code] || 'fa-receipt';
  }

  // Leave Activity Modal Methods
  openLeaveActivityModal(request: LeaveRequest): void {
    this.selectedLeaveRequest = request;
    this.showLeaveActivityModal = true;
    this.loadLeaveActivity(request.id!);
  }

  closeLeaveActivityModal(): void {
    this.showLeaveActivityModal = false;
    this.selectedLeaveRequest = null;
    this.leaveActivityItems = [];
  }

  loadLeaveActivity(requestId: number): void {
    this.loadingLeaveActivity = true;
    this.cdr.markForCheck();
    
    this.leaveService.getRequestActivity(requestId).subscribe({
      next: (activities) => {
        this.leaveActivityItems = activities.map(a => ({
          id: a.id,
          action: a.action,
          performedBy: a.performedBy,
          performedAt: a.performedAt,
          remarks: a.remarks,
          oldStatus: a.oldStatus,
          newStatus: a.newStatus
        }));
        this.loadingLeaveActivity = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.leaveActivityItems = this.generateLeaveActivityMock();
        this.loadingLeaveActivity = false;
        this.cdr.markForCheck();
      }
    });
  }

  generateLeaveActivityMock(): ActivityItem[] {
    if (!this.selectedLeaveRequest) return [];
    const activities: ActivityItem[] = [];
    
    activities.push({
      action: 'Request Submitted',
      performedBy: this.currentEmployee,
      performedAt: this.selectedLeaveRequest.createdAt || this.selectedLeaveRequest.startDate,
      remarks: this.selectedLeaveRequest.reason,
      newStatus: 'PENDING_MANAGER'
    });

    if (this.selectedLeaveRequest.managerApprovedAt) {
      activities.push({
        action: this.selectedLeaveRequest.managerApprovalStatus === 'APPROVED' ? 'Manager Approved' : 'Manager Rejected',
        performedBy: this.selectedLeaveRequest.managerApprovedBy,
        performedAt: this.selectedLeaveRequest.managerApprovedAt,
        remarks: this.selectedLeaveRequest.managerRemarks,
        oldStatus: 'PENDING_MANAGER',
        newStatus: this.selectedLeaveRequest.managerApprovalStatus === 'APPROVED' ? 'PENDING_HR' : 'REJECTED'
      });
    }

    if (this.selectedLeaveRequest.hrApprovedAt) {
      activities.push({
        action: this.selectedLeaveRequest.hrApprovalStatus === 'APPROVED' ? 'HR Approved' : 'HR Rejected',
        performedBy: this.selectedLeaveRequest.hrApprovedBy,
        performedAt: this.selectedLeaveRequest.hrApprovedAt,
        remarks: this.selectedLeaveRequest.hrRemarks,
        oldStatus: 'PENDING_HR',
        newStatus: this.selectedLeaveRequest.hrApprovalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED'
      });
    }

    return activities.reverse();
  }

  onAddLeaveNote(note: string): void {
    if (this.selectedLeaveRequest?.id) {
      this.leaveService.addActivityNote(this.selectedLeaveRequest.id, note).subscribe({
        next: () => {
          this.toastService.success('Note added');
          this.loadLeaveActivity(this.selectedLeaveRequest!.id!);
        },
        error: () => {
          this.toastService.error('Failed to add note');
        }
      });
    }
  }

  // Expense Activity Modal Methods
  openExpenseActivityModal(expense: any): void {
    this.selectedExpenseRequest = expense;
    this.showExpenseActivityModal = true;
    this.loadExpenseActivity(expense.id);
  }

  closeExpenseActivityModal(): void {
    this.showExpenseActivityModal = false;
    this.selectedExpenseRequest = null;
    this.expenseActivityItems = [];
  }

  loadExpenseActivity(requestId: number): void {
    this.loadingExpenseActivity = true;
    this.cdr.markForCheck();
    
    this.expenseService.getRequestActivity(requestId).subscribe({
      next: (activities) => {
        this.expenseActivityItems = activities.map(a => ({
          id: a.id,
          action: a.action,
          performedBy: a.performedBy,
          performedAt: a.performedAt,
          remarks: a.remarks,
          oldStatus: a.oldStatus,
          newStatus: a.newStatus
        }));
        this.loadingExpenseActivity = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.expenseActivityItems = this.generateExpenseActivityMock();
        this.loadingExpenseActivity = false;
        this.cdr.markForCheck();
      }
    });
  }

  generateExpenseActivityMock(): ActivityItem[] {
    if (!this.selectedExpenseRequest) return [];
    return [{
      action: 'Expense Submitted',
      performedBy: this.currentEmployee,
      performedAt: this.selectedExpenseRequest.createdAt || this.selectedExpenseRequest.expenseDate,
      remarks: this.selectedExpenseRequest.description,
      newStatus: this.selectedExpenseRequest.status
    }];
  }

  onAddExpenseNote(note: string): void {
    if (this.selectedExpenseRequest?.id) {
      this.expenseService.addActivityNote(this.selectedExpenseRequest.id, note).subscribe({
        next: () => {
          this.toastService.success('Note added');
          this.loadExpenseActivity(this.selectedExpenseRequest.id);
        },
        error: () => {
          this.toastService.error('Failed to add note');
        }
      });
    }
  }

  getLeaveStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'PENDING_MANAGER':
      case 'PENDING_HR':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return '';
    }
  }

  getApprovalStatusText(request: LeaveRequest): string {
    if (request.managerApprovalStatus === 'APPROVED' && !request.hrApprovalStatus) {
      return 'Awaiting HR';
    } else if (!request.managerApprovalStatus) {
      return 'Awaiting Manager';
    } else if (request.status === 'APPROVED') {
      return 'Approved';
    } else if (request.status === 'REJECTED') {
      return 'Rejected';
    }
    return request.status || '';
  }
}
