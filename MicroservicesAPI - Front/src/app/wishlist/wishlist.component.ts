import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { ApiProductsService } from '../services/products.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistProductIds: string[] = [];
  products: any[] = [];

  constructor(
    private wishlistService: WishlistService,
    private productsService: ApiProductsService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.authService.getUserId().then(userId => {
      if (userId) {
        this.wishlistService.getWishlist(userId).subscribe({
          next: (ids: string[]) => {
            this.wishlistProductIds = ids;
            this.loadProducts();
          },
          error: (err: any) => console.error('Erreur chargement wishlist', err)
        });
      } else {
        console.error('Aucun userId trouvé pour la wishlist.');
      }
    });
  }

  loadProducts() {
    this.productsService.getAllProducts().subscribe({
      next: (allProducts: any[]) => {
        this.products = allProducts.filter(p => this.wishlistProductIds.includes(p._id));
      },
      error: (err: any) => console.error('Erreur chargement produits', err)
    });
  }

  goToProductDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  removeFromWishlist(productId: string) {
    this.authService.getUserId().then(userId => {
      if (userId) {
        this.wishlistService.removeFromWishlist(userId, productId).subscribe({
          next: () => {
            this.products = this.products.filter(p => p._id !== productId);
            this.wishlistProductIds = this.wishlistProductIds.filter(id => id !== productId);

            console.log('Produit retiré de la wishlist');
          },
          error: (err) => console.error('Erreur lors de la suppression du produit de la wishlist', err)
        });
      }
    });
  }
}
