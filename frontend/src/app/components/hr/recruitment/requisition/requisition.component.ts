import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { OrganizationService } from '../../../../services/organization.service';
import { SettingsService } from '../../../../services/settings.service';
import { NotificationService } from '../../../../services/notification.service';
import { AuthService } from '../../../../services/auth.service';

export interface ManpowerRequisition {
  id?: number;
  requisitionNumber: string;
  jobTitle: string;
  departmentId?: number;
  department?: any;
  numberOfPositions: number;
  employmentType: string;
  workLocation: string;
  workMode: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  justification: string;
  justificationType: string;
  replacementFor?: string;
  jobDescription?: string;
  requiredSkills?: string;
  minimumExperience?: number;
  educationRequirement?: string;
  expectedJoiningDate?: string;
  priority: string;
  status: string;
  requestedBy?: string;
  requestedById?: number;
  requestedDate?: string;
  currentApprovalLevel?: number;
  approvalHistory?: ApprovalHistory[];
  jobId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalHistory {
  id?: number;
  level: number;
  levelName: string;
  approverId?: number;
  approverName?: string;
  status: string;
  comments?: string;
  actionDate?: string;
}

@Component({
  selector: 'app-recruitment-requisition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requisition.component.html',
  styleUrls: ['./requisition.component.scss']
})
export class RecruitmentRequisitionComponent implements OnInit {
  requisitions: ManpowerRequisition[] = [];
  departments: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditing = false;
  selectedRequisition: ManpowerRequisition = this.getEmptyRequisition();
  
  activeTab = 'all';
  searchTerm = '';
  
  employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern', 'Temporary'];
  workModes = ['Onsite', 'Remote', 'Hybrid'];
  justificationTypes = ['New Position', 'Replacement', 'Expansion', 'Project-Based'];
  priorities = ['Low', 'Medium', 'High', 'Urgent'];
  currencies = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'];
  
  approvalLevels = [
    { level: 1, name: 'Hiring Manager' },
    { level: 2, name: 'Department Head' },
    { level: 3, name: 'HR' },
    { level: 4, name: 'Finance' },
    { level: 5, name: 'Management' }
  ];
  
  showApprovalModal = false;
  approvalAction = '';
  approvalComments = '';
  requisitionToApprove: ManpowerRequisition | null = null;
  
  showViewModal = false;
  viewRequisition: ManpowerRequisition | null = null;
  
  currentUserName = '';
  currentUserId = 0;
  isAdmin = false;
  
  constructor(
    private recruitmentService: RecruitmentService,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadData();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        this.currentUserId = user.userId;
        this.isAdmin = user.role === 'Admin' || user.role === 'HR Manager' || user.role === 'Hiring Manager' || user.role === 'Department Head';
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.recruitmentService.getRequisitions().subscribe({
      next: (data) => {
        this.requisitions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading requisitions:', err);
        this.requisitions = [];
        this.loading = false;
      }
    });

    this.organizationService.getDepartments().subscribe({
      next: (data) => this.departments = data,
      error: () => this.departments = []
    });
  }

  getEmptyRequisition(): ManpowerRequisition {
    const today = new Date().toISOString().split('T')[0];
    return {
      requisitionNumber: '',
      jobTitle: '',
      numberOfPositions: 1,
      employmentType: 'Full-Time',
      workLocation: '',
      workMode: 'Onsite',
      currency: 'USD',
      justification: '',
      justificationType: 'New Position',
      priority: 'Medium',
      status: 'DRAFT',
      requestedDate: today
    };
  }

  getFilteredRequisitions(): ManpowerRequisition[] {
    let filtered = this.requisitions;
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(r => r.status === this.activeTab);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.requisitionNumber?.toLowerCase().includes(term) ||
        r.jobTitle?.toLowerCase().includes(term) ||
        r.department?.name?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  getStatusCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {
      all: this.requisitions.length,
      DRAFT: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      ON_HOLD: 0
    };
    
    this.requisitions.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });
    
