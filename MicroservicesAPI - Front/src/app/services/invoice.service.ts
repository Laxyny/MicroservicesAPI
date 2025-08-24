import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = 'http://localhost:7000';

    constructor(private http: HttpClient) { }

    generateInvoice(orderId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/invoices/generate`, {
            orderId: orderId
        }, { withCredentials: true });
    }

    downloadInvoice(invoiceId: string): void {
        window.open(`${this.apiUrl}/invoices/${invoiceId}`, '_blank');
    }
}