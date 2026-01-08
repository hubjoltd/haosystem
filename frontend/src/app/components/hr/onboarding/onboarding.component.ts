import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnboardingService } from '../../../services/onboarding.service';
import { EmployeeService } from '../../../services/employee.service';

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
  assets: any[] = [];
  employees: any[] = [];
  newHiresPendingOnboarding: any[] = [];
  dashboard: any = {};
  loading = false;
  selectedPlan: any = null;
  selectedAssetPlan: any = null;
  
  showPlanForm = false;
  showTaskForm = false;
  showAssetModal = false;
  showAssetForm = false;
  saving = false;
  
  editingPlan: any = null;
  planFormData: any = {};
  taskFormData: any = {};
  assetFormData: any = {};

  taskCategories = ['DOCUMENTATION', 'IT_SETUP', 'TRAINING', 'HR_FORMALITIES', 'TEAM_INTRODUCTION', 'OTHER'];
  assetTypes = ['LAPTOP', 'MOBILE', 'ID_CARD', 'ACCESS_CARD', 'KEYS', 'HEADSET', 'MONITOR', 'KEYBOARD', 'MOUSE', 'OTHER'];

  constructor(
    private onboardingService: OnboardingService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPlans();
    this.loadEmployees();
  }

  loadNewHiresPendingOnboarding(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const employeesWithPlans = new Set(this.plans.map(p => p.employee?.id).filter(id => id));
    
    this.newHiresPendingOnboarding = this.employees.filter(emp => {
      if (!emp.joiningDate) return false;
      const joiningDate = new Date(emp.joiningDate);
      const isRecentHire = joiningDate >= thirtyDaysAgo;
      const hasNoPlan = !employeesWithPlans.has(emp.id);
      return isRecentHire && hasNoPlan;
    }).sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
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
      next: (data) => { 
        this.plans = data; 
        this.loading = false; 
        this.loadNewHiresPendingOnboarding();
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadEmployees(): void {
    this.employeeService.getActive().subscribe({
      next: (data) => {
        this.employees = data;
        this.loadNewHiresPendingOnboarding();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  startOnboardingForNewHire(employee: any): void {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    this.planFormData = {
      employeeId: employee.id,
      startDate: today,
      expectedEndDate: endDate,
      notes: `Onboarding plan for ${employee.firstName} ${employee.lastName}`
    };
    this.showPlanForm = true;
  }

  getDaysSinceJoining(joiningDate: string): number {
    const joining = new Date(joiningDate);
    const today = new Date();
    return Math.floor((today.getTime() - joining.getTime()) / (1000 * 60 * 60 * 24));
  }

  openPlanForm(plan?: any): void {
    this.editingPlan = plan || null;
    this.planFormData = plan ? { 
      ...plan,
      employeeId: plan.employee?.id,
      buddyId: plan.buddy?.id,
      managerId: plan.manager?.id
    } : {
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    this.showPlanForm = true;
  }

  closePlanForm(): void {
    this.showPlanForm = false;
    this.editingPlan = null;
    this.planFormData = {};
  }

  savePlan(): void {
    if (this.saving) return;
    this.saving = true;

    const payload = {
      ...this.planFormData,
      employee: this.planFormData.employeeId ? { id: this.planFormData.employeeId } : null,
      buddy: this.planFormData.buddyId ? { id: this.planFormData.buddyId } : null,
      manager: this.planFormData.managerId ? { id: this.planFormData.managerId } : null
    };

    const obs = this.editingPlan
      ? this.onboardingService.updatePlan(this.editingPlan.id, payload)
      : this.onboardingService.createPlan(payload);

    obs.subscribe({
      next: () => { this.saving = false; this.closePlanForm(); this.loadPlans(); this.loadDashboard(); },
      error: (err) => { this.saving = false; console.error(err); alert('Error saving onboarding plan'); }
    });
  }

  deletePlan(id: number): void {
    if (confirm('Delete this onboarding plan?')) {
      this.onboardingService.deletePlan(id).subscribe({
        next: () => { this.loadPlans(); this.loadDashboard(); },
        error: (err) => console.error(err)
      });
    }
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

  openTaskForm(): void {
    this.taskFormData = {
      onboardingPlan: { id: this.selectedPlan.id },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'HR_FORMALITIES'
    };
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.taskFormData = {};
  }

  saveTask(): void {
    if (this.saving) return;
    this.saving = true;

    const payload = {
      ...this.taskFormData,
      assignedTo: this.taskFormData.assignedToId ? { id: this.taskFormData.assignedToId } : null
    };

    this.onboardingService.createTask(payload).subscribe({
      next: () => { 
        this.saving = false;
        this.closeTaskForm(); 
        this.viewTasks(this.selectedPlan);
        this.loadDashboard();
      },
      error: (err) => { this.saving = false; console.error(err); alert('Error saving task'); }
    });
  }

  completeTask(task: any): void {
    this.onboardingService.completeTask(task.id).subscribe({
      next: () => {
        this.viewTasks(this.selectedPlan);
        this.loadDashboard();
      },
      error: (err) => console.error(err)
    });
  }

  deleteTask(task: any): void {
    if (confirm('Delete this task?')) {
      this.onboardingService.deleteTask(task.id).subscribe({
        next: () => this.viewTasks(this.selectedPlan),
        error: (err) => console.error(err)
      });
    }
  }

  openAssetModal(plan: any): void {
    this.selectedAssetPlan = plan;
    this.loadAssets(plan.employee?.id);
    this.showAssetModal = true;
  }

  closeAssetModal(): void {
    this.showAssetModal = false;
    this.selectedAssetPlan = null;
    this.assets = [];
  }

  loadAssets(employeeId: number): void {
    if (!employeeId) return;
    this.onboardingService.getAssetsByEmployee(employeeId).subscribe({
      next: (data) => this.assets = data,
      error: (err) => console.error(err)
    });
  }

  openAssetForm(): void {
    this.assetFormData = {
      employeeId: this.selectedAssetPlan.employee?.id,
      assetType: 'LAPTOP',
      assignedDate: new Date().toISOString().split('T')[0]
    };
    this.showAssetForm = true;
  }

  closeAssetForm(): void {
    this.showAssetForm = false;
    this.assetFormData = {};
  }

  saveAsset(): void {
    if (this.saving) return;
    this.saving = true;

    const payload = {
      ...this.assetFormData,
      employee: { id: this.assetFormData.employeeId }
    };

    this.onboardingService.assignAsset(payload).subscribe({
      next: () => {
        this.saving = false;
        this.closeAssetForm();
        this.loadAssets(this.selectedAssetPlan.employee?.id);
      },
      error: (err) => { this.saving = false; console.error(err); alert('Error assigning asset'); }
    });
  }

  returnAsset(asset: any): void {
    if (confirm('Mark this asset as returned?')) {
      this.onboardingService.returnAsset(asset.id).subscribe({
        next: () => this.loadAssets(this.selectedAssetPlan.employee?.id),
        error: (err) => console.error(err)
      });
    }
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'NOT_STARTED': 'bg-secondary', 'IN_PROGRESS': 'bg-warning', 'COMPLETED': 'bg-success',
      'PENDING': 'bg-warning', 'OVERDUE': 'bg-danger', 'ASSIGNED': 'bg-primary', 'RETURNED': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getProgress(plan: any): number {
    if (!plan.totalTasks || plan.totalTasks === 0) return 0;
    return Math.round((plan.completedTasks / plan.totalTasks) * 100);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'DOCUMENTATION': 'Documentation',
      'IT_SETUP': 'IT Setup',
      'TRAINING': 'Training',
      'HR_FORMALITIES': 'HR Formalities',
      'TEAM_INTRODUCTION': 'Team Introduction',
      'OTHER': 'Other'
    };
    return labels[category] || category;
  }

  getAssetTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'LAPTOP': 'Laptop', 'MOBILE': 'Mobile Phone', 'ID_CARD': 'ID Card',
      'ACCESS_CARD': 'Access Card', 'KEYS': 'Keys', 'HEADSET': 'Headset',
      'MONITOR': 'Monitor', 'KEYBOARD': 'Keyboard', 'MOUSE': 'Mouse', 'OTHER': 'Other'
    };
    return labels[type] || type;
  }
}
