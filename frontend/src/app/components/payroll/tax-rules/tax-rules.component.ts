import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, TaxRule } from '../../../services/payroll.service';

@Component({
  selector: 'app-tax-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tax-rules.component.html',
  styleUrls: ['./tax-rules.component.scss']
})
export class TaxRulesComponent implements OnInit {
  rules: TaxRule[] = [];
  showModal = false;
  isEditing = false;
  currentRule: TaxRule = this.getEmptyRule();

  taxTypes = ['FEDERAL', 'STATE', 'LOCAL', 'SOCIAL_SECURITY', 'MEDICARE', 'DISABILITY'];
  calculationBasis = ['GROSS', 'TAXABLE_INCOME', 'FIXED'];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.payrollService.getAllTaxRules().subscribe({
      next: (data) => this.rules = data,
      error: (err) => console.error('Error loading tax rules:', err)
    });
  }

  getEmptyRule(): TaxRule {
    return {
      code: '',
      name: '',
      description: '',
      taxType: 'FEDERAL',
      rate: 0,
      calculationBasis: 'TAXABLE_INCOME',
      employeeContribution: true,
      employerContribution: false,
      taxYear: new Date().getFullYear(),
      isActive: true
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentRule = this.getEmptyRule();
    this.showModal = true;
  }

  openEditModal(rule: TaxRule): void {
    this.isEditing = true;
    this.currentRule = { ...rule };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveRule(): void {
    if (this.isEditing && this.currentRule.id) {
      this.payrollService.updateTaxRule(this.currentRule.id, this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.payrollService.createTaxRule(this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  deleteRule(id: number): void {
    if (confirm('Delete this tax rule?')) {
      this.payrollService.deleteTaxRule(id).subscribe({
        next: () => this.loadRules(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'FEDERAL': return 'federal';
      case 'STATE': return 'state';
      case 'LOCAL': return 'local';
      case 'SOCIAL_SECURITY': return 'ss';
      case 'MEDICARE': return 'medicare';
      default: return 'other';
    }
  }
}
