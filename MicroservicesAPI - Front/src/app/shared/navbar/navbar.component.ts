import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen: boolean = false;
  cartOpen: boolean = false;
  cartItems: any[] = [];
  user: any = null;
  searchFocused = false;

  constructor(private http: HttpClient, private router: Router, private searchService: SearchService, private cartService: CartService) {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    })
  }

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

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.setSearchQuery(value);
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

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) return;
    this.cartService.updateItemQuantity(item.productId, newQty);
  }

  removeFromCart(item: any) {
    this.cartService.removeFromCart(item.productId);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  goToCart() {
    this.router.navigate(['/cart']);
    this.cartOpen = false;
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

  myOrders() {
    this.router.navigate(['/user/my-orders']);
  }

  logout() {
    this.http.post(this.logoutUrl, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion :', error);
      }
    });
  };
}

