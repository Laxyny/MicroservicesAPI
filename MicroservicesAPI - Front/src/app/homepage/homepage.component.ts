import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { ApiProductsService } from '../services/products.service';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-homepage',
  imports: [
    NgIf,
    NgFor,
    RouterModule,
    NavbarComponent,
    FooterComponent
],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  products: any[] = [];
  user: any = null;
  stores: any[] = [];
  storeNamesById: { [key: string]: string } = {};

  private apiUrl = 'http://localhost:3000/user';

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
}
