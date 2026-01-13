import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface PayslipData {
  employeeId: string;
  employeeName: string;
  employeeDesignation?: string;
  department?: string;
  payPeriod: string;
  payDate: string;
  periodFrom?: string;
  periodTo?: string;
  basePay: number;
  regularHours?: number;
  overtimeHours?: number;
  overtimePay?: number;
  bonuses?: number;
  allowances?: number;
  reimbursements?: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  healthInsurance?: number;
  retirement401k?: number;
  loanDeductions?: number;
  otherDeductions?: number;
  totalDeductions: number;
  netPay: number;
  ytdGross?: number;
  ytdTax?: number;
  ytdNet?: number;
  expenses?: number;
  bankAccount?: string;
}

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  @Input() payslipData: PayslipData | null = null;
  @Input() companyName = 'Hao System Corporation';
  @Input() companyAddress = '123 Business Park, Suite 500, New York, NY 10001';
  @Input() companyPhone = '+1 (555) 123-4567';
  @Input() companyEmail = 'hr@haosystem.com';
  @Input() showModal = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() printPayslip = new EventEmitter<void>();
  @Output() downloadPayslip = new EventEmitter<void>();

  currentDate = new Date();

  ngOnInit(): void {}

  onClose(): void {
    this.closeModal.emit();
  }

  onPrint(): void {
    this.printPayslip.emit();
    window.print();
  }

  onDownload(): void {
    this.downloadPayslip.emit();
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '$0.00';
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
}
