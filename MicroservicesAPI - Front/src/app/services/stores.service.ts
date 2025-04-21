import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiStoresService {
    constructor(private http: HttpClient) { }

    getMyStores(): Observable<any> {
        return this.http.get('http://localhost:3000/seller/stores', { withCredentials: true });
    }

    postCreateStore(name: string, description: string, logo: string, site: string): Observable<any> {
        return this.http.post(
            'http://localhost:3000/seller/createStore',
            {
                name: name,
                description: description,
                logo: logo,
                site: site
            }, { withCredentials: true }
        );
    }
    deleteStore(storeId: string): Observable<any> {
        return this.http.delete(`http://localhost:3000/seller/deleteStore/${storeId}`, { withCredentials: true });
    }

    getStoreName(storeId: string): Observable<any> {
        return this.http.get(`http://localhost:3000/seller/store/${storeId}`, { withCredentials: true });
    }
}
