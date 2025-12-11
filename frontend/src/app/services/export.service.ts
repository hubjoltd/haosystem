import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  exportToCSV(data: any[], filename: string, headers?: string[]): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => {
          const value = row[header];
          const cellValue = value === null || value === undefined ? '' : String(value);
          return cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')
            ? `"${cellValue.replace(/"/g, '""')}"`
            : cellValue;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  exportToExcel(data: any[], filename: string, headers?: string[]): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = headers || Object.keys(data[0]);
    
    let tableHtml = '<table border="1">';
    tableHtml += '<tr>' + csvHeaders.map(h => `<th style="background:#008080;color:white;padding:8px">${this.formatHeader(h)}</th>`).join('') + '</tr>';
    
    data.forEach(row => {
      tableHtml += '<tr>' + csvHeaders.map(header => {
        const value = row[header];
        return `<td style="padding:5px">${value === null || value === undefined ? '' : value}</td>`;
      }).join('') + '</tr>';
    });
    tableHtml += '</table>';

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>${tableHtml}</body></html>
    `;

    this.downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  exportToPDF(data: any[], filename: string, title: string, headers?: string[]): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = headers || Object.keys(data[0]);
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #008080; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #008080; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
          .report-date { text-align: right; color: #666; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="report-date">Generated: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>${csvHeaders.map(h => `<th>${this.formatHeader(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => 
              '<tr>' + csvHeaders.map(header => {
                const value = row[header];
                return `<td>${value === null || value === undefined ? '' : value}</td>`;
              }).join('') + '</tr>'
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  private formatHeader(header: string): string {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
