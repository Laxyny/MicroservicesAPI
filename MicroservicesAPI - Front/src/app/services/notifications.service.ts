import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  private socket: Socket = io('http://localhost:8000', { autoConnect: false });
  private apiUrl = 'http://localhost:8000'; 
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private userId: string | null = null;
  
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeService();
  }

  private async initializeService() {
    try {
      const user = await this.authService.getUser();
      if (user) {
        this.userId = user._id || user.userId;
        console.log('NotificationService userId défini:', this.userId);
        if (this.userId) {
          this.connect(this.userId);
          this.loadNotifications(this.userId);
        }
      }
    } catch (error) {
      console.error('Erreur d\'initialisation du service de notification:', error);
    }
  }

  private connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.connect();
      this.socket.emit('authenticate', userId);
      
      this.socket.on('notification', (notification: Notification) => {
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next([notification, ...currentNotifications]);

        this.updateUnreadCount();
      });
    }
  }

  private disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
    }
  }

  private loadNotifications(userId: string): void {
    this.http.get<Notification[]>(`${this.apiUrl}/notifications/${userId}`)
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);
          const unreadCount = notifications.filter(n => !n.read).length;
          this.unreadCountSubject.next(unreadCount);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications', error);
        }
      });
  }

  markAsRead(notificationId: string): Observable<any> {
    const result = this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {});
    
    result.subscribe(() => {
      const currentNotifications = this.notificationsSubject.value;
      const updatedNotifications = currentNotifications.map(n => {
        if (n._id === notificationId) {
          return { ...n, read: true };
        }
        return n;
      });
      
      this.notificationsSubject.next(updatedNotifications);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      this.unreadCountSubject.next(unreadCount);
      this.updateUnreadCount();
    });
    
    return result;
  }

  deleteNotification(notificationId: string): Observable<any> {
    const result = this.http.delete(`${this.apiUrl}/notifications/${notificationId}`);
    
    result.subscribe(() => {
      const currentNotifications = this.notificationsSubject.value;
      const updatedNotifications = currentNotifications.filter(n => n._id !== notificationId);
      
      this.notificationsSubject.next(updatedNotifications);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      this.unreadCountSubject.next(unreadCount);
    });
    
    return result;
  }

  updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter((n: Notification) => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private showNotificationAlert(notification: Notification): void {
    console.log('Nouvelle notification:', notification.message);
  }
}