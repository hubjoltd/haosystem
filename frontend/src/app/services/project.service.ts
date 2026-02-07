import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Project, ProjectTask, ProjectMilestone, ProjectFile, ProjectNote, ProjectTimeLog, ProjectMember } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();
  private loaded = false;
  private loading = false;

  constructor(private http: HttpClient) {}

  private loadProjects(): void {
    if (this.loading) return;
    this.loading = true;
    this.http.get<Project[]>(this.apiUrl).pipe(
      tap(projects => {
        const mapped = projects.map(p => this.mapProjectFromApi(p));
        this.projectsSubject.next(mapped);
        this.loaded = true;
        this.loading = false;
      }),
      catchError(err => {
        console.error('Error loading projects from API:', err);
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }

  refreshProjects(): void {
    this.loaded = false;
    this.loadProjects();
  }

  private mapProjectFromApi(p: any): Project {
    return {
      ...p,
      customerId: p.customer?.id,
      projectManagerId: p.projectManager?.id,
      tasks: (p.tasks || []).map((t: any) => ({
        ...t,
        assigneeId: t.assignee?.id
      })),
      members: (p.members || []).map((m: any) => ({
        ...m,
        employeeId: m.employee?.id
      }))
    };
  }

  getAll(): Observable<Project[]> {
    if (!this.loaded && !this.loading) {
      this.loadProjects();
    }
    return this.projects$;
  }

  getById(id: number): Observable<Project | undefined> {
    return new Observable(observer => {
      this.http.get<Project>(`${this.apiUrl}/${id}`).subscribe({
        next: p => observer.next(this.mapProjectFromApi(p)),
        error: () => {
          const projects = this.projectsSubject.getValue();
          observer.next(projects.find(p => p.id === id));
        }
      });
    });
  }

  create(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project).pipe(
      tap(newProject => {
        const projects = [...this.projectsSubject.getValue(), this.mapProjectFromApi(newProject)];
        this.projectsSubject.next(projects);
      })
    );
  }

  update(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project).pipe(
      tap(updated => {
        const projects = this.projectsSubject.getValue();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
          projects[index] = { ...projects[index], ...this.mapProjectFromApi(updated) };
          this.projectsSubject.next([...projects]);
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        let projects = this.projectsSubject.getValue();
        projects = projects.filter(p => p.id !== id);
        this.projectsSubject.next(projects);
      })
    );
  }

  private saveToStorage(projects: Project[]): void {
    localStorage.setItem('projects', JSON.stringify(projects));
    this.projectsSubject.next(projects);
  }

  private generateProjectCode(): string {
    const prefix = 'PRJ';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  addMember(projectId: number, member: Partial<ProjectMember>): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(`${this.apiUrl}/${projectId}/members`, member).pipe(
      tap(newMember => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.members) project.members = [];
          project.members.push({ ...newMember, employeeId: (newMember as any).employee?.id || member.employeeId });
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.members) project.members = [];
          const maxId = Math.max(...project.members.map(m => m.id || 0), 0);
          const newMember: ProjectMember = { ...member as ProjectMember, id: maxId + 1, addedAt: new Date().toISOString() };
          project.members.push(newMember);
          this.saveToStorage(projects);
          return of(newMember);
        }
        throw new Error('Project not found');
      })
    );
  }

  removeMember(projectId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/members/${memberId}`).pipe(
      tap(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.members) {
          project.members = project.members.filter(m => m.id !== memberId);
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.members) {
          project.members = project.members.filter(m => m.id !== memberId);
          this.saveToStorage(projects);
        }
        return of(void 0);
      })
    );
  }

  addTask(projectId: number, task: Partial<ProjectTask>): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(`${this.apiUrl}/${projectId}/tasks`, task).pipe(
      tap(newTask => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.tasks) project.tasks = [];
          project.tasks.push({ ...newTask, assigneeId: (newTask as any).assignee?.id || task.assigneeId });
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.tasks) project.tasks = [];
          const maxId = Math.max(...project.tasks.map(t => t.id || 0), 0);
          const newTask: ProjectTask = { ...task as ProjectTask, id: maxId + 1, createdAt: new Date().toISOString() };
          project.tasks.push(newTask);
          this.saveToStorage(projects);
          return of(newTask);
        }
        throw new Error('Project not found');
      })
    );
  }

  updateTask(projectId: number, taskId: number, task: Partial<ProjectTask>): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, task).pipe(
      tap(updated => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.tasks) {
          const index = project.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            project.tasks[index] = { ...project.tasks[index], ...updated, assigneeId: (updated as any).assignee?.id || task.assigneeId };
            this.projectsSubject.next([...projects]);
          }
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.tasks) {
          const index = project.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            project.tasks[index] = { ...project.tasks[index], ...task, updatedAt: new Date().toISOString() };
            this.saveToStorage(projects);
            return of(project.tasks[index]);
          }
        }
        throw new Error('Task not found');
      })
    );
  }

  deleteTask(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/tasks/${taskId}`).pipe(
      tap(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.tasks) {
          project.tasks = project.tasks.filter(t => t.id !== taskId);
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.tasks) {
          project.tasks = project.tasks.filter(t => t.id !== taskId);
          this.saveToStorage(projects);
        }
        return of(void 0);
      })
    );
  }

  addMilestone(projectId: number, milestone: Partial<ProjectMilestone>): Observable<ProjectMilestone> {
    return this.http.post<ProjectMilestone>(`${this.apiUrl}/${projectId}/milestones`, milestone).pipe(
      tap(newMilestone => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.milestones) project.milestones = [];
          project.milestones.push(newMilestone);
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          if (!project.milestones) project.milestones = [];
          const maxId = Math.max(...project.milestones.map(m => m.id || 0), 0);
          const newMilestone: ProjectMilestone = { ...milestone as ProjectMilestone, id: maxId + 1, createdAt: new Date().toISOString() };
          project.milestones.push(newMilestone);
          this.saveToStorage(projects);
          return of(newMilestone);
        }
        throw new Error('Project not found');
      })
    );
  }

  deleteMilestone(projectId: number, milestoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}`).pipe(
      tap(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.milestones) {
          project.milestones = project.milestones.filter(m => m.id !== milestoneId);
          this.projectsSubject.next([...projects]);
        }
      }),
      catchError(() => {
        const projects = this.projectsSubject.getValue();
        const project = projects.find(p => p.id === projectId);
        if (project && project.milestones) {
          project.milestones = project.milestones.filter(m => m.id !== milestoneId);
          this.saveToStorage(projects);
        }
        return of(void 0);
      })
    );
  }

  addFile(projectId: number, file: Partial<ProjectFile>): Observable<ProjectFile> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      if (!project.files) project.files = [];
      const maxId = Math.max(...project.files.map(f => f.id || 0), 0);
      const newFile: ProjectFile = { ...file as ProjectFile, id: maxId + 1, uploadDate: new Date().toISOString() };
      project.files.push(newFile);
      this.saveToStorage(projects);
      return of(newFile);
    }
    throw new Error('Project not found');
  }

  deleteFile(projectId: number, fileId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.files) {
      project.files = project.files.filter(f => f.id !== fileId);
      this.saveToStorage(projects);
    }
    return of(void 0);
  }

  addNote(projectId: number, note: Partial<ProjectNote>): Observable<ProjectNote> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      if (!project.notes) project.notes = [];
      const maxId = Math.max(...project.notes.map(n => n.id || 0), 0);
      const newNote: ProjectNote = { ...note as ProjectNote, id: maxId + 1, createdAt: new Date().toISOString() };
      project.notes.push(newNote);
      this.saveToStorage(projects);
      return of(newNote);
    }
    throw new Error('Project not found');
  }

  deleteNote(projectId: number, noteId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.notes) {
      project.notes = project.notes.filter(n => n.id !== noteId);
      this.saveToStorage(projects);
    }
    return of(void 0);
  }

  addTimeLog(projectId: number, timeLog: Partial<ProjectTimeLog>): Observable<ProjectTimeLog> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      if (!project.timeLogs) project.timeLogs = [];
      const maxId = Math.max(...project.timeLogs.map(t => t.id || 0), 0);
      const newTimeLog: ProjectTimeLog = { ...timeLog as ProjectTimeLog, id: maxId + 1, createdAt: new Date().toISOString() };
      project.timeLogs.push(newTimeLog);
      project.totalLoggedTime = (project.totalLoggedTime || 0) + newTimeLog.hours;
      if (newTimeLog.billable) {
        project.totalBillableTime = (project.totalBillableTime || 0) + newTimeLog.hours;
      }
      this.saveToStorage(projects);
      return of(newTimeLog);
    }
    throw new Error('Project not found');
  }

  deleteTimeLog(projectId: number, timeLogId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.timeLogs) {
      const timeLog = project.timeLogs.find(t => t.id === timeLogId);
      if (timeLog) {
        project.totalLoggedTime = (project.totalLoggedTime || 0) - timeLog.hours;
        if (timeLog.billable) {
          project.totalBillableTime = (project.totalBillableTime || 0) - timeLog.hours;
        }
      }
      project.timeLogs = project.timeLogs.filter(t => t.id !== timeLogId);
      this.saveToStorage(projects);
    }
    return of(void 0);
  }
}
