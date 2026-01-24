import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
  branchId?: number;
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
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string;
  branchId?: number;
  branchName?: string;
  branchCode?: string;
  isSuperAdmin?: boolean;
}

export interface CurrentUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: { [key: string]: string[] };
  branchId?: number;
  branchName?: string;
  branchCode?: string;
  isSuperAdmin: boolean;
}

export interface Branch {
  id: number;
  code: string;
  slug?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoPath?: string;
  currency?: string;
  dateFormat?: string;
  timezone?: string;
  primaryColor?: string;
  secondaryColor?: string;
  active: boolean;
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

  private normalizeToken(token: string): string {
    if (token && token.startsWith('Bearer ')) {
      return token.substring(7);
    }
    return token;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('token', this.normalizeToken(response.token));
        const user: CurrentUser = {
          userId: response.userId,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          permissions: this.parsePermissions(response.permissions),
          branchId: response.branchId,
          branchName: response.branchName,
          branchCode: response.branchCode,
          isSuperAdmin: response.isSuperAdmin || false
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => {
        localStorage.setItem('token', this.normalizeToken(response.token));
        const user: CurrentUser = {
          userId: response.userId,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          permissions: this.parsePermissions(response.permissions),
          branchId: response.branchId,
          branchName: response.branchName,
          branchCode: response.branchCode,
          isSuperAdmin: response.isSuperAdmin || false
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

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.userId || null;
  }

  getCurrentBranchId(): number | null {
    const user = this.getCurrentUser();
    return user?.branchId || null;
  }

  getCurrentBranchName(): string | null {
    const user = this.getCurrentUser();
    return user?.branchName || null;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isSuperAdmin || false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.isSuperAdmin || (user.permissions?.['all']?.includes('all') ?? false);
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
