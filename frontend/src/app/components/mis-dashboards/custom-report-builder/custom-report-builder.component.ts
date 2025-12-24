import { Component, OnInit } from '@angular/core';
import { MisDashboardService, ReportField, ReportTemplate } from '../../../services/mis-dashboard.service';

@Component({
  selector: 'app-custom-report-builder',
  standalone: false,
  templateUrl: './custom-report-builder.component.html',
  styleUrls: ['./custom-report-builder.component.scss']
})
export class CustomReportBuilderComponent implements OnInit {
  availableFields: ReportField[] = [];
  selectedFields: ReportField[] = [];
  savedTemplates: ReportTemplate[] = [];
  
  currentTemplate: ReportTemplate = {
    name: '',
    description: '',
    selectedFields: [],
    filters: {},
    sortBy: '',
    sortOrder: 'asc'
  };
  
  loading = false;
  saving = false;
  showTemplateModal = false;
  showPreview = false;
  previewData: any[] = [];
  
  draggedField: ReportField | null = null;
  categories: string[] = [];

  constructor(private dashboardService: MisDashboardService) {}

  ngOnInit(): void {
    this.loadFields();
    this.loadTemplates();
  }

  loadFields(): void {
    this.dashboardService.getReportFields().subscribe({
      next: (fields) => {
        this.availableFields = fields;
        this.categories = [...new Set(fields.map(f => f.category))];
      },
      error: () => {
        this.availableFields = this.getMockFields();
        this.categories = [...new Set(this.availableFields.map(f => f.category))];
      }
    });
  }

  loadTemplates(): void {
    this.dashboardService.getReportTemplates().subscribe({
      next: (templates) => this.savedTemplates = templates,
      error: () => this.savedTemplates = this.getMockTemplates()
    });
  }

  getMockFields(): ReportField[] {
    return [
      { id: 'emp_code', name: 'Employee Code', category: 'Employee', dataType: 'string' },
      { id: 'emp_name', name: 'Employee Name', category: 'Employee', dataType: 'string' },
      { id: 'email', name: 'Email', category: 'Employee', dataType: 'string' },
      { id: 'phone', name: 'Phone', category: 'Employee', dataType: 'string' },
      { id: 'dob', name: 'Date of Birth', category: 'Employee', dataType: 'date' },
      { id: 'gender', name: 'Gender', category: 'Employee', dataType: 'string' },
      { id: 'department', name: 'Department', category: 'Employment', dataType: 'string' },
      { id: 'designation', name: 'Designation', category: 'Employment', dataType: 'string' },
      { id: 'grade', name: 'Grade', category: 'Employment', dataType: 'string' },
      { id: 'location', name: 'Location', category: 'Employment', dataType: 'string' },
      { id: 'doj', name: 'Date of Joining', category: 'Employment', dataType: 'date' },
      { id: 'emp_type', name: 'Employment Type', category: 'Employment', dataType: 'string' },
      { id: 'status', name: 'Status', category: 'Employment', dataType: 'string' },
      { id: 'manager', name: 'Reporting Manager', category: 'Employment', dataType: 'string' },
      { id: 'basic_salary', name: 'Basic Salary', category: 'Salary', dataType: 'number' },
      { id: 'gross_salary', name: 'Gross Salary', category: 'Salary', dataType: 'number' },
      { id: 'net_salary', name: 'Net Salary', category: 'Salary', dataType: 'number' },
      { id: 'ctc', name: 'CTC', category: 'Salary', dataType: 'number' },
      { id: 'hourly_rate', name: 'Hourly Rate', category: 'Salary', dataType: 'number' },
      { id: 'bank_name', name: 'Bank Name', category: 'Bank', dataType: 'string' },
      { id: 'account_no', name: 'Account Number', category: 'Bank', dataType: 'string' },
      { id: 'routing_no', name: 'Routing Number', category: 'Bank', dataType: 'string' },
      { id: 'present_days', name: 'Present Days', category: 'Attendance', dataType: 'number' },
      { id: 'absent_days', name: 'Absent Days', category: 'Attendance', dataType: 'number' },
      { id: 'leave_days', name: 'Leave Days', category: 'Attendance', dataType: 'number' },
      { id: 'overtime_hours', name: 'Overtime Hours', category: 'Attendance', dataType: 'number' },
      { id: 'perf_score', name: 'Performance Score', category: 'Performance', dataType: 'number' },
      { id: 'perf_rating', name: 'Performance Rating', category: 'Performance', dataType: 'string' },
      { id: 'last_appraisal', name: 'Last Appraisal Date', category: 'Performance', dataType: 'date' }
    ];
  }

