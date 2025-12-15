import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';

export interface UserNotification {
  id: number;
  recipientUsername: string;
  title: string;
  message: string;
  type: string;
  referenceType?: string;
  referenceId?: number;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private baseUrl = '/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(this.baseUrl);
  }

  getUnreadNotifications(): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.baseUrl}/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/count`).pipe(
      tap(result => this.unreadCountSubject.next(result.count))
    );
  }

  markAsRead(id: number): Observable<UserNotification> {
    return this.http.put<UserNotification>(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        if (current > 0) {
          this.unreadCountSubject.next(current - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  startPolling(intervalMs: number = 30000): Observable<{ count: number }> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getUnreadCount())
    );
  }

  refreshCount(): void {
    this.getUnreadCount().subscribe();
  }
}
