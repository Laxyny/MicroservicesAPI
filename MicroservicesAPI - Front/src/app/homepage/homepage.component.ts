import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-homepage',
  imports: [
    NgIf,
    RouterModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  welcomeMessage: string = '';
  isSeller: boolean = false;
  store: any = null;

  private apiUrl = 'http://localhost:3000/user';
  private logoutUrl = 'http://localhost:3000/logout';
  private storeUrl = 'http://localhost:3000/seller/store';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.fetchUserData();
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.welcomeMessage = `Bienvenue, ${user.name}, vous êtes ${user.role}.`;
        this.isSeller = user.role === 'seller';

        if (this.isSeller) {
          this.fetchStoreData();
        }
      },
      error: () => {
        console.log('Erreur Homepage redirection vers /login')
        this.router.navigate(['/login']);
      }
    });
  }

  fetchStoreData() {
    this.http.get(this.storeUrl, { withCredentials: true }).subscribe({
      next: (store: any) => {
        this.store = store;
      },
      error: () => {
        this.store = null;
      }
    });
  }

  logout() {
    this.http.post(this.logoutUrl, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion :', error);
      }
    });
  }

  goToCreateStore() {
    this.router.navigate(['/seller/createStore']);
  }
}
