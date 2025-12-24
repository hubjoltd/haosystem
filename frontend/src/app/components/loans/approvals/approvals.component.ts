import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../services/loan.service';

@Component({
  selector: 'app-loan-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class LoanApprovalsComponent implements OnInit {
  pendingLoans: any[] = [];
  loading = false;
  approverId = 1;

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loadPendingLoans();
  }

  loadPendingLoans(): void {
    this.loading = false;
    this.loanService.getLoans().subscribe({
      next: (data: any[]) => { this.pendingLoans = data.filter((l: any) => l.status === 'PENDING'); this.loading = false; },
      error: (err: any) => { console.error(err); this.loading = false; }
    });
  }

  approve(loan: any): void {
    this.loanService.approveLoan(loan.id, this.approverId, 'Approved').subscribe({
      next: () => { alert('Loan approved'); this.loadPendingLoans(); },
      error: (err: any) => console.error('Error:', err)
    });
  }

  reject(loan: any): void {
    this.loanService.rejectLoan(loan.id, 'Does not meet criteria').subscribe({
      next: () => { alert('Loan rejected'); this.loadPendingLoans(); },
      error: (err: any) => console.error('Error:', err)
    });
  }
}
