import { Injectable } from '@angular/core';
import { PayrollRecord } from './payroll.service';
import jsPDF from 'jspdf';

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
}

@Injectable({
  providedIn: 'root'
})
export class SalarySlipService {

  private readonly TEAL = '#008080';
  private readonly DARK_TEAL = '#006666';
  private readonly LIGHT_GRAY = '#f8f9fa';

  constructor() {}

  generateSalarySlipPDF(data: SalarySlipData): void {
    const doc = this.createPDF(data);
    const fileName = `Salary_Slip_${data.employee.employeeCode}_${data.payMonth}_${data.payYear}.pdf`;
    doc.save(fileName);
  }

  printSalarySlipPDF(data: SalarySlipData): void {
    const doc = this.createPDF(data);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }

  private createPDF(data: SalarySlipData): jsPDF {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    const record = data.payrollRecord;
    const emp = data.employee;

    const basicPay = record.basePay || 0;
    const hra = basicPay * 0.4;
    const conveyance = 133.33;
    const childrenEducation = 16.67;
    const otherAllowance = Math.max(0, (record.grossPay || 0) - basicPay - hra - conveyance - childrenEducation);
    const grossEarnings = record.grossPay || 0;

    const epf = record.retirement401k || (basicPay * 0.12);
    const incomeTax = (record.federalTax || 0) + (record.stateTax || 0);
    const healthInsurance = record.healthInsurance || 0;
    const socialSecurity = record.socialSecurityTax || 0;
    const medicare = record.medicareTax || 0;
    const totalDeductions = record.totalDeductions || 0;

    const telephoneReimb = 41.67;
    const fuelReimb = 83.33;
    const totalReimbursement = telephoneReimb + fuelReimb;

    const monthNum = this.getMonthNumber(data.payMonth);

    const netPayable = (record.netPay || 0) + totalReimbursement;

    yPos = this.drawHeader(doc, data, netPayable, margin, yPos, contentWidth);
    yPos = this.drawEmployeeInfo(doc, emp, margin, yPos, contentWidth);
    yPos = this.drawDaysInfo(doc, data, margin, yPos, contentWidth);
    
    const colWidth = (contentWidth - 5) / 2;
    const leftX = margin;
    const rightX = margin + colWidth + 5;
    
    const earnings = [
      { label: 'Basic', amount: basicPay },
      { label: 'House Rent Allowance', amount: hra },
      { label: 'Conveyance Allowance', amount: conveyance },
      { label: 'Children Education Allowance', amount: childrenEducation },
      { label: 'Other Allowance', amount: otherAllowance },
    ];
    
    const deductions = [
      { label: 'EPF Contribution', amount: epf },
      { label: 'Income Tax', amount: incomeTax },
    ];
    if (healthInsurance > 0) deductions.push({ label: 'Health Insurance', amount: healthInsurance });
    if (socialSecurity > 0) deductions.push({ label: 'Social Security', amount: socialSecurity });
    if (medicare > 0) deductions.push({ label: 'Medicare', amount: medicare });

    const reimbursements = [
      { label: 'Telephone Reimbursement', amount: telephoneReimb },
      { label: 'Fuel Reimbursement', amount: fuelReimb },
    ];

    const earningsEndY = this.drawTable(doc, 'Earnings', earnings, grossEarnings, leftX, yPos, colWidth, monthNum);
    const deductionsEndY = this.drawTable(doc, 'Deductions', deductions, totalDeductions, rightX, yPos, colWidth, monthNum);
    
    yPos = Math.max(earningsEndY, deductionsEndY) + 5;
    
    yPos = this.drawTable(doc, 'Reimbursements', reimbursements, totalReimbursement, leftX, yPos, colWidth, monthNum);
    
    yPos += 10;
    this.drawFooter(doc, netPayable, margin, yPos, contentWidth);

    return doc;
  }

  private drawHeader(doc: jsPDF, data: SalarySlipData, netPay: number, margin: number, yPos: number, contentWidth: number): number {
    doc.setFillColor(0, 128, 128);
    doc.rect(margin, yPos, contentWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.companyName, margin + 5, yPos + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(data.companyAddress, margin + 5, yPos + 17);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payslip for the month of ${data.payMonth}, ${data.payYear}`, margin + 5, yPos + 28);

    const boxWidth = 50;
    const boxX = margin + contentWidth - boxWidth - 5;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(boxX, yPos + 5, boxWidth, 25, 3, 3, 'F');

    doc.setTextColor(102, 102, 102);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Net Pay', boxX + boxWidth / 2, yPos + 13, { align: 'center' });

    doc.setTextColor(0, 128, 128);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${this.formatCurrency(netPay)}`, boxX + boxWidth / 2, yPos + 24, { align: 'center' });

    return yPos + 40;
  }

