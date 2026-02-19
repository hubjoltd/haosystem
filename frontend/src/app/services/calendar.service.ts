import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  eventType: string;
  color: string;
  location?: string;
  meetingLink?: string;
  allDay?: boolean;
  createdBy?: any;
  branch?: any;
  attendeeIds?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = '/api/calendar';

  constructor(private http: HttpClient) {}

  getEvents(startDate: string, endDate: string, branchId?: number): Observable<CalendarEvent[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events`, { params });
  }

  getEvent(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(event: any): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: any): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }
}
