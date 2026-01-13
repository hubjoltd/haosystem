import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, SalaryHead } from '../../../services/payroll.service';

@Component({
  selector: 'app-salary-heads',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './salary-heads.component.html',
  styleUrls: ['./salary-heads.component.scss']
})
export class SalaryHeadsComponent implements OnInit {
  salaryHeads: SalaryHead[] = [];
  filteredHeads: SalaryHead[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  currentHead: SalaryHead = this.getEmptyHead();

  headTypes = ['EARNING', 'DEDUCTION'];
  categories = ['BASIC', 'ALLOWANCE', 'BONUS', 'REIMBURSEMENT', 'PRE_TAX_DEDUCTION', 'POST_TAX_DEDUCTION', 'TAX', 'STATUTORY'];
  calculationTypes = ['FIXED', 'PERCENTAGE', 'FORMULA'];
  applicableOptions = ['ALL', 'SALARIED', 'HOURLY'];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadSalaryHeads();
  }

  loadSalaryHeads(): void {
    this.payrollService.getAllSalaryHeads().subscribe({
      next: (data) => {
        this.salaryHeads = data;
        this.filterHeads();
      },
      error: (err) => console.error('Error loading salary heads:', err)
    });
  }

  filterHeads(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredHeads = this.salaryHeads.filter(h =>
      h.name.toLowerCase().includes(term) ||
      h.code.toLowerCase().includes(term) ||
      h.headType.toLowerCase().includes(term) ||
      h.category.toLowerCase().includes(term)
    );
  }

  getEmptyHead(): SalaryHead {
    return {
      code: '',
      name: '',
      description: '',
      headType: 'EARNING',
      category: 'BASIC',
      calculationType: 'FIXED',
      defaultValue: 0,
      isTaxable: true,
      isStatutory: false,
      affectsGrossPay: true,
      isActive: true,
      displayOrder: 0,
      applicableTo: 'ALL'
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentHead = this.getEmptyHead();
    this.showModal = true;
  }

  openEditModal(head: SalaryHead): void {
    this.isEditing = true;
    this.currentHead = { ...head };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveHead(): void {
    if (this.isEditing && this.currentHead.id) {
      this.payrollService.updateSalaryHead(this.currentHead.id, this.currentHead).subscribe({
        next: () => {
          this.loadSalaryHeads();
          this.closeModal();
        },
        error: (err) => console.error('Error updating salary head:', err)
      });
    } else {
      this.payrollService.createSalaryHead(this.currentHead).subscribe({
        next: () => {
          this.loadSalaryHeads();
          this.closeModal();
        },
        error: (err) => console.error('Error creating salary head:', err)
      });
    }
  }

  deleteHead(id: number): void {
    if (confirm('Are you sure you want to delete this salary head?')) {
      this.payrollService.deleteSalaryHead(id).subscribe({
        next: () => this.loadSalaryHeads(),
        error: (err) => console.error('Error deleting salary head:', err)
      });
    }
  }

  toggleActive(head: SalaryHead): void {
    const updated = { ...head, isActive: !head.isActive };
    if (head.id) {
      this.payrollService.updateSalaryHead(head.id, updated).subscribe({
        next: () => this.loadSalaryHeads(),
        error: (err) => console.error('Error toggling status:', err)
      });
    }
  }
}
