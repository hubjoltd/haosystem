import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface AlertOptions {
  playSound?: boolean;
  showBrowserNotification?: boolean;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private idCounter = 0;
  private audioContext: AudioContext | null = null;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.initBrowserNotifications();
  }

  private initBrowserNotifications(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      if (this.notificationPermission === 'default') {
        Notification.requestPermission().then(permission => {
          this.notificationPermission = permission;
        });
      }
    }
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000): void {
    const notification: Notification = {
      id: ++this.idCounter,
      message,
      type,
      duration
    };
    
    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  alert(message: string, options: AlertOptions = {}): void {
    const { playSound = true, showBrowserNotification = true, title = 'Notification' } = options;
    
    this.show(message, 'info', 5000);
    
    if (playSound) {
      this.playNotificationSound();
    }
    
    if (showBrowserNotification) {
      this.showBrowserNotification(title, message);
    }
  }

  alertSuccess(message: string, options: AlertOptions = {}): void {
    const { playSound = true, showBrowserNotification = true, title = 'Success' } = options;
    
    this.show(message, 'success', 5000);
    
    if (playSound) {
      this.playSuccessSound();
    }
    
    if (showBrowserNotification) {
      this.showBrowserNotification(title, message);
    }
  }

  alertWarning(message: string, options: AlertOptions = {}): void {
    const { playSound = true, showBrowserNotification = true, title = 'Warning' } = options;
    
    this.show(message, 'warning', 6000);
    
    if (playSound) {
      this.playWarningSound();
    }
    
    if (showBrowserNotification) {
      this.showBrowserNotification(title, message);
    }
  }

  playNotificationSound(): void {
    this.playBeep(880, 660, 0.3);
  }

  playSuccessSound(): void {
    this.playBeep(523, 784, 0.25);
  }

  playWarningSound(): void {
    this.playBeep(440, 330, 0.4);
  }

  private playBeep(freq1: number, freq2: number, duration: number): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(freq2, this.audioContext.currentTime + duration / 2);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  showBrowserNotification(title: string, body: string): void {
    if (this.notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'system-notification-' + Date.now(),
          requireInteraction: false
        });
        setTimeout(() => notification.close(), 6000);
      } catch (e) {
        console.log('Browser notification failed:', e);
      }
    }
  }

  requestPermission(): void {
    if ('Notification' in window && this.notificationPermission === 'default') {
      Notification.requestPermission().then(permission => {
        this.notificationPermission = permission;
      });
    }
  }

  remove(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }

  clear(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
  }
}
