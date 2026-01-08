import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../services/loan.service';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss'
})
export class LoansComponent implements OnInit {
  loans: any[] = [];
  repayments: any[] = [];
  employees: any[] = [];
  dashboard: any = {};
  loading = false;
  saving = false;
  showForm = false;
  showEmiPreview = false;
  showLedger = false;
  showApprovalModal = false;
  selectedLoan: any = null;
  ledgerLoan: any = null;
  formData: any = {};
  editMode = false;
  editId: number | null = null;
  emiSchedule: any[] = [];
  currentUserId: number = 0;
  activeTab = 'applications';
  approvalData: any = {};
  eligibilityMessage = '';
  eligibilityStatus = '';

  loanTypes = [
    { value: 'SALARY_ADVANCE', label: 'Salary Advance', maxMultiplier: 2, minService: 3 },
    { value: 'PERSONAL', label: 'Personal Loan', maxMultiplier: 6, minService: 6 },
    { value: 'EMERGENCY', label: 'Emergency Loan', maxMultiplier: 3, minService: 1 },
    { value: 'HOUSING', label: 'Housing Loan', maxMultiplier: 36, minService: 24 },
    { value: 'VEHICLE', label: 'Vehicle Loan', maxMultiplier: 12, minService: 12 },
    { value: 'EDUCATION', label: 'Education Loan', maxMultiplier: 12, minService: 12 }
  ];

  interestTypes = [
    { value: 'FLAT', label: 'Flat Rate' },
    { value: 'REDUCING', label: 'Reducing Balance' }
  ];

  constructor(
    private loanService: LoanService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getCurrentUserId() || 0;
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadLoans();
    this.loadEmployees();
  }

