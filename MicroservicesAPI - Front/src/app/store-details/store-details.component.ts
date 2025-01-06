import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.css'],
  imports: [
    NgIf
  ]
})
export class StoreDetailsComponent implements OnInit {
  store: any = null;
  private storeDetailsUrl = 'http://localhost:3000/seller/store';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private deleteStoreService: ApiStoresService
  ) { }

  ngOnInit() {
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      this.fetchStoreDetails(storeId);
    }
  }

  fetchStoreDetails(storeId: string) {
    this.http.get(`${this.storeDetailsUrl}/${storeId}`, { withCredentials: true }).subscribe({
      next: (store: any) => {
        this.store = store;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails de la boutique :', error);
        this.router.navigate(['/homepage']);
      }
    });
  }

  deleteStore() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.deleteStoreService.deleteStore(this.store._id).subscribe({
        next: () => {
          alert('La boutique a été supprimée avec succès.');
          this.router.navigate(['/homepage']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la boutique :', error);
          alert('Une erreur est survenue lors de la suppression de la boutique.');
        }
      });
    }
  }
}
