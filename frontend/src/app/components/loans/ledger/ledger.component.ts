import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ledger.component.html',
  styleUrl: './ledger.component.scss'
})
export class LoanLedgerComponent implements OnInit {
  ledgerEntries: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadLedger();
  }

  loadLedger(): void {
    this.loading = false;
    setTimeout(() => { this.loading = false; }, 500);
  }
}