  loadDashboard(): void {
    this.loanService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  loadLoans(): void {
    this.loading = true;
    this.loanService.getLoans().subscribe({
      next: (data) => { this.loans = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadEmployees(): void {
    this.employeeService.getActive().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.loanService.getPendingApproval().subscribe({
        next: (data) => this.loans = data,
        error: (err) => console.error(err)
      });
    } else if (tab === 'outstanding') {
      this.loanService.getOutstandingLoans().subscribe({
        next: (data) => this.loans = data,
        error: (err) => console.error(err)
      });
    } else {
      this.loadLoans();
    }
  }

  openForm(): void {
    this.editMode = false;
    this.editId = null;
    this.formData = {
      loanType: 'PERSONAL',
      requestedTenureMonths: 12,
      interestRate: 8,
      interestType: 'REDUCING',
      requestedAmount: 0,
      employeeId: null,
      purpose: '',
      requestedDisbursementDate: new Date().toISOString().split('T')[0]
    };
    this.eligibilityMessage = '';
    this.eligibilityStatus = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = {};
    this.editMode = false;
    this.editId = null;
    this.eligibilityMessage = '';
    this.eligibilityStatus = '';
  }

  checkEligibility(): void {
    if (!this.formData.employeeId || !this.formData.loanType) {
      this.eligibilityMessage = 'Please select an employee and loan type first.';
      this.eligibilityStatus = 'warning';
      return;
    }

    const employee = this.employees.find(e => e.id === this.formData.employeeId);
    const loanType = this.loanTypes.find(t => t.value === this.formData.loanType);

    if (!employee || !loanType) {
      this.eligibilityMessage = 'Invalid selection.';
      this.eligibilityStatus = 'error';
      return;
    }

    this.loanService.getActiveLoansForEmployee(this.formData.employeeId).subscribe({
      next: (activeLoans) => {
        const hasActiveLoans = activeLoans && activeLoans.length > 0;
        const maxAmount = (employee.salary || 50000) * loanType.maxMultiplier;

        if (hasActiveLoans && this.formData.loanType !== 'EMERGENCY') {
          this.eligibilityMessage = `Employee has ${activeLoans.length} active loan(s). New loans may be restricted.`;
          this.eligibilityStatus = 'warning';
        } else {
          this.eligibilityMessage = `Eligible! Maximum loan amount: ${this.formatCurrency(maxAmount)}`;
          this.eligibilityStatus = 'success';
        }
      },
      error: () => {
        this.eligibilityMessage = 'Unable to verify eligibility at this time.';
        this.eligibilityStatus = 'warning';
      }
    });
  }

  calculateEmiPreview(): void {
    if (!this.formData.requestedAmount || !this.formData.requestedTenureMonths) return;

    const principal = this.formData.requestedAmount;
    const tenure = this.formData.requestedTenureMonths;
    const annualRate = this.formData.interestRate || 0;
    const isFlat = this.formData.interestType === 'FLAT';

    this.emiSchedule = [];
    let outstandingPrincipal = principal;
    let totalInterest = 0;
    let totalPayable = 0;

    if (annualRate === 0) {
      const emi = principal / tenure;
      for (let i = 1; i <= tenure; i++) {
        this.emiSchedule.push({
          installment: i,
          emi: emi,
          principal: emi,
          interest: 0,
          outstanding: outstandingPrincipal - emi
        });
        outstandingPrincipal -= emi;
      }
      totalPayable = principal;
    } else if (isFlat) {
      const totalInterestAmount = (principal * annualRate * tenure) / (100 * 12);
      totalInterest = totalInterestAmount;
      totalPayable = principal + totalInterestAmount;
      const emi = totalPayable / tenure;
      const monthlyInterest = totalInterestAmount / tenure;
      const monthlyPrincipal = principal / tenure;

      for (let i = 1; i <= tenure; i++) {
        outstandingPrincipal -= monthlyPrincipal;
        this.emiSchedule.push({
          installment: i,
          emi: emi,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          outstanding: Math.max(0, outstandingPrincipal)
        });
      }
    } else {
      const monthlyRate = annualRate / 1200;
      const onePlusRPowerN = Math.pow(1 + monthlyRate, tenure);
      const emi = (principal * monthlyRate * onePlusRPowerN) / (onePlusRPowerN - 1);

      for (let i = 1; i <= tenure; i++) {
        const interestAmount = outstandingPrincipal * monthlyRate;
        const principalAmount = emi - interestAmount;
        outstandingPrincipal -= principalAmount;

        totalInterest += interestAmount;
        this.emiSchedule.push({
          installment: i,
          emi: emi,
          principal: principalAmount,
          interest: interestAmount,
          outstanding: Math.max(0, outstandingPrincipal)
        });
      }
      totalPayable = principal + totalInterest;
    }

    this.formData.calculatedEmi = this.emiSchedule[0]?.emi || 0;
    this.formData.totalInterest = totalInterest;
    this.formData.totalPayable = totalPayable;
    this.showEmiPreview = true;
  }

  closeEmiPreview(): void {
    this.showEmiPreview = false;
  }

  saveLoan(): void {
    if (this.saving) return;
    
    if (!this.formData.employeeId || !this.formData.requestedAmount) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    
    const request = this.editMode && this.editId 
      ? this.loanService.updateLoan(this.editId, this.formData)
      : this.loanService.applyForLoan(this.formData);
    
    request.subscribe({
      next: () => {
        this.closeForm();
        this.loadLoans();
        this.loadDashboard();
        this.saving = false;
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        const errorMsg = err.error?.message || err.error?.error || 'Error saving loan application';
        alert(errorMsg);
      }
    });
  }

  openEditForm(loan: any): void {
    this.editMode = true;
    this.editId = loan.id;
    this.formData = {
      loanType: loan.loanType,
      requestedTenureMonths: loan.requestedTenureMonths,
      interestRate: loan.interestRate,
      interestType: loan.interestType || 'REDUCING',
      requestedAmount: loan.requestedAmount,
      employeeId: loan.employee?.id,
      purpose: loan.purpose || '',
      requestedDisbursementDate: loan.requestedDisbursementDate || ''
    };
    this.eligibilityMessage = '';
    this.eligibilityStatus = '';
    this.showForm = true;
  }

  submitLoan(id: number): void {
    if (confirm('Submit this loan for approval?')) {
      this.loanService.submitLoan(id).subscribe({
        next: () => {
          this.loadLoans();
          this.loadDashboard();
        },
        error: (err) => console.error(err)
      });
    }
  }

  openApprovalModal(loan: any): void {
    this.selectedLoan = loan;
    this.approvalData = {
      approvedAmount: loan.requestedAmount,
      approvedTenure: loan.requestedTenureMonths,
      remarks: ''
    };
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedLoan = null;
    this.approvalData = {};
  }

  approveLoan(): void {
    if (!this.selectedLoan) return;

    this.loanService.approveLoan(
      this.selectedLoan.id,
      this.currentUserId,
      this.approvalData.remarks,
      this.approvalData.approvedAmount
    ).subscribe({
      next: () => {
        this.closeApprovalModal();
        this.loadLoans();
        this.loadDashboard();
      },
      error: (err) => console.error(err)
    });
  }

  rejectLoan(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.loanService.rejectLoan(id, reason).subscribe({
        next: () => {
          this.loadLoans();
          this.loadDashboard();
        },
        error: (err) => console.error(err)
      });
    }
  }

  disburseLoan(id: number): void {
    const date = new Date().toISOString().split('T')[0];
    if (confirm('Disburse this loan? This will generate the repayment schedule.')) {
      this.loanService.disburseLoan(id, date).subscribe({
        next: () => {
          this.loadLoans();
          this.loadDashboard();
        },
        error: (err) => console.error(err)
      });
    }
  }

  viewRepayments(loan: any): void {
    this.selectedLoan = loan;
    this.loanService.getRepaymentsByLoan(loan.id).subscribe({
      next: (data) => this.repayments = data,
      error: (err) => console.error(err)
    });
  }

  closeRepayments(): void {
    this.selectedLoan = null;
    this.repayments = [];
  }

  viewLedger(loan: any): void {
    this.ledgerLoan = loan;
    this.loanService.getRepaymentsByLoan(loan.id).subscribe({
      next: (data) => {
        this.repayments = data;
        this.showLedger = true;
      },
      error: (err) => console.error(err)
    });
  }

  closeLedger(): void {
    this.showLedger = false;
    this.ledgerLoan = null;
    this.repayments = [];
  }

  getLedgerOpeningBalance(): number {
    return this.ledgerLoan?.approvedAmount || 0;
  }

  getLedgerPaidPrincipal(): number {
    return this.repayments
      .filter(r => r.status === 'PAID')
      .reduce((sum, r) => sum + (r.principalAmount || 0), 0);
  }

  getLedgerPaidInterest(): number {
    return this.repayments
      .filter(r => r.status === 'PAID')
      .reduce((sum, r) => sum + (r.interestAmount || 0), 0);
  }

  getLedgerClosingBalance(): number {
    return this.ledgerLoan?.outstandingBalance || 0;
  }

  recordManualPayment(repayment: any): void {
    const amount = prompt('Enter payment amount:', repayment.emiAmount?.toString());
    if (amount) {
      const paymentDate = new Date().toISOString().split('T')[0];
      this.loanService.recordPayment(repayment.id, parseFloat(amount), paymentDate).subscribe({
        next: () => {
          if (this.selectedLoan) {
            this.viewRepayments(this.selectedLoan);
          }
          this.loadLoans();
          this.loadDashboard();
        },
        error: (err) => console.error(err)
      });
    }
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary',
      'PENDING_APPROVAL': 'bg-warning',
      'APPROVED': 'bg-info',
      'DISBURSED': 'bg-primary',
      'ACTIVE': 'bg-success',
      'CLOSED': 'bg-dark',
      'REJECTED': 'bg-danger',
      'PAID': 'bg-success',
      'PENDING': 'bg-warning',
      'OVERDUE': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getEligibilityClass(): string {
    const classes: { [key: string]: string } = {
      'success': 'eligibility-success',
      'warning': 'eligibility-warning',
      'error': 'eligibility-error'
    };
    return classes[this.eligibilityStatus] || '';
  }
}
