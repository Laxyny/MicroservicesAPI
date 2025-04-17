import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { ApiProductsService } from '../services/products.service';

@Component({
  selector: 'app-homepage',
  imports: [
    NgIf,
    NgFor,
    RouterModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  welcomeMessage: string = '';
  isSeller: boolean = false;
  stores: any[] = [];
  products: any[] = [];

  private apiUrl = 'http://localhost:3000/user';
  private logoutUrl = 'http://localhost:3000/logout';

  constructor(private http: HttpClient, private router: Router, private getMyStores: ApiStoresService, private getAllProducts: ApiProductsService) { }

  ngOnInit() {
    this.fetchUserData();
    this.fetchProductsData();
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.welcomeMessage = `Bienvenue, ${user.name}, vous êtes ${user.role}.`;
        this.isSeller = user.role === 'seller';

        if (this.isSeller) {
          this.fetchStoresData();
        }
      },
      error: () => {
        console.log('Erreur Homepage redirection vers /login')
        this.router.navigate(['/login']);
      }
    });
  }

  fetchProductsData() {
    this.getAllProducts.getAllProducts().subscribe({
      next: (products: any[]) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des boutiques :', error);
        this.stores = [];
      }
    });
  }

  goToProductDetails(productId: string) {
    this.router.navigate([`/product/${productId}`]);
  }

  fetchStoresData() {
    this.getMyStores.getMyStores().subscribe({
      next: (stores: any[]) => {
        this.stores = stores;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des boutiques :', error);
        this.stores = [];
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

  goToStoreDetails(storeId: string) {
    this.router.navigate([`/seller/store/${storeId}`]);
  }
}
