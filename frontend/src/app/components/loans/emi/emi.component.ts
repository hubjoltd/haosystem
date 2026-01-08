import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-emi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi.component.html',
  styleUrl: './emi.component.scss'
})
export class LoanEmiComponent implements OnInit {
  emiSchedules: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadEmiSchedules();
  }

  loadEmiSchedules(): void {
    this.loading = true;
    setTimeout(() => { this.loading = false; this.emiSchedules = []; }, 500);
  }
}
