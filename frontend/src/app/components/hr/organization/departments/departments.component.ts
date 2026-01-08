import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { OrganizationService, Department, CostCenter, Location } from '../../../../services/organization.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Component({
  selector: 'app-departments',
  standalone: false,
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  costCenters: CostCenter[] = [];
  locations: Location[] = [];
  
  loading = false;
  dataReady = false;
  saving = false;
  showExportMenu = false;
  
  showModal = false;
  isEditMode = false;
  editing: Department = this.getEmptyDepartment();

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-dropdown')) {
      this.showExportMenu = false;
    }
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    let count = 0;
    const total = 3;
    const check = () => { 
      count++; 
      if (count >= total) {
        this.loading = false;
        this.dataReady = true;
        this.cdr.detectChanges();
      }
    };
    
    this.orgService.getDepartments().subscribe({
      next: (data) => { this.departments = data; check(); },
      error: (err) => { console.error('Error loading departments:', err); check(); }
    });
    this.orgService.getCostCenters().subscribe({
      next: (data) => { this.costCenters = data; check(); },
      error: (err) => { console.error('Error loading cost centers:', err); check(); }
    });
    this.orgService.getLocations().subscribe({
      next: (data) => { this.locations = data; check(); },
      error: (err) => { console.error('Error loading locations:', err); check(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmptyDepartment(): Department {
    return { code: '', name: '', description: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmptyDepartment();
    this.showModal = true;
  }

  openEditModal(item: Department) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateDepartment(this.editing.id, this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error updating:', err); }
      });
    } else {
      this.orgService.createDepartment(this.editing).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Error creating:', err); }
      });
    }
  }

  delete(item: Department) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteDepartment(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  toggleExportMenu() {
    this.showExportMenu = !this.showExportMenu;
  }

  exportToExcel() {
    const data = this.departments.map(d => ({
      'Code': d.code,
      'Name': d.name,
      'Description': d.description || '',
      'Location': d.location?.name || '',
      'Cost Center': d.costCenter?.name || '',
      'Status': d.active ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Departments');
    XLSX.writeFile(wb, 'departments.xlsx');
    this.showExportMenu = false;
  }

  exportToCSV() {
    const data = this.departments.map(d => ({
      'Code': d.code,
      'Name': d.name,
      'Description': d.description || '',
      'Location': d.location?.name || '',
      'Cost Center': d.costCenter?.name || '',
      'Status': d.active ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'departments.csv';
    link.click();
    this.showExportMenu = false;
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Departments', 14, 20);
    doc.autoTable({
      startY: 30,
      head: [['Code', 'Name', 'Description', 'Location', 'Cost Center', 'Status']],
      body: this.departments.map(d => [
        d.code,
        d.name,
        d.description || '',
        d.location?.name || '',
        d.costCenter?.name || '',
        d.active ? 'Active' : 'Inactive'
      ])
    });
    doc.save('departments.pdf');
    this.showExportMenu = false;
  }

  printDepartments() {
    window.print();
    this.showExportMenu = false;
  }
}