  getMockTemplates(): ReportTemplate[] {
    return [
      { id: 1, name: 'Employee Directory', description: 'Basic employee contact info', selectedFields: ['emp_code', 'emp_name', 'email', 'phone', 'department'], filters: {}, sortBy: 'emp_name', sortOrder: 'asc', createdAt: '2024-12-01', createdBy: 'Admin' },
      { id: 2, name: 'Salary Report', description: 'Employee salary breakdown', selectedFields: ['emp_code', 'emp_name', 'department', 'basic_salary', 'gross_salary', 'ctc'], filters: {}, sortBy: 'ctc', sortOrder: 'desc', createdAt: '2024-12-05', createdBy: 'Admin' },
      { id: 3, name: 'Attendance Summary', description: 'Monthly attendance overview', selectedFields: ['emp_code', 'emp_name', 'present_days', 'absent_days', 'leave_days', 'overtime_hours'], filters: {}, sortBy: 'emp_name', sortOrder: 'asc', createdAt: '2024-12-10', createdBy: 'Admin' }
    ];
  }

  getFieldsByCategory(category: string): ReportField[] {
    return this.availableFields.filter(f => f.category === category && !this.isFieldSelected(f));
  }

  isFieldSelected(field: ReportField): boolean {
    return this.selectedFields.some(f => f.id === field.id);
  }