  private drawEmployeeInfo(doc: jsPDF, emp: EmployeeSlipInfo, margin: number, yPos: number, contentWidth: number): number {
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, yPos, contentWidth, 28, 'F');

    const colWidth = contentWidth / 4;
    const info = [
      { label: 'Employee Name', value: emp.name },
      { label: 'Employee Code', value: emp.employeeCode },
      { label: 'Designation', value: emp.designation },
      { label: 'Date of Joining', value: emp.dateOfJoining },
      { label: 'UAN Number', value: emp.uanNumber || 'N/A' },
      { label: 'PF A/C Number', value: emp.pfAccountNumber || 'N/A' },
      { label: 'Bank A/C Number', value: emp.bankAccountNumber || 'N/A' },
      { label: 'Department', value: emp.department || 'N/A' },
    ];

    let xPos = margin + 3;
    let rowY = yPos + 7;
    
    info.forEach((item, index) => {
      if (index === 4) {
        xPos = margin + 3;
        rowY = yPos + 19;
      }
      
      doc.setTextColor(102, 102, 102);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label.toUpperCase(), xPos, rowY);

      doc.setTextColor(51, 51, 51);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, xPos, rowY + 5);

      xPos += colWidth;
    });

    return yPos + 32;
  }

  private drawDaysInfo(doc: jsPDF, data: SalarySlipData, margin: number, yPos: number, contentWidth: number): number {
    doc.setFillColor(232, 245, 233);
    doc.rect(margin, yPos, contentWidth, 10, 'F');

    doc.setTextColor(46, 125, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paid Days: `, margin + 5, yPos + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.paidDays}`, margin + 25, yPos + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`LOP Days: `, margin + 45, yPos + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.lopDays}`, margin + 63, yPos + 6.5);

    return yPos + 15;
  }

  private drawTable(doc: jsPDF, title: string, items: { label: string; amount: number }[], total: number, x: number, y: number, width: number, monthNum: number): number {
    doc.setFillColor(0, 128, 128);
    doc.rect(x, y, width, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 3, y + 5.5);

    y += 8;
    doc.setFillColor(224, 242, 241);
    doc.rect(x, y, width, 7, 'F');
    doc.setTextColor(0, 105, 92);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Particulars', x + 3, y + 4.5);
    doc.text('Amount ($)', x + width - 45, y + 4.5);
    doc.text('YTD ($)', x + width - 18, y + 4.5);

    y += 7;

    items.forEach(item => {
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, width, 7, 'F');
      doc.setDrawColor(224, 224, 224);
      doc.line(x, y + 7, x + width, y + 7);

      doc.setTextColor(51, 51, 51);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, x + 3, y + 4.5);
      doc.text(this.formatCurrency(item.amount), x + width - 45, y + 4.5);
      doc.text(this.formatCurrency(item.amount * monthNum), x + width - 18, y + 4.5);
      y += 7;
    });

    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, width, 8, 'F');
    doc.setDrawColor(0, 128, 128);
    doc.line(x, y, x + width, y);

    const totalLabel = title === 'Earnings' ? 'Gross Earnings' : title === 'Deductions' ? 'Total Deductions' : 'Total Reimbursement';
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(totalLabel, x + 3, y + 5.5);
    doc.text(this.formatCurrency(total), x + width - 45, y + 5.5);
    doc.text(this.formatCurrency(total * monthNum), x + width - 18, y + 5.5);

    return y + 8;
  }

  private drawFooter(doc: jsPDF, netPayable: number, margin: number, yPos: number, contentWidth: number): void {
    doc.setFillColor(0, 128, 128);
    doc.rect(margin, yPos, contentWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Net Payable', margin + 5, yPos + 10);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${this.formatCurrency(netPayable)}`, margin + contentWidth - 5, yPos + 10, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Amount in Words: ${this.numberToWords(netPayable)} Only`, margin + 5, yPos + 18);

    doc.setDrawColor(255, 255, 255, 0.3);
    doc.line(margin + 5, yPos + 22, margin + contentWidth - 5, yPos + 22);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const disclaimer = 'This is a system generated payslip and does not require a signature.';
    doc.text(disclaimer, margin + contentWidth / 2, yPos + 27, { align: 'center' });
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
    let remaining = dollars;
    
    if (remaining >= 1000000) {
      result += convertLessThanThousand(Math.floor(remaining / 1000000)) + ' Million ';
      remaining = remaining % 1000000;
    }
    
    if (remaining >= 1000) {
      result += convertLessThanThousand(Math.floor(remaining / 1000)) + ' Thousand ';
      remaining = remaining % 1000;
    }
    
    if (remaining > 0) {
      result += convertLessThanThousand(remaining);
    }

    result = result.trim() + ' Dollars';
    
    if (cents > 0) {
      result += ' and ' + convertLessThanThousand(cents) + ' Cents';
    }

    return result;
  }
}
