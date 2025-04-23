import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { NgFor, NgIf } from '@angular/common';
import { ApiStoresService } from '../services/stores.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-my-store',
  imports: [NgIf, NgFor],
  templateUrl: './my-store.component.html',
  styleUrl: './my-store.component.css'
})

export class MyStoreComponent implements OnInit {
  stores: any[] = [];
  user: any = null;
  storeNamesById: { [key: string]: string } = {};
  isSeller: boolean = false;

  constructor(private getMyStores: ApiStoresService, private router: Router, private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000/user';

  ngOnInit() {
    this.fetchUserData();
    this.fetchStoresData();
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.user = user;
        this.isSeller = user?.role === 'seller';
      },
      error: () => {
        console.log('Erreur Homepage redirection vers /login')
        this.router.navigate(['/login']);
      }
    });
  }

  fetchStoresData() {
    this.getMyStores.getMyStores().subscribe({
      next: (stores: any[]) => {
        console.log('Boutiques reçues :', stores);
        this.stores = stores;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des boutiques :', error);
        this.stores = [];
      }
    });
  }

  goToCreateStore() {
    this.router.navigate(['/seller/createStore']);
  }

  goToStoreDetails(storeId: string) {
    this.router.navigate([`/seller/store/${storeId}`]);
  }
}