  onDragStart(event: DragEvent, field: ReportField): void {
    this.draggedField = field;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field.id);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedField && !this.isFieldSelected(this.draggedField)) {
      this.selectedFields.push(this.draggedField);
    }
    this.draggedField = null;
  }

  addField(field: ReportField): void {
    if (!this.isFieldSelected(field)) {
      this.selectedFields.push(field);
    }
  }

  removeField(field: ReportField): void {
    this.selectedFields = this.selectedFields.filter(f => f.id !== field.id);
  }

  moveFieldUp(index: number): void {
    if (index > 0) {
      [this.selectedFields[index], this.selectedFields[index - 1]] = 
        [this.selectedFields[index - 1], this.selectedFields[index]];
    }
  }

  moveFieldDown(index: number): void {
    if (index < this.selectedFields.length - 1) {
      [this.selectedFields[index], this.selectedFields[index + 1]] = 
        [this.selectedFields[index + 1], this.selectedFields[index]];
    }
  }

  clearSelection(): void {
    this.selectedFields = [];
    this.currentTemplate = {
      name: '',
      description: '',
      selectedFields: [],
      filters: {},
      sortBy: '',
      sortOrder: 'asc'
    };
  }

  loadTemplate(template: ReportTemplate): void {
    this.currentTemplate = { ...template };
    this.selectedFields = this.availableFields.filter(f => template.selectedFields.includes(f.id));
  }

  openSaveModal(): void {
    this.currentTemplate.selectedFields = this.selectedFields.map(f => f.id);
    this.showTemplateModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
  }

  saveTemplate(): void {
    if (!this.currentTemplate.name || this.selectedFields.length === 0) return;
    
    this.saving = true;
    this.currentTemplate.selectedFields = this.selectedFields.map(f => f.id);
    
    this.dashboardService.saveReportTemplate(this.currentTemplate).subscribe({
      next: (saved) => {
        if (!this.currentTemplate.id) {
          this.savedTemplates.push(saved);
        } else {
          const idx = this.savedTemplates.findIndex(t => t.id === saved.id);
          if (idx >= 0) this.savedTemplates[idx] = saved;
        }
        this.saving = false;
        this.showTemplateModal = false;
      },
      error: () => {
        const mockTemplate: ReportTemplate = {
          ...this.currentTemplate,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0],
          createdBy: 'Current User'
        };
        this.savedTemplates.push(mockTemplate);
        this.saving = false;
        this.showTemplateModal = false;
      }
    });
  }

  deleteTemplate(template: ReportTemplate): void {
    if (confirm(`Delete template "${template.name}"?`)) {
      if (template.id) {
        this.dashboardService.deleteReportTemplate(template.id).subscribe({
          next: () => this.savedTemplates = this.savedTemplates.filter(t => t.id !== template.id),
          error: () => this.savedTemplates = this.savedTemplates.filter(t => t.id !== template.id)
        });
      }
    }
  }

  generatePreview(): void {
    if (this.selectedFields.length === 0) return;
    
    this.loading = false;
    this.showPreview = true;
    
    setTimeout(() => {
      this.previewData = this.generateMockPreviewData();
      this.loading = false;
    }, 500);
  }

  generateMockPreviewData(): any[] {
    const data = [];
    const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson'];
    const depts = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    
    for (let i = 0; i < 10; i++) {
      const row: any = {};
      this.selectedFields.forEach(field => {
        switch (field.dataType) {
          case 'string':
            if (field.id.includes('name')) row[field.id] = names[i % 5];
            else if (field.id.includes('department')) row[field.id] = depts[i % 5];
            else if (field.id.includes('email')) row[field.id] = `employee${i + 1}@company.com`;
            else row[field.id] = `Value ${i + 1}`;
            break;
          case 'number':
            if (field.id.includes('salary') || field.id.includes('ctc')) row[field.id] = 50000 + (i * 5000);
            else if (field.id.includes('days')) row[field.id] = 20 + (i % 5);
            else row[field.id] = Math.floor(Math.random() * 100);
            break;
          case 'date':
            row[field.id] = new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString();
            break;
          default:
            row[field.id] = `Data ${i + 1}`;
        }
      });
      data.push(row);
    }
    return data;
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewData = [];
  }

  exportReport(format: string): void {
    if (this.selectedFields.length === 0) {
      alert('Please select at least one field');
      return;
    }
    
    if (format === 'csv') {
      this.exportToCSV();
    } else if (format === 'excel') {
      this.exportToExcel();
    } else if (format === 'pdf') {
      this.exportToPDF();
    }
  }

  private exportToCSV(): void {
    const data = this.previewData.length > 0 ? this.previewData : this.generateMockPreviewData();
    const headers = this.selectedFields.map(f => f.name).join(',');
    const rows = data.map(row => 
      this.selectedFields.map(f => `"${row[f.id] || ''}"` ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    this.downloadFile(csv, 'report.csv', 'text/csv');
  }

  private exportToExcel(): void {
    const data = this.previewData.length > 0 ? this.previewData : this.generateMockPreviewData();
    let html = '<table border="1"><tr>';
    this.selectedFields.forEach(f => html += `<th>${f.name}</th>`);
    html += '</tr>';
    data.forEach(row => {
      html += '<tr>';
      this.selectedFields.forEach(f => html += `<td>${row[f.id] || ''}</td>`);
      html += '</tr>';
    });
    html += '</table>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.xls';
    a.click();
    URL.revokeObjectURL(url);
  }

  private exportToPDF(): void {
    alert('PDF export would be handled by a PDF library like jsPDF. For now, please use CSV or Excel export.');
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  getFieldIcon(category: string): string {
    switch (category) {
      case 'Employee': return 'fa-user';
      case 'Employment': return 'fa-briefcase';
      case 'Salary': return 'fa-dollar-sign';
      case 'Bank': return 'fa-university';
      case 'Attendance': return 'fa-calendar-check';
      case 'Performance': return 'fa-chart-line';
      default: return 'fa-database';
    }
  }
}
