import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ApiProductsService } from '../services/products.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  imports: [NgIf]
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;

  private productDetailsUrl = 'http://localhost:3000/product/product';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private productsApi: ApiProductsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductDetails(id);
    }
  }

  fetchProductDetails(productId: string): void {
    this.http.get(`${this.productDetailsUrl}/${productId}`, { withCredentials: true })
      .subscribe({
        next: (product: any) => this.product = product,
        error: err => {
          console.error('Erreur lors du chargement du produit :', err);
          this.router.navigate(['/homepage']);
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
