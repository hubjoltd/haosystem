import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService, StatutoryRule } from '../../../services/payroll.service';

@Component({
  selector: 'app-statutory-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statutory-rules.component.html',
  styleUrls: ['./statutory-rules.component.scss']
})
export class StatutoryRulesComponent implements OnInit {
  rules: StatutoryRule[] = [];
  showModal = false;
  isEditing = false;
  currentRule: StatutoryRule = this.getEmptyRule();

  ruleTypes = ['SOCIAL_SECURITY', 'MEDICARE', 'FUTA', 'SUTA', 'WORKERS_COMP', 'DISABILITY'];
  frequencies = ['PER_PAYCHECK', 'ANNUAL'];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.payrollService.getAllStatutoryRules().subscribe({
      next: (data) => this.rules = data,
      error: (err) => console.error('Error loading statutory rules:', err)
    });
  }

  getEmptyRule(): StatutoryRule {
    return {
      code: '',
      name: '',
      description: '',
      ruleType: 'SOCIAL_SECURITY',
      employeeRate: 6.2,
      employerRate: 6.2,
      frequency: 'PER_PAYCHECK',
      applicableYear: new Date().getFullYear(),
      isMandatory: true,
      isActive: true
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentRule = this.getEmptyRule();
    this.showModal = true;
  }

  openEditModal(rule: StatutoryRule): void {
    this.isEditing = true;
    this.currentRule = { ...rule };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveRule(): void {
    if (this.isEditing && this.currentRule.id) {
      this.payrollService.updateStatutoryRule(this.currentRule.id, this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.payrollService.createStatutoryRule(this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  deleteRule(id: number): void {
    if (confirm('Delete this statutory rule?')) {
      this.payrollService.deleteStatutoryRule(id).subscribe({
        next: () => this.loadRules(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
