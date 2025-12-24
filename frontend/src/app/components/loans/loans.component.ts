import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss'
})
export class LoansApplicationComponent implements OnInit {
  loans: any[] = [];
  dashboard: any = {};
  loading = false;
  showForm = false;
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
    this.loading = false;
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

  save(): void {
    alert('Loan application submitted');
    this.closeForm();
    this.loadLoans();
  }
}
