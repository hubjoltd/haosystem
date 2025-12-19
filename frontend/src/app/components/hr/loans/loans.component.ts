import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../services/loan.service';
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
  dashboard: any = {};
  loading = false;
  showForm = false;
  selectedLoan: any = null;
  formData: any = {};
  currentUserId: number = 0;

  constructor(private loanService: LoanService, private authService: AuthService) {
    this.currentUserId = this.authService.getCurrentUserId() || 0;
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadLoans();
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

  openForm(): void {
    this.formData = { loanType: 'PERSONAL', requestedTenureMonths: 12, interestRate: 0 };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = {};
  }

  saveLoan(): void {
    this.loanService.applyForLoan(this.formData).subscribe({
      next: () => { this.closeForm(); this.loadLoans(); },
      error: (err) => { console.error(err); alert('Error creating loan application'); }
    });
  }

  submitLoan(id: number): void {
    if (confirm('Submit this loan for approval?')) {
      this.loanService.submitLoan(id).subscribe({
        next: () => this.loadLoans(),
        error: (err) => console.error(err)
      });
    }
  }

  approveLoan(loan: any): void {
    if (confirm('Approve this loan?')) {
      this.loanService.approveLoan(loan.id, this.currentUserId, 'Approved', loan.requestedAmount).subscribe({
        next: () => { this.loadLoans(); this.loadDashboard(); },
        error: (err) => console.error(err)
      });
    }
  }

  rejectLoan(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.loanService.rejectLoan(id, reason).subscribe({
        next: () => this.loadLoans(),
        error: (err) => console.error(err)
      });
    }
  }

  disburseLoan(id: number): void {
    const date = new Date().toISOString().split('T')[0];
    if (confirm('Disburse this loan?')) {
      this.loanService.disburseLoan(id, date).subscribe({
        next: () => { this.loadLoans(); this.loadDashboard(); },
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

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary', 'PENDING_APPROVAL': 'bg-warning', 'APPROVED': 'bg-info',
      'DISBURSED': 'bg-primary', 'ACTIVE': 'bg-success', 'CLOSED': 'bg-dark',
      'REJECTED': 'bg-danger', 'PAID': 'bg-success', 'PENDING': 'bg-warning', 'OVERDUE': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}
