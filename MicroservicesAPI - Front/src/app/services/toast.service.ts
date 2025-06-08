import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})

export class ToastService {
    private toastSubject = new Subject<ToastData>();
    toast$ = this.toastSubject.asObservable();

    showSuccess(message: string): void {
        this.toastSubject.next({ message, type: 'success' });
    }

    showError(message: string): void {
        this.toastSubject.next({ message, type: 'error' });
    }

    showInfo(message: string): void {
        this.toastSubject.next({ message, type: 'info' });
    }
}