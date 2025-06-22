import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../services/notifications.service';
import { AuthService } from '../services/auth.service';
import { Socket, io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = true;
  userId: string = '';
  private socket!: Socket;

  constructor(private notificationService: NotificationService, private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.authService.getUser().then(user => {
      this.userId = user?._id || user?.userId;
      if (this.userId) {
        this.loadNotifications();
        this.connectWebSocket();
      }
    }).catch(err => {
      console.error('Erreur de récupération de l\'utilisateur:', err);
    });
  }

  loadNotifications() {
    this.loading = true;
    this.http.get<Notification[]>(`http://localhost:8000/notifications/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des notifications:', err);
          this.loading = false;
        }
      });
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification._id).subscribe();
    }
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    this.notifications = this.notifications.filter(n => n._id !== notification._id);
    
    this.notificationService.deleteNotification(notification._id).subscribe({
      error: (err) => {
        console.error('Erreur lors de la suppression de la notification:', err);
        if (err.status !== 404) {
          this.notifications.unshift(notification);
        }
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'order_status':
        return 'package';
      case 'new_order':
        return 'shopping-cart';
      case 'new_review':
        return 'star';
      case 'report_ready':
        return 'file-text';
      case 'service_status':
        return 'server';
      default:
        return 'bell';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Il y a ${diffInDays}j`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `Il y a ${diffInMonths} mois`;
  }

  connectWebSocket() {
    console.log('Tentative de connexion WebSocket...');
    this.socket = io('http://localhost:8000');

    this.socket.on('connect', () => {
      console.log('WebSocket connecté, authentification de l\'utilisateur:', this.userId);
      this.socket.emit('authenticate', this.userId);
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authentifié:', data);
    });

    this.socket.on('notification', (notification) => {
      console.log('Nouvelle notification reçue:', notification);
      this.notifications.unshift(notification);
      this.notificationService.updateUnreadCount();
    });
  }
}