import { Injectable } from '@angular/core';
import { PayrollRecord } from './payroll.service';

export interface EmployeeSlipInfo {
  name: string;
  employeeCode: string;
  designation: string;
  dateOfJoining: string;
  uanNumber?: string;
  pfAccountNumber?: string;
  bankAccountNumber?: string;
  department?: string;
}

export interface SalarySlipData {
  employee: EmployeeSlipInfo;
  payrollRecord: PayrollRecord;
  companyName: string;
  companyAddress: string;
  payMonth: string;
  payYear: number;
  paidDays: number;
  lopDays: number;
  ytdEarnings?: {
    basic: number;
    hra: number;
    conveyance: number;
    childrenEducation: number;
    otherAllowance: number;
    grossEarnings: number;
  };
  ytdDeductions?: {
    epf: number;
    incomeTax: number;
    totalDeductions: number;
  };
  ytdReimbursements?: {
    telephone: number;
    fuel: number;
    totalReimbursement: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SalarySlipService {

  constructor() {}

  generateSalarySlipPDF(data: SalarySlipData): void {
    const html = this.generateSalarySlipHTML(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  downloadSalarySlipPDF(data: SalarySlipData): void {
    const html = this.generateSalarySlipHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Salary_Slip_${data.employee.employeeCode}_${data.payMonth}_${data.payYear}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateSalarySlipHTML(data: SalarySlipData): string {
    const record = data.payrollRecord;
    const emp = data.employee;
    
    const basicPay = record.basePay || 0;
    const hra = (basicPay * 0.4) || 0;
    const conveyance = 1600;
    const childrenEducation = 200;
    const otherAllowance = (record.grossPay || 0) - basicPay - hra - conveyance - childrenEducation;
    const grossEarnings = record.grossPay || 0;
    
    const epf = record.retirement401k || (basicPay * 0.12);
    const incomeTax = (record.federalTax || 0) + (record.stateTax || 0);
    const totalDeductions = record.totalDeductions || 0;
    
    const telephoneReimb = 500;
    const fuelReimb = 1000;
    const totalReimbursement = telephoneReimb + fuelReimb;
    
    const ytdMultiplier = this.getMonthNumber(data.payMonth);
    const ytdBasic = basicPay * ytdMultiplier;
    const ytdHra = hra * ytdMultiplier;
    const ytdConveyance = conveyance * ytdMultiplier;
    const ytdChildrenEducation = childrenEducation * ytdMultiplier;
    const ytdOtherAllowance = (otherAllowance > 0 ? otherAllowance : 0) * ytdMultiplier;
    const ytdGrossEarnings = grossEarnings * ytdMultiplier;
    
    const ytdEpf = epf * ytdMultiplier;
    const ytdIncomeTax = incomeTax * ytdMultiplier;
    const ytdTotalDeductions = totalDeductions * ytdMultiplier;
    
    const ytdTelephoneReimb = telephoneReimb * ytdMultiplier;
    const ytdFuelReimb = fuelReimb * ytdMultiplier;
    const ytdTotalReimbursement = totalReimbursement * ytdMultiplier;
    
    const netPayable = (record.netPay || 0) + totalReimbursement;
    const netPayInWords = this.numberToWords(netPayable);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salary Slip - ${emp.name} - ${data.payMonth} ${data.payYear}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .salary-slip {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 2px solid #008080;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #008080 0%, #006666 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .company-address {
      font-size: 11px;
      opacity: 0.9;
    }
    
    .slip-title {
      text-align: center;
      margin-top: 10px;
    }
    
    .slip-title h2 {
      font-size: 16px;
      font-weight: 600;
    }
    
    .net-pay-box {
      background: white;
      color: #008080;
      padding: 15px 20px;
      border-radius: 8px;
      text-align: center;
      min-width: 180px;
    }
    
    .net-pay-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .net-pay-amount {
      font-size: 24px;
      font-weight: bold;
      color: #008080;
    }
    
    .employee-info-section {
      padding: 15px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .employee-info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .info-value {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }
    
    .days-section {
      padding: 10px 20px;
      background: #e8f5e9;
      border-bottom: 1px solid #c8e6c9;
      display: flex;
      gap: 30px;
    }
    
    .days-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .days-label {
      font-size: 11px;
      color: #2e7d32;
    }
    
    .days-value {
      font-weight: bold;
      color: #1b5e20;
    }
    
    .main-content {
      padding: 20px;
    }
    
    .section-table {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .section-header {
      background: #008080;
      color: white;
      padding: 10px 15px;
      font-weight: 600;
      font-size: 13px;
    }
    
    .table-header {
      background: #e0f2f1;
      border-bottom: 2px solid #008080;
    }
    
    .table-header th {
      padding: 8px 15px;
      text-align: left;
      font-weight: 600;
      color: #00695c;
      font-size: 11px;
    }
    
    .table-header th:nth-child(2),
    .table-header th:nth-child(3) {
      text-align: right;
    }
    
    .table-row {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .table-row td {
      padding: 8px 15px;
      font-size: 12px;
    }
    
    .table-row td:nth-child(2),
    .table-row td:nth-child(3) {
      text-align: right;
      font-family: 'Consolas', monospace;
    }
    
    .table-total {
      background: #f5f5f5;
      font-weight: bold;
    }
    
    .table-total td {
      padding: 10px 15px;
      border-top: 2px solid #008080;
    }
    
    .footer-section {
      background: linear-gradient(135deg, #008080 0%, #006666 100%);
      color: white;
      padding: 20px;
    }
    
    .net-payable {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      margin-bottom: 15px;
    }
    
    .net-payable-label {
      font-size: 14px;
    }
    
    .net-payable-amount {
      font-size: 24px;
      font-weight: bold;
    }
    
    .amount-in-words {
      font-size: 11px;
      font-style: italic;
      margin-bottom: 15px;
      opacity: 0.9;
    }
    
    .disclaimer {
      font-size: 10px;
      text-align: center;
      opacity: 0.8;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #008080;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .print-btn:hover {
      background: #006666;
    }
    
    .columns-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    @media print {
      .columns-container {
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    <i class="fas fa-print"></i> Print / Save as PDF
  </button>
  
  <div class="salary-slip">
    <div class="header">
      <div class="company-info">
        <div class="company-name">${data.companyName}</div>
        <div class="company-address">${data.companyAddress}</div>
        <div class="slip-title">
          <h2>Payslip for the month of ${data.payMonth}, ${data.payYear}</h2>
        </div>
      </div>
      <div class="net-pay-box">
        <div class="net-pay-label">Employee Net Pay</div>
        <div class="net-pay-amount">$${this.formatCurrency(record.netPay || 0)}</div>
      </div>
    </div>
    
    <div class="employee-info-section">
      <div class="employee-info-grid">
        <div class="info-item">
          <span class="info-label">Employee Name</span>
          <span class="info-value">${emp.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Employee Code</span>
          <span class="info-value">${emp.employeeCode}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Designation</span>
          <span class="info-value">${emp.designation}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date of Joining</span>
          <span class="info-value">${emp.dateOfJoining}</span>
        </div>
        <div class="info-item">
          <span class="info-label">UAN Number</span>
          <span class="info-value">${emp.uanNumber || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">PF A/C Number</span>
          <span class="info-value">${emp.pfAccountNumber || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bank A/C Number</span>
          <span class="info-value">${emp.bankAccountNumber || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Department</span>
          <span class="info-value">${emp.department || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div class="days-section">
      <div class="days-item">
        <span class="days-label">Paid Days:</span>
        <span class="days-value">${data.paidDays}</span>
      </div>
      <div class="days-item">
        <span class="days-label">LOP Days:</span>
        <span class="days-value">${data.lopDays}</span>
      </div>
    </div>
    
    <div class="main-content">
      <div class="columns-container">
        <div class="earnings-column">
          <table class="section-table">
            <thead>
              <tr class="section-header">
                <th colspan="3">Earnings</th>
              </tr>
              <tr class="table-header">
                <th>Particulars</th>
                <th>Amount ($)</th>
                <th>YTD ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td>Basic</td>
                <td>${this.formatCurrency(basicPay)}</td>
                <td>${this.formatCurrency(ytdBasic)}</td>
              </tr>
              <tr class="table-row">
                <td>House Rent Allowance</td>
                <td>${this.formatCurrency(hra)}</td>
                <td>${this.formatCurrency(ytdHra)}</td>
              </tr>
              <tr class="table-row">
                <td>Conveyance Allowance</td>
                <td>${this.formatCurrency(conveyance)}</td>
                <td>${this.formatCurrency(ytdConveyance)}</td>
              </tr>
              <tr class="table-row">
                <td>Children Education Allowance</td>
                <td>${this.formatCurrency(childrenEducation)}</td>
                <td>${this.formatCurrency(ytdChildrenEducation)}</td>
              </tr>
              <tr class="table-row">
                <td>Other Allowance</td>
                <td>${this.formatCurrency(Math.max(0, otherAllowance))}</td>
                <td>${this.formatCurrency(Math.max(0, ytdOtherAllowance))}</td>
              </tr>
              <tr class="table-row table-total">
                <td><strong>Gross Earnings</strong></td>
                <td><strong>${this.formatCurrency(grossEarnings)}</strong></td>
                <td><strong>${this.formatCurrency(ytdGrossEarnings)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <table class="section-table">
            <thead>
              <tr class="section-header">
                <th colspan="3">Reimbursements</th>
              </tr>
              <tr class="table-header">
                <th>Particulars</th>
                <th>Amount ($)</th>
                <th>YTD ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td>Telephone Reimbursement</td>
                <td>${this.formatCurrency(telephoneReimb)}</td>
                <td>${this.formatCurrency(ytdTelephoneReimb)}</td>
              </tr>
              <tr class="table-row">
                <td>Fuel Reimbursement</td>
                <td>${this.formatCurrency(fuelReimb)}</td>
                <td>${this.formatCurrency(ytdFuelReimb)}</td>
              </tr>
              <tr class="table-row table-total">
                <td><strong>Total Reimbursement</strong></td>
                <td><strong>${this.formatCurrency(totalReimbursement)}</strong></td>
                <td><strong>${this.formatCurrency(ytdTotalReimbursement)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="deductions-column">
          <table class="section-table">
            <thead>
              <tr class="section-header">
                <th colspan="3">Deductions</th>
              </tr>
              <tr class="table-header">
                <th>Particulars</th>
                <th>Amount ($)</th>
                <th>YTD ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td>EPF Contribution</td>
                <td>${this.formatCurrency(epf)}</td>
                <td>${this.formatCurrency(ytdEpf)}</td>
              </tr>
              <tr class="table-row">
                <td>Income Tax</td>
                <td>${this.formatCurrency(incomeTax)}</td>
                <td>${this.formatCurrency(ytdIncomeTax)}</td>
              </tr>
              ${record.healthInsurance ? `
              <tr class="table-row">
                <td>Health Insurance</td>
                <td>${this.formatCurrency(record.healthInsurance)}</td>
                <td>${this.formatCurrency(record.healthInsurance * ytdMultiplier)}</td>
              </tr>
              ` : ''}
              ${record.socialSecurityTax ? `
              <tr class="table-row">
                <td>Social Security</td>
                <td>${this.formatCurrency(record.socialSecurityTax)}</td>
                <td>${this.formatCurrency(record.socialSecurityTax * ytdMultiplier)}</td>
              </tr>
              ` : ''}
              ${record.medicareTax ? `
              <tr class="table-row">
                <td>Medicare</td>
                <td>${this.formatCurrency(record.medicareTax)}</td>
                <td>${this.formatCurrency(record.medicareTax * ytdMultiplier)}</td>
              </tr>
              ` : ''}
              <tr class="table-row table-total">
                <td><strong>Total Deductions</strong></td>
                <td><strong>${this.formatCurrency(totalDeductions)}</strong></td>
                <td><strong>${this.formatCurrency(ytdTotalDeductions)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="footer-section">
      <div class="net-payable">
        <span class="net-payable-label">Total Net Payable</span>
        <span class="net-payable-amount">$${this.formatCurrency(netPayable)}</span>
      </div>
      <div class="amount-in-words">
        <strong>Amount in Words:</strong> ${netPayInWords} Only
      </div>
      <div class="disclaimer">
        This is a system generated payslip and does not require a signature.
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4,
      'May': 5, 'June': 6, 'July': 7, 'August': 8,
      'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    return months[monthName] || 1;
  }

  private numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                  'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero Dollars';

    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    let result = '';
    
    if (dollars >= 1000000) {
      result += convertLessThanThousand(Math.floor(dollars / 1000000)) + ' Million ';
      num = dollars % 1000000;
    } else {
      num = dollars;
    }
    
    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
      num = num % 1000;
    }
    
    if (num > 0) {
      result += convertLessThanThousand(num);
    }

    result = result.trim() + ' Dollars';
    
    if (cents > 0) {
      result += ' and ' + convertLessThanThousand(cents) + ' Cents';
    }

    return result;
  }
}
