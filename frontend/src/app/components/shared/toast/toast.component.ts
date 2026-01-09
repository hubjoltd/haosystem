import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast" [ngClass]="'toast-' + toast.type" (click)="remove(toast.id)">
        <i class="fas" [ngClass]="getIcon(toast.type)"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      min-width: 280px;
      max-width: 400px;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-success {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }
    .toast-error {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    .toast-info {
      background: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }
    .toast-warning {
      background: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }
    .toast-close {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.7;
    }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }
}
