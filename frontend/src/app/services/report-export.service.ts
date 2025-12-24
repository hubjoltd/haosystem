import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {
  private readonly TEAL = '#008080';

  constructor() {}

  exportToPDF(title: string, headers: string[], data: any[][], filename: string): void {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    doc.setFillColor(0, 128, 128);
    doc.rect(0, 0, pageWidth, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, 16);

    yPos = 35;

    const colCount = headers.length;
    const tableWidth = pageWidth - (margin * 2);
    const colWidth = tableWidth / colCount;

    doc.setFillColor(224, 242, 241);
    doc.rect(margin, yPos, tableWidth, 10, 'F');

    doc.setTextColor(0, 105, 92);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const xPos = margin + (index * colWidth) + 3;
      doc.text(header, xPos, yPos + 7);
    });

    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(8);

    data.forEach((row, rowIndex) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, tableWidth, 8, 'F');
      }

      row.forEach((cell, cellIndex) => {
        const xPos = margin + (cellIndex * colWidth) + 3;
        const cellText = String(cell || '');
        doc.text(cellText.substring(0, 25), xPos, yPos + 5.5);
      });

      yPos += 8;
    });

    doc.save(`${filename}_${this.getDateStamp()}.pdf`);
  }

  exportToExcel(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    let csvContent = headers.join('\t') + '\n';

    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        if (typeof val === 'number') return val;
        return String(val || '').replace(/\t/g, ' ');
      });
      csvContent += values.join('\t') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    this.downloadBlob(blob, `${filename}_${this.getDateStamp()}.xls`);
  }

  exportToCSV(headers: string[], data: any[][], filename: string): void {
    let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';

    data.forEach(row => {
      const values = row.map(cell => {
        if (typeof cell === 'number') return cell;
        return `"${String(cell || '').replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    this.downloadBlob(blob, `${filename}_${this.getDateStamp()}.csv`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private getDateStamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }
}
