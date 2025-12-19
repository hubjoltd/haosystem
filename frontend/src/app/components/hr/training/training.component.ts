import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../../../services/training.service';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  activeTab = 'programs';
  programs: any[] = [];
  sessions: any[] = [];
  dashboard: any = {};
  loading = false;
  showForm = false;
  editingItem: any = null;
  formData: any = {};

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPrograms();
  }

  loadDashboard(): void {
    this.trainingService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showForm = false;
    if (tab === 'programs') this.loadPrograms();
    else this.loadSessions();
  }

  loadPrograms(): void {
    this.loading = true;
    this.trainingService.getPrograms().subscribe({
      next: (data) => { this.programs = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.trainingService.getSessions().subscribe({
      next: (data) => { this.sessions = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  openForm(item?: any): void {
    this.editingItem = item || null;
    this.formData = item ? { ...item } : {};
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingItem = null;
    this.formData = {};
  }

  saveProgram(): void {
    const obs = this.editingItem
      ? this.trainingService.updateProgram(this.editingItem.id, this.formData)
      : this.trainingService.createProgram(this.formData);
    obs.subscribe({
      next: () => { this.closeForm(); this.loadPrograms(); },
      error: (err) => { console.error(err); alert('Error saving program'); }
    });
  }

  deleteProgram(id: number): void {
    if (confirm('Delete this program?')) {
      this.trainingService.deleteProgram(id).subscribe({
        next: () => this.loadPrograms(),
        error: (err) => console.error(err)
      });
    }
  }

  startSession(id: number): void {
    this.trainingService.startSession(id).subscribe({
      next: () => this.loadSessions(),
      error: (err) => console.error(err)
    });
  }

  completeSession(id: number): void {
    this.trainingService.completeSession(id).subscribe({
      next: () => this.loadSessions(),
      error: (err) => console.error(err)
    });
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'bg-success', 'SCHEDULED': 'bg-primary', 'COMPLETED': 'bg-dark',
      'CANCELLED': 'bg-danger', 'IN_PROGRESS': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }
}
