import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { FormsModule } from '@angular/forms';
import { ApiProductsService } from '../services/products.service';
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.css'],
  imports: [
    NgIf,
    FormsModule,
    CommonModule,
    NavbarComponent
]
})
export class StoreDetailsComponent implements OnInit {
  store: any = null;
  showAddProductForm = false;

  productName = '';
  productDescription = '';
  productPrice: number = 0;
  productCategoryId = '';
  image: File | null = null;

  products: any[] = [];

  private apiUploadUrl = 'http://localhost:3000/product/upload-image';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private deleteStoreService: ApiStoresService,
    private apiProductsService: ApiProductsService
  ) { }

  ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      this.fetchStoreDetails(storeId);
      this.fetchStoreProducts(storeId);
    }
  }

  fetchStoreDetails(storeId: string): void {
    this.http
      .get(`http://localhost:3000/seller/store/${storeId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (store: any) => {
          this.store = store;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des détails :', error);
          this.router.navigate(['/homepage']);
        },
      });
  }

  deleteStore(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.deleteStoreService.deleteStore(this.store._id).subscribe({
        next: () => {
          alert('La boutique a été supprimée avec succès.');
          this.router.navigate(['/homepage']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression :', error);
          alert('Une erreur est survenue lors de la suppression.');
        },
      });
    }
  }

  toggleProductForm(): void {
    this.showAddProductForm = !this.showAddProductForm;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.image = input.files[0];
      console.log('Fichier sélectionné :', this.image);
    }
  }

  async submitProduct(): Promise<void> {
    if (
      !this.productName.trim() ||
      !this.productDescription.trim() ||
      !this.productPrice ||
      !this.productCategoryId ||
      !this.image
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', this.image);
      console.log('FormData envoyé :', this.image);

      const uploadResponse: any = await this.http.post(this.apiUploadUrl, formData, { withCredentials: true }).toPromise();
      console.log('Réponse upload image :', uploadResponse);

      const imageUrl = uploadResponse.imageUrl;
      const storeId = this.store._id;

      console.log(this.productCategoryId);
      console.log(imageUrl);

      this.apiProductsService.postCreateProduct(this.productName, this.productDescription, this.productPrice, this.productCategoryId, imageUrl, storeId).subscribe({
        next: () => {
          alert('Produit créé avec succès.');
          this.toggleProductForm();
          this.fetchStoreDetails(this.store._id);
          this.clearFormFields();
        },
        error: (err) => {
          console.error('Erreur lors de la création du produit :', err);
          alert('Une erreur est survenue lors de la création du produit.');
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image :', error);
      alert('Impossible de téléverser l\'image du produit.');
    }
  }

  isFormValid(): boolean {
    return (
      this.productName.trim().length > 0 &&
      this.productDescription.trim().length > 0 &&
      this.productPrice > 0 &&
      this.productCategoryId.trim().length > 0 &&
      this.image !== null
    );
  }

  clearFormFields(): void {
    this.productName = '';
    this.productDescription = '';
    this.productPrice = 0;
    this.productCategoryId = '';
    this.image = null;
  }



  /*PRODUITS A MODIFIER QUAND PAS FLEMME*/

  fetchStoreProducts(storeId: string): void {
    this.apiProductsService.getStoreProduct(storeId)
      .subscribe({
        next: (products: any[]) => {
          this.products = products;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des produits :', err);
        }
      });
  }

  goToProductDetails(productId: string) {
    this.router.navigate([`/product/${productId}`]);
  }

}
