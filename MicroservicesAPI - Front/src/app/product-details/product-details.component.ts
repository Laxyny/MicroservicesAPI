import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { ApiProductsService } from '../services/products.service';
import { ApiStoresService } from '../services/stores.service';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { ApiCategoriesService } from '../services/categories.service';
import { FooterComponent } from "../shared/footer/footer.component";
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, NgIf]
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  store: any = null;
  category: any = null;
  isOwner: boolean = false;

  showEditModal = false;
  editProduct: any = {};
  categories: any[] = [];

  private productDetailsUrl = 'http://localhost:3000/product/product';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private productsApi: ApiProductsService,
    private storeApi: ApiStoresService,
    private categoryApi: ApiCategoriesService,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductDetails(id);
    }
    this.loadCategories();
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
          console.error('Erreur lors du chargement du produit :', err);
          this.router.navigate(['/homepage']);
        }
      });
  }

  loadCategories(): void {
    this.categoryApi.getAllCategories().subscribe({
      next: (categories: any[]) => {
        this.categories = categories;
      },
      error: err => {
        console.error('Erreur lors du chargement des catégories :', err);
      }
    });
  }

  fetchStoreName(storeId: string): void {
    this.storeApi.getStoreById(storeId).subscribe({
      next: (store: any) => {
        this.store = store;
        console.log('Store details:', store);
        this.checkOwnership();
      },
      error: err => {
        console.error('Erreur lors du chargement du magasin :', err);
        this.store = { name: 'Inconnu' };
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
    if (confirm('Supprimer ce produit ?')) {
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

  checkOwnership() {
    console.log("Vérification de propriété commencée");
    this.authService.checkAuthStatus().then(isAuthenticated => {
      console.log("Authentifié:", isAuthenticated);
      if (isAuthenticated) {
        this.authService.getUser().then(user => {
          console.log('User details:', user);
          console.log('Store details:', this.store);
          
          if (this.store && user) {
            console.log(`Store userId: "${this.store.userId}"`);
            console.log(`User ID: "${user._id || user.userId}"`);
            
            this.isOwner = this.store.userId === user._id || this.store.userId === user.userId;
            console.log('Est propriétaire:', this.isOwner);
          } else {
            console.log("Store ou user non défini");
          }
        }).catch(err => console.error('Erreur lors de la récupération des infos utilisateur:', err));
      }
    });
  }

  addToCart() {
    if (this.product?._id) {
      this.cartService.addToCart(this.product._id, 1);
    }
  }

  openEditModal() {
    this.editProduct = { ...this.product };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  submitEdit() {
    this.productsApi.updateProduct(this.product._id, this.editProduct).subscribe({
      next: () => {
        alert('Produit modifié avec succès.');
        this.product = { ...this.editProduct };
        this.closeEditModal();
      },
      error: err => {
        alert('Erreur lors de la modification.');
        console.error(err);
      }
    });
  }
}
