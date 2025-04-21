import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen: boolean = false;
  user: any = null;
  searchFocused = false;

  constructor(private http: HttpClient, private router: Router) { }

  private logoutUrl = 'http://localhost:3000/logout';
  private apiUrl = 'http://localhost:3000/user';

  ngOnInit() {
    this.fetchUserData();
  }

  onSearchFocus() {
    this.searchFocused = true;
  }
  
  onSearchBlur() {
    setTimeout(() => this.searchFocused = false, 150);
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.user = user;
      },
      error: () => {
        console.log('Erreur Navbar redirection vers /login')
        this.router.navigate(['/login']);
      }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToMyStore() {
    this.router.navigate(['/seller/my-store']);
  }

  settings() {
    this.router.navigate(['/user/settings']);
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
  };
}

