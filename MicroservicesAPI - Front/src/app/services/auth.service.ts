import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

    logout() {
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
    }

    getAuthStatus(): boolean {
        return this.isLoggedIn;
    }
}
