import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loan-repayments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
    this.loading = true;
    setTimeout(() => { this.loading = false; }, 500);
  }
}
