import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PayrollService, OvertimeRule } from '../../../services/payroll.service';

@Component({
  selector: 'app-overtime-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './overtime-rules.component.html',
  styleUrls: ['./overtime-rules.component.scss']
})
export class OvertimeRulesComponent implements OnInit {
  rules: OvertimeRule[] = [];
  showModal = false;
  isEditing = false;
  currentRule: OvertimeRule = this.getEmptyRule();

  ruleTypes = ['WEEKDAY_OT', 'WEEKEND_OT', 'HOLIDAY_OT', 'NIGHT_SHIFT'];
  thresholdTypes = ['DAILY', 'WEEKLY'];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.payrollService.getAllOvertimeRules().subscribe({
      next: (data) => this.rules = data,
      error: (err) => console.error('Error loading overtime rules:', err)
    });
  }

  getEmptyRule(): OvertimeRule {
    return {
      code: '',
      name: '',
      description: '',
      ruleType: 'WEEKDAY_OT',
      multiplier: 1.5,
      minHoursThreshold: 8,
      thresholdType: 'DAILY',
      requiresApproval: true,
      isActive: true,
      priority: 1
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentRule = this.getEmptyRule();
    this.showModal = true;
  }

  openEditModal(rule: OvertimeRule): void {
    this.isEditing = true;
    this.currentRule = { ...rule };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveRule(): void {
    if (this.isEditing && this.currentRule.id) {
      this.payrollService.updateOvertimeRule(this.currentRule.id, this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.payrollService.createOvertimeRule(this.currentRule).subscribe({
        next: () => {
          this.loadRules();
          this.closeModal();
        },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  deleteRule(id: number): void {
    if (confirm('Delete this overtime rule?')) {
      this.payrollService.deleteOvertimeRule(id).subscribe({
        next: () => this.loadRules(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
