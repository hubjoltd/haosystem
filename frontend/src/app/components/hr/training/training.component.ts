import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../../../services/training.service';
import { EmployeeService } from '../../../services/employee.service';

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
  employees: any[] = [];
  enrollments: any[] = [];
  dashboard: any = {};
  loading = false;
  saving = false;
  
  showForm = false;
  showSessionForm = false;
  showEnrollmentModal = false;
  showFeedbackModal = false;
  
  editingItem: any = null;
  editingSession: any = null;
  selectedSession: any = null;
  selectedEnrollment: any = null;
  
  formData: any = {};
  sessionFormData: any = {};
  enrollmentData: any = {};
  feedbackData: any = { rating: 5, comments: '' };
  
  calendarDays: any[] = [];
  currentMonth = new Date();

  constructor(
    private trainingService: TrainingService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPrograms();
    this.loadEmployees();
  }

  loadDashboard(): void {
    this.trainingService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  loadEmployees(): void {
    this.employeeService.getActive().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showForm = false;
    this.showSessionForm = false;
    if (tab === 'programs') this.loadPrograms();
    else if (tab === 'sessions') this.loadSessions();
    else if (tab === 'calendar') {
      this.loadSessions();
      this.generateCalendar();
    }
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
      next: (data) => { this.sessions = data; this.loading = false; this.generateCalendar(); },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  openForm(item?: any): void {
    this.editingItem = item || null;
    this.formData = item ? { ...item } : { isActive: true };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingItem = null;
    this.formData = {};
  }

  saveProgram(): void {
    if (this.saving) return;
    
    if (!this.formData.name) {
      alert('Please enter a program name');
      return;
    }
    
    this.saving = true;
    const obs = this.editingItem
      ? this.trainingService.updateProgram(this.editingItem.id, this.formData)
      : this.trainingService.createProgram(this.formData);
    obs.subscribe({
      next: () => { 
        this.closeForm(); 
        this.loadPrograms(); 
        this.loadDashboard(); 
        this.saving = false;
      },
      error: (err) => { 
        console.error(err); 
        this.saving = false;
        const errorMsg = err.error?.message || err.error?.error || 'Error saving program';
        alert(errorMsg); 
      }
    });
  }

  deleteProgram(id: number): void {
    if (confirm('Delete this program?')) {
      this.trainingService.deleteProgram(id).subscribe({
        next: () => { this.loadPrograms(); this.loadDashboard(); },
        error: (err) => console.error(err)
      });
    }
  }

  openSessionForm(session?: any): void {
    this.editingSession = session || null;
    this.sessionFormData = session ? { 
      ...session,
      programId: session.program?.id 
    } : {
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      maxParticipants: 20
    };
    this.showSessionForm = true;
  }

  closeSessionForm(): void {
    this.showSessionForm = false;
    this.editingSession = null;
    this.sessionFormData = {};
  }

  saveSession(): void {
    if (this.saving) return;
    
    if (!this.sessionFormData.programId || !this.sessionFormData.sessionDate) {
      alert('Please select a program and session date');
      return;
    }
    
    this.saving = true;
    const payload = {
      ...this.sessionFormData,
      program: this.sessionFormData.programId ? { id: this.sessionFormData.programId } : null
    };

    const obs = this.editingSession
      ? this.trainingService.updateSession(this.editingSession.id, payload)
      : this.trainingService.createSession(payload);

    obs.subscribe({
      next: () => { 
        this.closeSessionForm(); 
        this.loadSessions(); 
        this.loadDashboard(); 
        this.saving = false;
      },
      error: (err) => { 
        console.error(err); 
        this.saving = false;
        const errorMsg = err.error?.message || err.error?.error || 'Error saving session';
        alert(errorMsg); 
      }
    });
  }

  deleteSession(id: number): void {
    if (confirm('Delete this session?')) {
      this.trainingService.deleteSession(id).subscribe({
        next: () => { this.loadSessions(); this.loadDashboard(); },
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

  openEnrollmentModal(session: any): void {
    this.selectedSession = session;
    this.enrollmentData = {};
    this.loadEnrollments(session.id);
    this.showEnrollmentModal = true;
  }

  closeEnrollmentModal(): void {
    this.showEnrollmentModal = false;
    this.selectedSession = null;
    this.enrollments = [];
  }

  loadEnrollments(sessionId: number): void {
    this.trainingService.getEnrollmentsBySession(sessionId).subscribe({
      next: (data) => this.enrollments = data,
      error: (err) => console.error(err)
    });
  }

  enrollEmployee(): void {
    if (!this.enrollmentData.employeeId) return;
    
    const payload = {
      sessionId: this.selectedSession.id,
      employeeId: this.enrollmentData.employeeId
    };

    this.trainingService.enrollEmployee(payload).subscribe({
      next: () => { 
        this.loadEnrollments(this.selectedSession.id);
        this.enrollmentData = {};
        this.loadSessions();
      },
      error: (err) => { console.error(err); alert('Error enrolling employee'); }
    });
  }

  markAttendance(enrollment: any, attended: boolean): void {
    this.trainingService.markAttendance(enrollment.id, attended).subscribe({
      next: () => this.loadEnrollments(this.selectedSession.id),
      error: (err) => console.error(err)
    });
  }

  openFeedbackModal(enrollment: any): void {
    this.selectedEnrollment = enrollment;
    this.feedbackData = { rating: 5, comments: '' };
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedEnrollment = null;
  }

  submitFeedback(): void {
    this.trainingService.submitFeedback(this.selectedEnrollment.id, this.feedbackData).subscribe({
      next: () => {
        this.closeFeedbackModal();
        this.loadEnrollments(this.selectedSession.id);
      },
      error: (err) => { console.error(err); alert('Error submitting feedback'); }
    });
  }

  generateCertificate(enrollment: any): void {
    this.trainingService.generateCertificate(enrollment.id).subscribe({
      next: (data) => {
        this.loadEnrollments(this.selectedSession.id);
        alert('Certificate generated successfully!');
      },
      error: (err) => { console.error(err); alert('Error generating certificate'); }
    });
  }

  cancelEnrollment(enrollment: any): void {
    if (confirm('Cancel this enrollment?')) {
      this.trainingService.cancelEnrollment(enrollment.id).subscribe({
        next: () => {
          this.loadEnrollments(this.selectedSession.id);
          this.loadSessions();
        },
        error: (err) => console.error(err)
      });
    }
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    this.calendarDays = [];
    
    for (let i = 0; i < startPadding; i++) {
      this.calendarDays.push({ day: null, sessions: [] });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySessions = this.sessions.filter(s => s.sessionDate === dateStr);
      this.calendarDays.push({ day, date: dateStr, sessions: daySessions });
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getMonthYear(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'bg-success', 'SCHEDULED': 'bg-primary', 'COMPLETED': 'bg-dark',
      'CANCELLED': 'bg-danger', 'IN_PROGRESS': 'bg-warning', 'ENROLLED': 'bg-primary',
      'ATTENDED': 'bg-success', 'ABSENT': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}
