import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiCreateStoreService {

    constructor(private http: HttpClient) { }

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
}