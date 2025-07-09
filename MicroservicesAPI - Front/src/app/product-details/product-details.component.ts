import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { ApiProductsService } from '../services/products.service';
import { ApiStoresService } from '../services/stores.service';
import { ApiCategoriesService } from '../services/categories.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../services/rating.service';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, NgIf, StarRatingComponent]
})

export class ProductDetailsComponent implements OnInit {
  product: any = null;
  store: any = null;
  category: any = null;
  isOwner: boolean = false;

  showEditModal = false;
  editProduct: any = {};
  categories: any[] = [];

  averageRating: number = 0;
  ratingCount: number = 0;
  userRating: number = 0;
  canRate: boolean = false;
  userComment: string = '';
  showRatingForm: boolean = false;
  ratings: any[] = [];
  isRatingMode: boolean = false;
  userNames = new Map<string, string>();
  editCustomFieldsKeys: string[] = [];
  editCustomFieldsList: { key: string, value: string }[] = [];

  @ViewChild('zoomContainer') zoomContainer!: ElementRef;
  @ViewChild('zoomImage') zoomImage!: ElementRef;

  private productDetailsUrl = 'http://localhost:3004/product/product';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private productsApi: ApiProductsService,
    private storeApi: ApiStoresService,
    private categoryApi: ApiCategoriesService,
    private cartService: CartService,
    private authService: AuthService,
    private ratingService: RatingService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductDetails(id);
    }
    this.loadCategories();
  }

  ngAfterViewInit() {
    this.setupImageZoom();
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

          this.loadRatings();
          this.checkIfUserCanRate();
        },
        error: err => {
          console.error('Erreur lors du chargement du produit :', err);
          this.router.navigate(['/homepage']);
        }
      });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
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
    const cf = this.editProduct.customFields || {};
    this.editCustomFieldsList = Object.entries(cf)
      .map(([k, v]) => ({ key: k, value: v as string }));
    this.showEditModal = true;
  }

  updateEditCustomFieldKey(index: number, event: any) {
    const newKey = event.target.value;
    const oldKey = this.editCustomFieldsKeys[index];

    this.editCustomFieldsKeys[index] = newKey;

    if (oldKey !== newKey && oldKey !== undefined) {
      const value = this.editProduct.customFields[oldKey] || '';

      delete this.editProduct.customFields[oldKey];

      if (newKey.trim() !== '') {
        this.editProduct.customFields[newKey] = value;
      }
    }
  }

  updateEditCustomFieldValue(key: string, event: any) {
    const newValue = event.target.value;
    if (key && key.trim() !== '') {
      this.editProduct.customFields[key] = newValue;
    }
  }

  addCustomField() {
    this.editCustomFieldsList.push({ key: '', value: '' });
  }

  removeCustomField(i: number) {
    this.editCustomFieldsList.splice(i, 1);
  }

  trackByIndex(i: number): number {
    return i;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  submitEdit() {
    const customFields: { [key: string]: string } = {};
    this.editCustomFieldsList.forEach(field => {
      if (field.key && field.key.trim() !== '') {
        customFields[field.key.trim()] = field.value;
      }
    });
    this.editProduct.customFields = customFields;

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

  loadRatings() {
    if (this.product?._id) {
      this.ratingService.getAverageRating(this.product._id).subscribe({
        next: (data) => {
          this.averageRating = data.average;
          this.ratingCount = data.count;
        },
        error: (err) => console.error('Erreur lors du chargement des notes', err)
      });

      this.ratingService.getUserRating(this.product._id).subscribe({
        next: (data) => {
          this.userRating = data.rating;
          this.userComment = data.comment || '';
        },
        error: () => {
          this.userRating = 0;
          this.userComment = '';
        }
      });

      this.ratingService.getProductRatings(this.product._id).subscribe({
        next: (data) => {
          this.ratings = data;

          this.ratings.forEach(rating => {
            if (!this.userNames.has(rating.userId)) {
              this.fetchUserName(rating.userId);
            }
          });
        },
        error: (err) => console.error('Erreur lors du chargement des avis', err)
      });
    }
  }

  checkIfUserCanRate() {
    if (this.product?._id) {
      this.ratingService.hasUserPurchasedProduct(this.product._id).subscribe({
        next: (data) => {
          this.canRate = data.hasPurchased;
        },
        error: () => {
          this.canRate = false;
        }
      });
    }
  }

  fetchUserName(userId: string): void {
    this.authService.getUserById(userId).subscribe({
      next: (user: any) => {
        this.userNames.set(userId, user.name || 'Utilisateur anonyme');
      },
      error: (err) => {
        console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, err);
        this.userNames.set(userId, 'Utilisateur inconnu');
      }
    });
  }

  toggleRatingForm() {
    this.showRatingForm = !this.showRatingForm;
  }

  onRateProduct(rating: number) {
    console.log('Note sélectionnée :', rating);
    this.userRating = rating;
    this.isRatingMode = true;
  }

  cancelRating() {
    this.isRatingMode = false;
    this.userRating = 0;
    this.userComment = '';
  }

  submitRating() {
    console.log('submitRating appelé, userRating =', this.userRating);
    if (!this.userRating || this.userRating < 1 || this.userRating > 5) {
      alert('Merci de sélectionner une note entre 1 et 5 étoiles.');
      return;
    }
    if (!this.userComment.trim()) {
      alert('Veuillez entrer un commentaire pour accompagner votre note.');
      return;
    }

    this.ratingService
      .rateProduct(this.product._id, this.userRating, this.userComment)
      .subscribe({
        next: () => {
          this.isRatingMode = false;
          this.loadRatings();
          this.showRatingForm = false;
        },
        error: (err) => {
          console.error('Erreur lors de la notation', err);
          alert(err.error?.message || 'Erreur lors de l’envoi de votre avis.');
        }
      });
  }

  setupImageZoom() {
    const container = this.zoomContainer.nativeElement;
    const image = this.zoomImage.nativeElement;

    const zoomLevel = 2;

    container.addEventListener('mouseenter', () => {
      image.style.transformOrigin = '0 0';
    });

    container.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      image.style.transform = `scale(${zoomLevel}) translate(${x * (1 - zoomLevel) * 100}%, ${y * (1 - zoomLevel) * 100}%)`;
    });

    container.addEventListener('mouseleave', () => {
      image.style.transform = 'scale(1) translate(0, 0)';
    });
  }
}