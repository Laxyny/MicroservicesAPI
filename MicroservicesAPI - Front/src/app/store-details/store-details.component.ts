import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.css'],
  imports: [
    NgIf,
  ]
})
export class StoreDetailsComponent implements OnInit {
  store: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    const storeId = this.route.snapshot.paramMap.get('id');
    this.fetchStoreDetails(storeId);
  }

  fetchStoreDetails(storeId: string | null) {
    if (!storeId) return;

    this.http.get(`http://localhost:3000/seller/store/${storeId}`, { withCredentials: true }).subscribe({
      next: (store: any) => {
        this.store = store;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails de la boutique :', error);
      }
    });
  }
}
