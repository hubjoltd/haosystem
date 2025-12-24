import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-repayments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repayments.component.html',
  styleUrl: './repayments.component.scss'
})
export class LoanRepaymentsComponent implements OnInit {
  repayments: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadRepayments();
  }

  loadRepayments(): void {
    this.loading = false;
    setTimeout(() => { this.loading = false; }, 500);
  }
}
