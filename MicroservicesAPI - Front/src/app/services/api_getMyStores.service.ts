import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiGetMyStoresService {
    private storesUrl = 'http://localhost:3000/seller/stores';

    constructor(private http: HttpClient) { }

    getMyStores(): Observable<any> {
        return this.http.get(this.storesUrl, { withCredentials: true });
    }
}
