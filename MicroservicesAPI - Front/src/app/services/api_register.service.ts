import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiRegisterService {

    constructor(private http: HttpClient) { }

    postRegister(
        name: string,
        email: string,
        password: string,
        role: string
    ): Observable<any> {
        return this.http.post(
            'http://localhost:3000/register',
            {
                email: email,
                name: name,
                password: password,
                role: role
            }
        );
    }
}