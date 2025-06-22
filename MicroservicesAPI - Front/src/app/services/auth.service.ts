import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/user';
    private isLoggedIn: boolean = false;

    constructor(private http: HttpClient, private router: Router) { }

    checkAuthStatus(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.http
                .get(this.apiUrl, { withCredentials: true })
                .subscribe(
                    (user: any) => {
                        this.isLoggedIn = true;
                        resolve(true);
                    },
                    (error) => {
                        this.isLoggedIn = false;
                        resolve(false);
                    }
                );
        });
    }

    getUser(): Promise<any> {
        return this.http.get('http://localhost:3000/user', { withCredentials: true })
            .toPromise();
    }

    logout() {
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
    }

    getAuthStatus(): boolean {
        return this.isLoggedIn;
    }

    postLogin(email: string, password: string): Observable<any> {
        return this.http.post(
            'http://localhost:3000/login',
            {
                email: email,
                password: password
            },
            { withCredentials: true }
        );
    }

    postRegister(
        email: string,
        name: string,
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

    getLoginWithGoogle(): Observable<any> {
        return this.http.get(
            'http://localhost:5000/auth/google/callback',
        );
    }

    getUserById(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${userId}`, { withCredentials: true });
    }

    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.apiUrl}`, { withCredentials: true });
    }
}