    return counts;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedRequisition = this.getEmptyRequisition();
    this.selectedRequisition.requestedBy = this.currentUserName;
    this.selectedRequisition.requestedById = this.currentUserId;
    this.generateRequisitionNumber();
    this.showModal = true;
  }

  generateRequisitionNumber(): void {
    this.settingsService.generatePrefixId('mrf').subscribe({
      next: (number) => {
        this.selectedRequisition.requisitionNumber = number;
      },
      error: () => {
        const date = new Date();
        this.selectedRequisition.requisitionNumber = `MRF-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      }
    });
  }

  openEditModal(req: ManpowerRequisition): void {
    if (req.status !== 'DRAFT') {
      this.notificationService.error('Only draft requisitions can be edited');
      return;
    }
    this.isEditing = true;
    this.selectedRequisition = JSON.parse(JSON.stringify(req));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequisition = this.getEmptyRequisition();
  }

  saveRequisition(asDraft: boolean = true): void {
    if (this.saving) return;
    if (!this.validateForm()) return;
    
    this.saving = true;
    this.selectedRequisition.status = asDraft ? 'DRAFT' : 'PENDING';
    if (!asDraft) {
      this.selectedRequisition.currentApprovalLevel = 1;
    }
    
    const obs = this.isEditing
      ? this.recruitmentService.updateRequisition(this.selectedRequisition.id!, this.selectedRequisition)
      : this.recruitmentService.createRequisition(this.selectedRequisition);
    
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success(
          asDraft 
            ? 'Requisition saved as draft' 
            : 'Requisition submitted for approval'
        );
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving requisition:', err);
        this.notificationService.error('Error saving requisition');
      }
    });
  }

  validateForm(): boolean {
    if (!this.selectedRequisition.jobTitle?.trim()) {
      this.notificationService.error('Job title is required');
      return false;
    }
    if (!this.selectedRequisition.numberOfPositions || this.selectedRequisition.numberOfPositions < 1) {
      this.notificationService.error('Number of positions must be at least 1');
      return false;
    }
    if (!this.selectedRequisition.justification?.trim()) {
      this.notificationService.error('Justification is required');
      return false;
    }
    return true;
  }

  submitForApproval(req: ManpowerRequisition): void {
    if (req.status !== 'DRAFT') return;
    
    if (confirm('Submit this requisition for approval?')) {
      this.recruitmentService.submitRequisition(req.id!).subscribe({
        next: () => {
          this.notificationService.success('Requisition submitted for approval');
          this.loadData();
        },
        error: (err) => {
          console.error('Error submitting requisition:', err);
          this.notificationService.error('Error submitting requisition');
        }
      });
    }
  }

  openApprovalModal(req: ManpowerRequisition, action: string): void {
    this.requisitionToApprove = req;
    this.approvalAction = action;
    this.approvalComments = '';
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.requisitionToApprove = null;
    this.approvalComments = '';
  }

  processApproval(): void {
    if (!this.requisitionToApprove) return;
    
    const action = this.approvalAction === 'approve' ? 'approve' : 'reject';
    const obs = action === 'approve'
      ? this.recruitmentService.approveRequisition(this.requisitionToApprove.id!, this.currentUserId)
      : this.recruitmentService.rejectRequisition(this.requisitionToApprove.id!, this.approvalComments);
    
    obs.subscribe({
      next: () => {
        this.notificationService.success(
          action === 'approve' 
            ? 'Requisition approved successfully' 
            : 'Requisition rejected'
        );
        this.closeApprovalModal();
        this.loadData();
      },
      error: () => {
        this.notificationService.error(`Error ${action}ing requisition`);
      }
    });
  }

  putOnHold(req: ManpowerRequisition): void {
    if (confirm('Put this requisition on hold?')) {
      this.recruitmentService.holdRequisition(req.id!).subscribe({
        next: () => {
          this.notificationService.success('Requisition put on hold');
          this.loadData();
        },
        error: () => {
          this.notificationService.error('Error updating requisition');
        }
      });
    }
  }

  deleteRequisition(req: ManpowerRequisition): void {
    if (req.status !== 'DRAFT') {
      this.notificationService.error('Only draft requisitions can be deleted');
      return;
    }
    
    if (confirm(`Delete requisition ${req.requisitionNumber}?`)) {
      this.recruitmentService.deleteRequisition(req.id!).subscribe({
        next: () => {
          this.notificationService.success('Requisition deleted');
          this.loadData();
        },
        error: (err) => {
          console.error('Error deleting requisition:', err);
          this.notificationService.error('Error deleting requisition');
        }
      });
    }
  }

  viewDetails(req: ManpowerRequisition): void {
    this.viewRequisition = req;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewRequisition = null;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'status-draft',
      'PENDING': 'status-pending',
      'PENDING_APPROVAL': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'ON_HOLD': 'status-hold'
    };
    return classes[status] || 'status-draft';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Urgent': 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
  }

  getCurrentApprovalLevel(req: ManpowerRequisition): string {
    if (req.status === 'APPROVED') return 'Fully Approved';
    if (req.status === 'REJECTED') return 'Rejected';
    if (req.status === 'DRAFT') return 'Not Submitted';
    
    const level = req.currentApprovalLevel || 1;
    const approvalLevel = this.approvalLevels.find(l => l.level === level);
    return approvalLevel ? `Pending: ${approvalLevel.name}` : 'Pending';
  }

  canApprove(req: ManpowerRequisition): boolean {
    return (req.status === 'PENDING' || req.status === 'PENDING_APPROVAL') && this.isAdmin;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number | undefined, currency: string): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
}
