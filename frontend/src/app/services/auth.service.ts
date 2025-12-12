import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleId?: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string;
}

export interface CurrentUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: { [key: string]: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  private parsePermissions(permissionsStr: string): { [key: string]: string[] } {
    if (!permissionsStr) return {};
    if (permissionsStr === 'all') {
      return { all: ['all'] };
    }
    try {
      return JSON.parse(permissionsStr);
    } catch {
      return {};
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const user: CurrentUser = {
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          permissions: this.parsePermissions(response.permissions)
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const user: CurrentUser = {
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          permissions: this.parsePermissions(response.permissions)
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === 'ADMIN' || (user.permissions?.['all']?.includes('all') ?? false);
  }

  hasFeatureAccess(feature: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (this.isAdmin()) return true;
    
    return !!user.permissions[feature] && user.permissions[feature].length > 0;
  }

  hasPermission(feature: string, permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (this.isAdmin()) return true;
    
    return user.permissions[feature]?.includes(permission) || false;
  }
}
