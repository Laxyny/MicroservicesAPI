import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { ApiProductsService } from '../services/products.service';
import { SearchService } from '../services/search.service';
import { ApiCategoriesService } from '../services/categories.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RatingService } from '../services/rating.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';

@Component({
  selector: 'app-homepage',
  imports: [
    NgIf,
    NgFor,
    RouterModule,
    FormsModule,
    StarRatingComponent,
    CommonModule
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  products: any[] = [];
  user: any = null;
  stores: any[] = [];
  storeNamesById: { [key: string]: string } = {};
  filteredProducts: any[] = [];
  categories: any[] = [];
  selectedCategory: string | null = null;
  wishlistProductIds: string[] = [];

  showCategoryModal = false;
  categorySearch = '';
  filteredCategoriesInModal: any[] = [];
  productRatings: Map<string, { average: number, count: number }> = new Map();

  private apiUrl = 'http://localhost:3000/user';

  constructor(
    private http: HttpClient,
    private router: Router,
    private getStoreName: ApiStoresService,
    private getAllProducts: ApiProductsService,
    private searchService: SearchService,
    private categoriesService: ApiCategoriesService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ratingService: RatingService
  ) { }

  ngOnInit() {
    this.fetchUserData();
    this.fetchProductsData();
    this.fetchCategories();
    this.loadWishlist();

    this.searchService.searchQuery$.subscribe(query => {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    });

    this.route.queryParams.subscribe(params => {
      const categoryId = params['category'];
      if (categoryId) {
        this.selectedCategory = categoryId;
      }
    });
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
        this.router.navigate(['/login']);
      }
    });
  }

  fetchCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (categories: any[]) => {
        this.categories = categories;

        if (this.selectedCategory) {
          this.filterByCategory(this.selectedCategory);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des catégories :', error);
      }
    });
  }

  fetchProductsData() {
    this.getAllProducts.getAllProducts().subscribe({
      next: (products: any[]) => {
        this.products = products;
        this.filteredProducts = products;

        this.products.forEach(product => {
          this.loadProductRating(product._id);
        });

        const storeIds = [...new Set(products.map(p => p.storeId))];
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
        this.stores = [];
      }
    });
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategory = categoryId;

    if (!categoryId) {
      this.filteredProducts = this.products;
      return;
    }

    this.filteredProducts = this.products.filter(product => product.categoryId === categoryId);
  }

  openCategoryModal() {
    this.showCategoryModal = true;
    this.filteredCategoriesInModal = this.categories;
  }

  closeCategoryModal(event: Event) {
    event.preventDefault();
    this.showCategoryModal = false;
    this.categorySearch = '';
  }

  filterCategoriesInModal() {
    if (!this.categorySearch.trim()) {
      this.filteredCategoriesInModal = this.categories;
      return;
    }

    this.filteredCategoriesInModal = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  selectCategoryFromModal(categoryId: string) {
    this.filterByCategory(categoryId);
    this.closeCategoryModal(new Event('click'));
  }

  goToProductDetails(productId: string) {
    this.router.navigate([`/product/${productId}`]);
  }

  loadProductRating(productId: string) {
    this.ratingService.getAverageRating(productId).subscribe({
      next: (data) => {
        this.productRatings.set(productId, {
          average: data.average || 0,
          count: data.count || 0
        });
      },
      error: () => {
        this.productRatings.set(productId, { average: 0, count: 0 });
      }
    });
  }

  getProductRating(productId: string): number {
    return this.productRatings.get(productId)?.average || 0;
  }

  getProductRatingCount(productId: string): number {
    return this.productRatings.get(productId)?.count || 0;
  }

  loadWishlist() {
    this.authService.getUserId().then(userId => {
      if (userId) {
        this.wishlistService.getWishlist(userId).subscribe({
          next: ids => {
            this.wishlistProductIds = ids;
          },
          error: err => console.error('Erreur chargement wishlist', err)
        });
      }
    });
  }

  toggleWishlist(productId: string, event: Event) {
    event.stopPropagation();
    this.authService.getUserId().then(userId => {
      if (!userId) return;

      if (this.isInWishlist(productId)) {
        this.wishlistService.removeFromWishlist(userId, productId).subscribe(() => {
          this.wishlistProductIds = this.wishlistProductIds.filter(id => id !== productId);
        });
      } else {
        this.wishlistService.addToWishlist(userId, productId).subscribe(() => {
          this.wishlistProductIds.push(productId);
        });
      }
    });
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistProductIds.includes(productId);
  }
}
