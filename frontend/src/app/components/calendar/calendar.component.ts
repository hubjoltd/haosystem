import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService, CalendarEvent } from '../../services/calendar.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface TimeSlot {
  hour: number;
  label: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.event-card', [
          style({ opacity: 0, transform: 'translateY(8px)' }),
          stagger('50ms', [
            animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  viewMode: 'month' | 'week' | 'day' = 'week';
  events: CalendarEvent[] = [];
  
  monthDays: DayCell[][] = [];
  weekDays: Date[] = [];
  timeSlots: TimeSlot[] = [];
  
  showEventModal = false;
  showEventDetail = false;
  selectedEvent: CalendarEvent | null = null;
  
  newEvent: any = {
    title: '',
    description: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'MEETING',
    color: '#7C4DFF',
    location: '',
    meetingLink: '',
    allDay: false
  };

  eventTypes = [
    { value: 'MEETING', label: 'Meeting', color: '#7C4DFF', icon: 'fas fa-video' },
    { value: 'PROJECT', label: 'Project', color: '#FF6B6B', icon: 'fas fa-project-diagram' },
    { value: 'EVENT', label: 'Event', color: '#26C6DA', icon: 'fas fa-calendar-star' },
    { value: 'ANNOUNCEMENT', label: 'Announcement', color: '#FFB74D', icon: 'fas fa-bullhorn' },
    { value: 'TRAINING', label: 'Training', color: '#66BB6A', icon: 'fas fa-graduation-cap' },
    { value: 'REVIEW', label: 'Review', color: '#42A5F5', icon: 'fas fa-clipboard-check' }
  ];

  miniCalendarDate = new Date();
  miniCalendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean; hasEvents: boolean }[][] = [];

  upcomingEvents: CalendarEvent[] = [];

  weekDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  editMode = false;
  Math = Math;

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.generateTimeSlots();
    this.updateView();
    this.buildMiniCalendar();
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let h = 7; h <= 20; h++) {
      this.timeSlots.push({
        hour: h,
        label: h <= 12 ? `${h}:00` : `${h - 12}:00`
      });
    }
  }

  updateView() {
    if (this.viewMode === 'month') {
      this.buildMonthView();
    } else if (this.viewMode === 'week') {
      this.buildWeekView();
    }
    this.loadEvents();
  }

  buildMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.monthDays = [];
    let currentWeek: DayCell[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      currentWeek.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: []
      });

      if (currentWeek.length === 7) {
        this.monthDays.push(currentWeek);
        currentWeek = [];
      }
    }
  }

  buildWeekView() {
    const start = new Date(this.currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      this.weekDays.push(d);
    }
  }

  buildMiniCalendar() {
    const year = this.miniCalendarDate.getFullYear();
    const month = this.miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

    this.miniCalendarDays = [];
    let week: any[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      week.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        hasEvents: this.events.some(e => e.eventDate === this.formatDateStr(date))
      });
      if (week.length === 7) {
        this.miniCalendarDays.push(week);
        week = [];
      }
    }
  }

  loadEvents() {
    const range = this.getDateRange();
    this.calendarService.getEvents(range.start, range.end).subscribe({
      next: (events) => {
        this.events = events;
        this.distributeEvents();
        this.buildMiniCalendar();
        this.loadUpcomingEvents();
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  getDateRange(): { start: string; end: string } {
    if (this.viewMode === 'month') {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const start = new Date(year, month, 1);
      start.setDate(start.getDate() - 7);
      const end = new Date(year, month + 1, 7);
      return { start: this.formatDateStr(start), end: this.formatDateStr(end) };
    } else if (this.viewMode === 'week') {
      const start = new Date(this.weekDays[0]);
      const end = new Date(this.weekDays[6]);
      return { start: this.formatDateStr(start), end: this.formatDateStr(end) };
    } else {
      return { start: this.formatDateStr(this.currentDate), end: this.formatDateStr(this.currentDate) };
    }
  }

  distributeEvents() {
    if (this.viewMode === 'month') {
      for (const week of this.monthDays) {
        for (const day of week) {
          day.events = this.events.filter(e => e.eventDate === this.formatDateStr(day.date));
        }
      }
    }
  }

  loadUpcomingEvents() {
    const today = this.formatDateStr(new Date());
    this.upcomingEvents = this.events
      .filter(e => e.eventDate >= today)
      .sort((a, b) => {
        if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
        return (a.startTime || '').localeCompare(b.startTime || '');
      })
      .slice(0, 5);
  }

  getEventsForDayAndHour(date: Date, hour: number): CalendarEvent[] {
    const dateStr = this.formatDateStr(date);
    return this.events.filter(e => {
      if (e.eventDate !== dateStr) return false;
      if (!e.startTime) return hour === 9;
      const eventHour = parseInt(e.startTime.split(':')[0], 10);
      return eventHour === hour;
    });
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = this.formatDateStr(date);
    return this.events.filter(e => e.eventDate === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }

  getEventTop(event: CalendarEvent): number {
    if (!event.startTime) return 0;
    const parts = event.startTime.split(':');
    const minutes = parseInt(parts[1], 10);
    return (minutes / 60) * 60;
  }

  getEventHeight(event: CalendarEvent): number {
    if (!event.startTime || !event.endTime) return 50;
    const startParts = event.startTime.split(':');
    const endParts = event.endTime.split(':');
    const startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
    return Math.max(((endMinutes - startMinutes) / 60) * 60, 30);
  }

  navigate(direction: number) {
    if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + direction, 1);
    } else if (this.viewMode === 'week') {
      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() + (direction * 7));
      this.currentDate = newDate;
    } else {
      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() + direction);
      this.currentDate = newDate;
    }
    this.updateView();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateView();
  }

  setView(mode: 'month' | 'week' | 'day') {
    this.viewMode = mode;
    this.updateView();
  }

  navigateMiniCalendar(direction: number) {
    this.miniCalendarDate = new Date(
      this.miniCalendarDate.getFullYear(),
      this.miniCalendarDate.getMonth() + direction,
      1
    );
    this.buildMiniCalendar();
  }

  selectMiniCalendarDay(day: any) {
    this.currentDate = new Date(day.date);
    this.updateView();
  }

  openCreateModal(date?: Date, hour?: number) {
    this.editMode = false;
    this.selectedEvent = null;
    const targetDate = date || new Date();
    this.newEvent = {
      title: '',
      description: '',
      eventDate: this.formatDateStr(targetDate),
      startTime: hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '09:00',
      endTime: hour !== undefined ? `${(hour + 1).toString().padStart(2, '0')}:00` : '10:00',
      eventType: 'MEETING',
      color: '#7C4DFF',
      location: '',
      meetingLink: '',
      allDay: false
    };
    this.showEventModal = true;
  }

  openEditModal(event: CalendarEvent) {
    this.editMode = true;
    this.selectedEvent = event;
    this.newEvent = {
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      eventType: event.eventType || 'MEETING',
      color: event.color || '#7C4DFF',
      location: event.location || '',
      meetingLink: event.meetingLink || '',
      allDay: event.allDay || false
    };
    this.showEventDetail = false;
    this.showEventModal = true;
  }

  openEventDetail(event: CalendarEvent, e?: Event) {
    if (e) { e.stopPropagation(); }
    this.selectedEvent = event;
    this.showEventDetail = true;
  }

  closeEventDetail() {
    this.showEventDetail = false;
    this.selectedEvent = null;
  }

  selectEventType(type: any) {
    this.newEvent.eventType = type.value;
    this.newEvent.color = type.color;
  }

  saveEvent() {
    if (!this.newEvent.title || !this.newEvent.eventDate) return;

    if (this.editMode && this.selectedEvent?.id) {
      this.calendarService.updateEvent(this.selectedEvent.id, this.newEvent).subscribe({
        next: () => {
          this.showEventModal = false;
          this.loadEvents();
        },
        error: (err) => console.error('Error updating event:', err)
      });
    } else {
      this.calendarService.createEvent(this.newEvent).subscribe({
        next: () => {
          this.showEventModal = false;
          this.loadEvents();
        },
        error: (err) => console.error('Error creating event:', err)
      });
    }
  }

  deleteEvent() {
    if (this.selectedEvent?.id) {
      this.calendarService.deleteEvent(this.selectedEvent.id).subscribe({
        next: () => {
          this.showEventDetail = false;
          this.selectedEvent = null;
          this.loadEvents();
        },
        error: (err) => console.error('Error deleting event:', err)
      });
    }
  }

  closeModal() {
    this.showEventModal = false;
    this.editMode = false;
  }

  getEventTypeInfo(type: string) {
    return this.eventTypes.find(t => t.value === type) || this.eventTypes[0];
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    const parts = time.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${hour}:${m} ${ampm}`;
  }

  formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  getHeaderTitle(): string {
    if (this.viewMode === 'month') {
      return `${this.monthNames[this.currentDate.getMonth()]}, ${this.currentDate.getFullYear()}`;
    } else if (this.viewMode === 'week') {
      if (this.weekDays.length >= 7) {
        const start = this.weekDays[0];
        const end = this.weekDays[6];
        if (start.getMonth() === end.getMonth()) {
          return `${this.monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        }
        return `${this.monthNames[start.getMonth()]} ${start.getDate()} - ${this.monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
      }
      return '';
    } else {
      return this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentHour(hour: number): boolean {
    return new Date().getHours() === hour;
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 7 || h > 20) return -1;
    return (h - 7) * 60 + m;
  }

  getTimeBreakdown(): { label: string; color: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const e of this.events) {
      const type = e.eventType || 'EVENT';
      counts[type] = (counts[type] || 0) + 1;
    }
    return this.eventTypes
      .filter(t => counts[t.value])
      .map(t => ({ label: t.label, color: t.color, count: counts[t.value] || 0 }));
  }

  onSlotClick(date: Date, hour: number) {
    this.openCreateModal(date, hour);
  }

  onMonthDayClick(day: DayCell) {
    this.currentDate = new Date(day.date);
    this.viewMode = 'day';
    this.updateView();
  }

  trackByEventId(index: number, event: CalendarEvent): number {
    return event.id || index;
  }
}
