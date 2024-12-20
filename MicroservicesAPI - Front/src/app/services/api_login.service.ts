import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiLoginService {

    constructor(private http: HttpClient) { }

    postLogin(name: string, password: string): Observable<any> {
        return this.http.post(
            'http://localhost:3000/login',
            {
                name: name,
                password: password
            }
        );
    }
}