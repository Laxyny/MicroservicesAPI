import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { ApiProductsService } from '../services/products.service';
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-homepage',
  imports: [
    NgIf,
    NgFor,
    RouterModule,
    NavbarComponent
],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  welcomeMessage: string = '';
  isSeller: boolean = false;
  stores: any[] = [];
  products: any[] = [];
  user: any = null;
  storeNamesById: { [key: string]: string } = {};

  private apiUrl = 'http://localhost:3000/user';
  private logoutUrl = 'http://localhost:3000/logout';

  constructor(private http: HttpClient, private router: Router, private getMyStores: ApiStoresService, private getStoreName: ApiStoresService, private getAllProducts: ApiProductsService) { }

  ngOnInit() {
    this.fetchUserData();
    this.fetchProductsData();
  }

  getImageSrc(image: string): string {
    if (image && image.startsWith('http')) {
      return image;
    }

    return 'assets/images/placeholder.jpg';
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.user = user;
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

        const storeIds = [...new Set(products.map(p => p.storeId))]; // ids uniques
        storeIds.forEach(id => {
          this.getStoreName.getStoreName(id).subscribe({
            next: (store: any) => {
              this.storeNamesById[id] = store.name;
            },
            error: () => {
              this.storeNamesById[id] = 'Boutique inconnue';
            }
          });
        });
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

  goToCreateStore() {
    this.router.navigate(['/seller/createStore']);
  }

  goToStoreDetails(storeId: string) {
    this.router.navigate([`/seller/store/${storeId}`]);
  }
}
