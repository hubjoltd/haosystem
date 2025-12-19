import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  plans: any[] = [];
  tasks: any[] = [];
  dashboard: any = {};
  loading = false;
  selectedPlan: any = null;

  constructor(private onboardingService: OnboardingService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPlans();
  }

  loadDashboard(): void {
    this.onboardingService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  loadPlans(): void {
    this.loading = true;
    this.onboardingService.getPlans().subscribe({
      next: (data) => { this.plans = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  startPlan(id: number): void {
    this.onboardingService.startPlan(id).subscribe({
      next: () => { this.loadPlans(); this.loadDashboard(); },
      error: (err) => console.error(err)
    });
  }

  completePlan(id: number): void {
    if (confirm('Complete this onboarding plan?')) {
      this.onboardingService.completePlan(id).subscribe({
        next: () => { this.loadPlans(); this.loadDashboard(); },
        error: (err) => console.error(err)
      });
    }
  }

  viewTasks(plan: any): void {
    this.selectedPlan = plan;
    this.onboardingService.getTasksByPlan(plan.id).subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error(err)
    });
  }

  closeTasks(): void {
    this.selectedPlan = null;
    this.tasks = [];
  }

  completeTask(task: any): void {
    this.onboardingService.completeTask(task.id).subscribe({
      next: () => this.viewTasks(this.selectedPlan),
      error: (err) => console.error(err)
    });
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'NOT_STARTED': 'bg-secondary', 'IN_PROGRESS': 'bg-warning', 'COMPLETED': 'bg-success',
      'PENDING': 'bg-warning', 'OVERDUE': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getProgress(plan: any): number {
    if (!plan.totalTasks || plan.totalTasks === 0) return 0;
    return Math.round((plan.completedTasks / plan.totalTasks) * 100);
  }
}
