import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiDashboardService } from '../services/dashboard.service';
import { nextTick } from 'process';

@Component({
  selector: 'app-dashboard-admin',
  imports: [],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  stores: any[] = [];

  products: any[]= [];

  categorys: any[]= [];

  isAdmin: boolean = false;

    constructor(private serviceDash: ApiDashboardService, private router: Router, private http: HttpClient) { }

    private apiUrl = 'http://ms_back:3000/user';

  
    ngOnInit(): void {
        this.fetchStoresData();
        this.fetchProductData();
        this.fetchCategorysData();
        this.fetchUserData();
      }

    fetchUserData(){
        this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
            next: (user: any) => {
                console.log('Utilisateur récupéré :', user);
                this.isAdmin = user?.role === 'admin';
                if (!this.isAdmin) {
                    console.log('Redirection vers /login car l\'utilisateur n\'est pas admin');
                    this.router.navigate(['/login']);
                }
            },
            error: () => {
                console.log('Erreur lors de la récupération de l\'utilisateur, redirection vers /login');
                this.router.navigate(['/login']);
            }
        });
    }
    
    fetchStoresData(){
        this.serviceDash.getAllStores().subscribe({
            next: (stores: any[]) => {
                console.log('Boutiques reçues :', stores);
                this.stores = stores;
            },
            error: (error) => {
                console.error('Erreur lors de la récupération des boutiques :', error);
            }
        });
    }

    fetchProductData(){
        this.serviceDash.getAllProducts().subscribe({
            next: (products: any[]) => {
                console.log('Produits reçus :', products);
                this.products = products;
            },
            error: (error) => {
                console.error('Erreur lors de la récupération des produits :', error);
            }
        });
    } 

    fetchCategorysData(){
      this.serviceDash.getAllCategories().subscribe({
        next: (categorys: any[]) => {
          console.log('Catégories reçus :', categorys);
          this.categorys = categorys;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des catégories :', error);
        }
      });
    }

    getStoreDetails(storeId: string) {
        this.serviceDash.getStore(storeId);
    }

    
}
