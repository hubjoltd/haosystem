import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'read' | 'connect' | 'disconnect';
  payload: any;
  timestamp: Date;
}

export interface ChatMessagePayload {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  message: string;
  timestamp: Date;
}

export interface TypingPayload {
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: number;
  online: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimer: any;

  private connectionStatus$ = new BehaviorSubject<'connected' | 'connecting' | 'disconnected'>('disconnected');
  private messages$ = new Subject<ChatMessagePayload>();
  private typingStatus$ = new Subject<TypingPayload>();
  private userStatus$ = new Subject<UserStatusPayload>();

  get connectionStatus(): Observable<'connected' | 'connecting' | 'disconnected'> {
    return this.connectionStatus$.asObservable();
  }

  get incomingMessages(): Observable<ChatMessagePayload> {
    return this.messages$.asObservable();
  }

  get typingIndicator(): Observable<TypingPayload> {
    return this.typingStatus$.asObservable();
  }

  get userOnlineStatus(): Observable<UserStatusPayload> {
    return this.userStatus$.asObservable();
  }

  connect(userId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionStatus$.next('connecting');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus$.next('connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionStatus$.next('disconnected');
        this.attemptReconnect(userId);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus$.next('disconnected');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatus$.next('disconnected');
      this.simulateRealtime();
    }
  }

  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'message':
        this.messages$.next(data.payload as ChatMessagePayload);
        break;
      case 'typing':
        this.typingStatus$.next(data.payload as TypingPayload);
        break;
      case 'status':
        this.userStatus$.next(data.payload as UserStatusPayload);
        break;
    }
  }

  private attemptReconnect(userId: number): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, using simulation mode');
      this.simulateRealtime();
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(userId);
    }, this.reconnectInterval);
  }

  private simulateRealtime(): void {
    this.connectionStatus$.next('connected');
  }

  sendMessage(message: ChatMessagePayload): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        payload: message,
        timestamp: new Date()
      }));
    } else {
      this.messages$.next(message);
    }
  }

  sendTypingStatus(userId: number, userName: string, isTyping: boolean, receiverId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        payload: { userId, userName, isTyping, receiverId },
        timestamp: new Date()
      }));
    }
  }

  markAsRead(messageId: number, userId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'read',
        payload: { messageId, userId },
        timestamp: new Date()
      }));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionStatus$.next('disconnected');
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
