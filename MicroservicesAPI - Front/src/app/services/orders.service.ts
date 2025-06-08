import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class OrderService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/orders`, orderData, { withCredentials: true });
    }

    getUserOrders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/orders`, { withCredentials: true });
    }

    getOrderDetails(orderId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orders/${orderId}`, { withCredentials: true });
    }

    updateOrder(orderId: string, orderData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/orders/${orderId}`, orderData, { withCredentials: true });
    }

    cancelOrder(orderId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/orders/${orderId}`, { status: 'Annulée' }, { withCredentials: true });
    }

    deleteOrder(orderId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/orders/${orderId}`, { withCredentials: true });
    }
}