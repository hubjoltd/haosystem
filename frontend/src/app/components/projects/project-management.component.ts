import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectTask, ProjectMilestone, ProjectFile, ProjectNote, ProjectTimeLog, ProjectMember, PROJECT_STATUSES, BILLING_TYPES, TASK_STATUSES, TASK_PRIORITIES } from '../../models/project.model';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectManagementComponent implements OnInit {
  projects: Project[] = [];
  clients: any[] = [];
  employees: any[] = [];
  
  showModal = false;
  editMode = false;
  viewMode = false;
  selectedProject: Partial<Project> = this.getEmptyProject();
  
  activeTab = 'overview';
  mainView: 'grid' | 'kanban' | 'list' = 'grid';
  searchQuery = '';
  statusFilter = '';
  clientFilter = '';
  billingFilter = '';
  
  projectStatuses = PROJECT_STATUSES;
  billingTypes = BILLING_TYPES;
  taskStatuses = TASK_STATUSES;
  taskPriorities = TASK_PRIORITIES;
  
  showTaskModal = false;
  editingTask: Partial<ProjectTask> = {};
  taskEditIndex = -1;
  
  showMilestoneModal = false;
  editingMilestone: Partial<ProjectMilestone> = {};
  
  showMemberModal = false;
  editingMember: Partial<ProjectMember> = {};
  
  showFileModal = false;
  editingFile: Partial<ProjectFile> = {};
  
  showNoteModal = false;
  editingNote: Partial<ProjectNote> = {};
  
  showTimeLogModal = false;
  editingTimeLog: Partial<ProjectTimeLog> = {};
  
  tagsInput = '';
  draggedProject: Project | null = null;
  previewProjectCode = '';

  constructor(
    private projectService: ProjectService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    this.loadEmployees();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe(projects => {
      this.projects = projects;
      this.cdr.markForCheck();
    });
  }

  loadClients(): void {
    this.http.get<any[]>('/api/customers').subscribe({
      next: (customers) => {
        this.clients = customers;
        this.cdr.markForCheck();
      },
      error: () => {
        const stored = localStorage.getItem('customers');
        this.clients = stored ? JSON.parse(stored) : [];
        this.cdr.markForCheck();
      }
    });
  }

  loadEmployees(): void {
    this.http.get<any[]>('/api/employees').subscribe({
      next: (employees) => {
        this.employees = employees;
        this.cdr.markForCheck();
      },
      error: () => {
        const stored = localStorage.getItem('employees');
        this.employees = stored ? JSON.parse(stored) : [];
        this.cdr.markForCheck();
      }
    });
  }

  getEmptyProject(): Partial<Project> {
    return {
      name: '',
      billingType: 'FIXED_RATE',
      status: 'NOT_STARTED',
      progress: 0,
      currency: 'USD',
      allowCustomerViewProject: true,
      allowCustomerViewTasks: false,
      allowCustomerCommentTasks: false,
      allowCustomerViewTaskComments: false,
      allowCustomerViewTimesheets: false,
      allowCustomerViewFiles: true,
      allowCustomerUploadFiles: false,
      allowCustomerViewDiscussions: false,
      calculatedProgress: 'AUTO',
      billableTasks: true,
      invoiceProject: false,
      invoiceTasks: false,
      invoiceTimesheets: true,
      tags: [],
      tasks: [],
      milestones: [],
      files: [],
      notes: [],
      timeLogs: [],
      members: []
    };
  }

  get filteredProjects(): Project[] {
    return this.projects.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || p.status === this.statusFilter;
      const matchesClient = !this.clientFilter || p.customerId?.toString() === this.clientFilter;
      const matchesBilling = !this.billingFilter || p.billingType === this.billingFilter;
      return matchesSearch && matchesStatus && matchesClient && matchesBilling && !p.deleted;
    });
  }

  get totalProjects(): number {
    return this.projects.filter(p => !p.deleted).length;
  }

  get activeProjects(): number {
    return this.projects.filter(p => p.status === 'IN_PROGRESS' && !p.deleted).length;
  }

  get completedProjects(): number {
    return this.projects.filter(p => p.status === 'COMPLETED' && !p.deleted).length;
  }

  get onHoldProjects(): number {
    return this.projects.filter(p => p.status === 'ON_HOLD' && !p.deleted).length;
  }

  get overdueProjects(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.projects.filter(p => p.deadline && p.deadline < today && p.status !== 'COMPLETED' && !p.deleted).length;
  }

  get totalBudget(): number {
    return this.projects.filter(p => !p.deleted).reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
  }

  get totalLoggedHours(): number {
    return this.projects.filter(p => !p.deleted).reduce((sum, p) => sum + (p.totalLoggedTime || 0), 0);
  }

  get totalTasks(): number {
    return this.projects.filter(p => !p.deleted).reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  }

  getProjectsByStatus(status: string): Project[] {
    return this.filteredProjects.filter(p => p.status === status);
  }

  onDragStart(event: DragEvent, project: Project): void {
    this.draggedProject = project;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    if (this.draggedProject && this.draggedProject.status !== newStatus) {
      this.projectService.update(this.draggedProject.id!, { status: newStatus }).subscribe(() => {
        if (this.draggedProject) {
          this.draggedProject.status = newStatus;
          this.cdr.markForCheck();
        }
      });
    }
    this.draggedProject = null;
  }

  openModal(project?: Project, view = false): void {
    this.viewMode = view;
    if (project) {
      this.editMode = true;
      this.selectedProject = { ...project };
      this.tagsInput = project.tags?.join(', ') || '';
      this.previewProjectCode = project.projectCode || '';
    } else {
      this.editMode = false;
      this.selectedProject = this.getEmptyProject();
      this.tagsInput = '';
      this.generatePreviewCode();
    }
    this.activeTab = 'overview';
    this.showModal = true;
  }

  generatePreviewCode(): void {
    const count = this.projects.length + 1;
    this.previewProjectCode = `PRJ-${count.toString().padStart(6, '0')}`;
    this.selectedProject.projectCode = this.previewProjectCode;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProject = this.getEmptyProject();
    this.viewMode = false;
  }

  saveProject(): void {
    if (!this.selectedProject.name) return;
    
    this.selectedProject.tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);
    
    if (this.editMode && this.selectedProject.id) {
      this.projectService.update(this.selectedProject.id, this.selectedProject).subscribe(() => {
        this.loadProjects();
        this.closeModal();
        this.cdr.markForCheck();
      });
    } else {
      this.projectService.create(this.selectedProject).subscribe((newProject) => {
        this.loadProjects();
        this.selectedProject = { ...newProject };
        this.editMode = true;
        this.cdr.markForCheck();
      });
    }
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.delete(id).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  duplicateProject(project: Project): void {
    const newProject = { ...project };
    delete newProject.id;
    delete newProject.projectCode;
    newProject.name = project.name + ' (Copy)';
    newProject.status = 'NOT_STARTED';
    newProject.progress = 0;
    this.projectService.create(newProject).subscribe(() => {
      this.loadProjects();
    });
  }

  archiveProject(project: Project): void {
    this.projectService.update(project.id!, { archived: !project.archived }).subscribe(() => {
      project.archived = !project.archived;
      this.cdr.markForCheck();
    });
  }

  getStatusLabel(status: string): string {
    return this.projectStatuses.find(s => s.value === status)?.label || status;
  }

  getStatusColor(status: string): string {
    return this.projectStatuses.find(s => s.value === status)?.color || 'secondary';
  }

  getBillingTypeLabel(type: string): string {
    return this.billingTypes.find(t => t.value === type)?.label || type;
  }

  getClientName(customerId?: number): string {
    if (!customerId) return 'No Client';
    const client = this.clients.find(c => c.id === customerId);
    return client?.name || 'Unknown';
  }

  getEmployeeName(employeeId?: number): string {
    if (!employeeId) return '-';
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '-';
  }

  getEmployeeInitials(employeeId?: number): string {
    if (!employeeId) return '?';
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}` : '?';
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount?: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  getDaysRemaining(deadline?: string): number {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOverdue(project: Project): boolean {
    if (!project.deadline || project.status === 'COMPLETED') return false;
    return new Date(project.deadline) < new Date();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.clientFilter = '';
    this.billingFilter = '';
  }

  openTaskModal(task?: ProjectTask, index = -1): void {
    this.taskEditIndex = index;
    if (task) {
      this.editingTask = { ...task };
    } else {
      this.editingTask = { name: '', status: 'TODO', priority: 'MEDIUM', billable: true, visibleToClient: false };
    }
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = {};
    this.taskEditIndex = -1;
  }

  saveTask(): void {
    if (!this.editingTask.name || !this.selectedProject.id) return;
    
    if (this.taskEditIndex >= 0 && this.selectedProject.tasks) {
      this.projectService.updateTask(this.selectedProject.id, this.selectedProject.tasks[this.taskEditIndex].id!, this.editingTask).subscribe(task => {
        if (this.selectedProject.tasks) {
          this.selectedProject.tasks[this.taskEditIndex] = task;
        }
        this.closeTaskModal();
      });
    } else {
      this.projectService.addTask(this.selectedProject.id, this.editingTask).subscribe(task => {
        if (!this.selectedProject.tasks) this.selectedProject.tasks = [];
        this.selectedProject.tasks.push(task);
        this.closeTaskModal();
      });
    }
  }

  deleteTask(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.tasks) return;
    const task = this.selectedProject.tasks[index];
    if (confirm('Delete this task?')) {
      this.projectService.deleteTask(this.selectedProject.id, task.id!).subscribe(() => {
        this.selectedProject.tasks?.splice(index, 1);
      });
    }
  }

  openMilestoneModal(milestone?: ProjectMilestone): void {
    this.editingMilestone = milestone ? { ...milestone } : { name: '', status: 'PENDING' };
    this.showMilestoneModal = true;
  }

  closeMilestoneModal(): void {
    this.showMilestoneModal = false;
    this.editingMilestone = {};
  }

  saveMilestone(): void {
    if (!this.editingMilestone.name || !this.selectedProject.id) return;
    
    this.projectService.addMilestone(this.selectedProject.id, this.editingMilestone).subscribe(milestone => {
      if (!this.selectedProject.milestones) this.selectedProject.milestones = [];
      this.selectedProject.milestones.push(milestone);
      this.closeMilestoneModal();
    });
  }

  deleteMilestone(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.milestones) return;
    const milestone = this.selectedProject.milestones[index];
    if (confirm('Delete this milestone?')) {
      this.projectService.deleteMilestone(this.selectedProject.id, milestone.id!).subscribe(() => {
        this.selectedProject.milestones?.splice(index, 1);
      });
    }
  }

  openMemberModal(): void {
    this.editingMember = { role: 'Member' };
    this.showMemberModal = true;
  }

  closeMemberModal(): void {
    this.showMemberModal = false;
    this.editingMember = {};
  }

  saveMember(): void {
    if (!this.editingMember.employeeId || !this.selectedProject.id) return;
    
    const emp = this.employees.find(e => e.id === this.editingMember.employeeId);
    this.editingMember.employee = emp;
    
    this.projectService.addMember(this.selectedProject.id, this.editingMember).subscribe(member => {
      if (!this.selectedProject.members) this.selectedProject.members = [];
      this.selectedProject.members.push(member);
      this.closeMemberModal();
    });
  }

  removeMember(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.members) return;
    const member = this.selectedProject.members[index];
    if (confirm('Remove this member?')) {
      this.projectService.removeMember(this.selectedProject.id, member.id!).subscribe(() => {
        this.selectedProject.members?.splice(index, 1);
      });
    }
  }

  openFileModal(): void {
    this.editingFile = { name: '', visibility: 'STAFF' };
    this.showFileModal = true;
  }

  closeFileModal(): void {
    this.showFileModal = false;
    this.editingFile = {};
  }

  saveFile(): void {
    if (!this.editingFile.name || !this.selectedProject.id) return;
    
    this.projectService.addFile(this.selectedProject.id, this.editingFile).subscribe(file => {
      if (!this.selectedProject.files) this.selectedProject.files = [];
      this.selectedProject.files.push(file);
      this.closeFileModal();
    });
  }

  deleteFile(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.files) return;
    const file = this.selectedProject.files[index];
    if (confirm('Delete this file?')) {
      this.projectService.deleteFile(this.selectedProject.id, file.id!).subscribe(() => {
        this.selectedProject.files?.splice(index, 1);
      });
    }
  }

  openNoteModal(): void {
    this.editingNote = { content: '' };
    this.showNoteModal = true;
  }

  closeNoteModal(): void {
    this.showNoteModal = false;
    this.editingNote = {};
  }

  saveNote(): void {
    if (!this.editingNote.content || !this.selectedProject.id) return;
    
    this.projectService.addNote(this.selectedProject.id, this.editingNote).subscribe(note => {
      if (!this.selectedProject.notes) this.selectedProject.notes = [];
      this.selectedProject.notes.push(note);
      this.closeNoteModal();
    });
  }

  deleteNote(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.notes) return;
    const note = this.selectedProject.notes[index];
    if (confirm('Delete this note?')) {
      this.projectService.deleteNote(this.selectedProject.id, note.id!).subscribe(() => {
        this.selectedProject.notes?.splice(index, 1);
      });
    }
  }

  openTimeLogModal(): void {
    this.editingTimeLog = { date: new Date().toISOString().split('T')[0], hours: 0, billable: true };
    this.showTimeLogModal = true;
  }

  closeTimeLogModal(): void {
    this.showTimeLogModal = false;
    this.editingTimeLog = {};
  }

  saveTimeLog(): void {
    if (!this.editingTimeLog.hours || !this.selectedProject.id) return;
    
    this.projectService.addTimeLog(this.selectedProject.id, this.editingTimeLog).subscribe(timeLog => {
      if (!this.selectedProject.timeLogs) this.selectedProject.timeLogs = [];
      this.selectedProject.timeLogs.push(timeLog);
      this.selectedProject.totalLoggedTime = (this.selectedProject.totalLoggedTime || 0) + timeLog.hours;
      if (timeLog.billable) {
        this.selectedProject.totalBillableTime = (this.selectedProject.totalBillableTime || 0) + timeLog.hours;
      }
      this.closeTimeLogModal();
    });
  }

  deleteTimeLog(index: number): void {
    if (!this.selectedProject.id || !this.selectedProject.timeLogs) return;
    const timeLog = this.selectedProject.timeLogs[index];
    if (confirm('Delete this time log?')) {
      this.projectService.deleteTimeLog(this.selectedProject.id, timeLog.id!).subscribe(() => {
        this.selectedProject.totalLoggedTime = (this.selectedProject.totalLoggedTime || 0) - timeLog.hours;
        if (timeLog.billable) {
          this.selectedProject.totalBillableTime = (this.selectedProject.totalBillableTime || 0) - timeLog.hours;
        }
        this.selectedProject.timeLogs?.splice(index, 1);
      });
    }
  }

  getTaskStatusLabel(status: string): string {
    return this.taskStatuses.find(s => s.value === status)?.label || status;
  }

  getTaskPriorityLabel(priority: string): string {
    return this.taskPriorities.find(p => p.value === priority)?.label || priority;
  }

  getTaskPriorityColor(priority: string): string {
    return this.taskPriorities.find(p => p.value === priority)?.color || 'secondary';
  }

  calculateTaskProgress(): number {
    if (!this.selectedProject.tasks || this.selectedProject.tasks.length === 0) return 0;
    const completed = this.selectedProject.tasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / this.selectedProject.tasks.length) * 100);
  }
}
