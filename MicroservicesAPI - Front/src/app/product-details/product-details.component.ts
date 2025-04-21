import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { ApiProductsService } from '../services/products.service';
import { ApiStoresService } from '../services/stores.service';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { ApiCategoriesService } from '../services/categories.service';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent]
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  store: any = null;
  category: any = null;

  private productDetailsUrl = 'http://localhost:3000/product/product';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private productsApi: ApiProductsService,
    private storeApi: ApiStoresService,
    private categoryApi: ApiCategoriesService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductDetails(id);
    }
  }

  fetchProductDetails(productId: string): void {
    this.http.get(`${this.productDetailsUrl}/${productId}`, { withCredentials: true })
      .subscribe({
        next: (product: any) => {
          this.product = product;
          const storeId = product.storeId;
          const categoryId = product.categoryId;
          if (storeId) {
            this.fetchStoreName(storeId);
          }

          if (categoryId) {
            this.fetchCategoryName(categoryId);
          }
        },
        error: err => {
          console.error('Erreur lors du chargement du produit :', err);
          this.router.navigate(['/homepage']);
        }
      });
  }

  fetchStoreName(storeId: string): void {
    this.storeApi.getStoreName(storeId).subscribe({
      next: (storeId: string) => this.store = storeId,
      error: err => {
        console.error('Erreur lors du chargement du nom du magasin :', err);
        this.store = 'Inconnu';
      }
    });
  }

  fetchCategoryName(productId: string): void {
    this.categoryApi.getProductCategories(productId).subscribe({
      next: (category: any) => this.category = category,
      error: err => {
        console.error('Erreur lors du chargement de la catégorie :', err);
        this.category = 'Inconnue';
      }
    });
  }

  deleteProduct(): void {
    if (confirm('Supprimer ce produit ?')) {
      this.productsApi.deleteProduct(this.product._id).subscribe({
        next: () => {
          alert('Produit supprimé avec succès.');
          this.router.navigate(['/homepage']);
        },
        error: err => {
          console.error('Erreur lors de la suppression :', err);
          alert('Une erreur est survenue.');
        }
      });
    }
  }
}
