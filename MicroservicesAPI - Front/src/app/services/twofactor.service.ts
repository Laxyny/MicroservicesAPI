import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TwoFactorService {
    private apiUrl = 'http://localhost:3008';

    constructor(private http: HttpClient) { }

    setup(userId: string): Observable<any> {
        const headers = new HttpHeaders().set('x-user-id', userId);
        return this.http.get(`${this.apiUrl}/2fa/setup`, { headers });
    }

    verify(userId: string, code: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/2fa/verify`, { userId, code });
    }

    getStatus(userId: string): Observable<any> {
        const headers = new HttpHeaders().set('x-user-id', userId);
        return this.http.get(`${this.apiUrl}/2fa/status`, { headers });
    }

    disable(userId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/2fa/disable`, { userId });
    }
}