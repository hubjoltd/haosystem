import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Project, ProjectTask, ProjectMilestone, ProjectFile, ProjectDiscussion, ProjectNote, ProjectTimeLog, ProjectMember } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('projects');
    if (stored) {
      this.projectsSubject.next(JSON.parse(stored));
    }
  }

  private saveToStorage(projects: Project[]): void {
    localStorage.setItem('projects', JSON.stringify(projects));
    this.projectsSubject.next(projects);
  }

  getAll(): Observable<Project[]> {
    return this.projects$;
  }

  getById(id: number): Observable<Project | undefined> {
    const projects = this.projectsSubject.getValue();
    return of(projects.find(p => p.id === id));
  }

  create(project: Partial<Project>): Observable<Project> {
    const projects = this.projectsSubject.getValue();
    const maxId = Math.max(...projects.map(p => p.id || 0), 0);
    const newProject: Project = {
      ...project as Project,
      id: maxId + 1,
      projectCode: this.generateProjectCode(),
      dateCreated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      progress: project.progress || 0,
      status: project.status || 'NOT_STARTED',
      tasks: [],
      milestones: [],
      files: [],
      discussions: [],
      notes: [],
      timeLogs: [],
      activities: [],
      members: []
    };
    projects.push(newProject);
    this.saveToStorage(projects);
    return of(newProject);
  }

  update(id: number, project: Partial<Project>): Observable<Project> {
    const projects = this.projectsSubject.getValue();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...project, updatedAt: new Date().toISOString() };
      this.saveToStorage(projects);
      return of(projects[index]);
    }
    throw new Error('Project not found');
  }

  delete(id: number): Observable<void> {
    let projects = this.projectsSubject.getValue();
    projects = projects.filter(p => p.id !== id);
    this.saveToStorage(projects);
    return of(void 0);
  }

  private generateProjectCode(): string {
    const prefix = 'PRJ';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  addMember(projectId: number, member: Partial<ProjectMember>): Observable<ProjectMember> {
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
  }

  removeMember(projectId: number, memberId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.members) {
      project.members = project.members.filter(m => m.id !== memberId);
      this.saveToStorage(projects);
    }
    return of(void 0);
  }

  addTask(projectId: number, task: Partial<ProjectTask>): Observable<ProjectTask> {
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
  }

  updateTask(projectId: number, taskId: number, task: Partial<ProjectTask>): Observable<ProjectTask> {
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
  }

  deleteTask(projectId: number, taskId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.tasks) {
      project.tasks = project.tasks.filter(t => t.id !== taskId);
      this.saveToStorage(projects);
    }
    return of(void 0);
  }

  addMilestone(projectId: number, milestone: Partial<ProjectMilestone>): Observable<ProjectMilestone> {
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
  }

  deleteMilestone(projectId: number, milestoneId: number): Observable<void> {
    const projects = this.projectsSubject.getValue();
    const project = projects.find(p => p.id === projectId);
    if (project && project.milestones) {
      project.milestones = project.milestones.filter(m => m.id !== milestoneId);
      this.saveToStorage(projects);
    }
    return of(void 0);
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
