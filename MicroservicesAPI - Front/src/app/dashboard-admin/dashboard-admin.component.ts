import { Component, OnInit, NgModule } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiDashboardService } from "../services/dashboard.service";
// import { nextTick } from "process";
import { NgForm, FormsModule } from "@angular/forms";
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: "app-dashboard-admin",
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: "./dashboard-admin.component.html",
  styleUrl: "./dashboard-admin.component.css",
})
export class DashboardAdminComponent implements OnInit {
  stores: any[] = [];

  products: any[] = [];

  categorys: any[] = [];

  isAdmin: boolean = false;
  users: any[] = [];
  selectedTab: string = "users";

  showEditModal = false;
  editType: "user" | "store" | "product" | "category" = "user";
  editItem: any = {};
  editFields: { key: string; label: string }[] = [];

  constructor(
    private serviceDash: ApiDashboardService,
    private router: Router,
    private http: HttpClient
  ) {}

  private apiUrl = "http://localhost:3000/user";

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchStoresData();
    this.fetchProductData();
    this.fetchCategorysData();
    this.fetchUsersData();
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  fetchUserData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        console.log("Utilisateur récupéré :", user);
        this.isAdmin = user?.role === "admin";
        if (!this.isAdmin) {
          console.log(
            "Redirection vers /login car l'utilisateur n'est pas admin"
          );
          this.router.navigate(["/login"]);
        }
      },
      error: () => {
        console.log(
          "Erreur lors de la récupération de l'utilisateur, redirection vers /login"
        );
        this.router.navigate(["/login"]);
      },
    });
  }

  fetchUsersData() {
    this.serviceDash.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.users = users;
      }
    });
  }

  fetchStoresData() {
    this.serviceDash.getAllStores().subscribe({
      next: (stores: any[]) => {
        console.log("Boutiques reçues :", stores);
        this.stores = stores;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des boutiques :", error);
      },
    });
  }

  fetchProductData() {
    this.serviceDash.getAllProducts().subscribe({
      next: (products: any[]) => {
        console.log("Produits reçus :", products);
        this.products = products;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des produits :", error);
      },
    });
  }

  fetchCategorysData() {
    this.serviceDash.getAllCategories().subscribe({
      next: (categorys: any[]) => {
        console.log("Catégories reçus :", categorys);
        this.categorys = categorys;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des catégories :", error);
      },
    });
  }

  getStoreDetails(storeId: string) {
    this.serviceDash.getStore(storeId);
  }

  getProductDetails(productId: string) {
    this.serviceDash.getProduct(productId);
  }

  getCategoryDetails(categoryId: string) {
    this.serviceDash.getCategory(categoryId);
  }

  deleteStore(storeId: string) {
    this.serviceDash.deleteStore(storeId).subscribe({
      next: () => {
        console.log("Boutique supprimée avec succès");
        this.fetchStoresData();
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de la boutique :", error);
      },
    });
  }

  deleteProduct(productId: string) {
    this.serviceDash.deleteProduct(productId).subscribe({
      next: () => {
        console.log("Produit supprimé avec succès");
        this.fetchProductData();
      },
      error: (error) => {
        console.error("Erreur lors de la suppression du produit :", error);
      },
    });
  }

  deleteCategory(categoryId: string) {
    this.serviceDash.deleteCategory(categoryId).subscribe({
      next: () => {
        console.log("Catégorie supprimée avec succès");
        this.fetchCategorysData();
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de la catégorie :", error);
      },
    });
  }

  deleteUser(userId: string) {
    this.serviceDash.deleteUser(userId).subscribe({
        next: () => {
            console.log("Utilisateur supprimé avec succès");
            this.fetchUsersData();
        },
        error: (error) => {
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
        },
    });
  }

  openEditModal(type: 'user' | 'store' | 'product' | 'category', item: any) {
    this.editType = type;
    this.editItem = { ...item };
    this.showEditModal = true;
    if (type === 'user') {
      this.editFields = [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rôle' }
      ];
    } else if (type === 'store') {
      this.editFields = [
        { key: 'name', label: 'Nom' },
        { key: 'description', label: 'Description' }
      ];
    } else if (type === 'product') {
      this.editFields = [
        { key: 'name', label: 'Nom' },
        { key: 'description', label: 'Description' },
        { key: 'price', label: 'Prix' }
      ];
    } else if (type === 'category') {
      this.editFields = [
        { key: 'name', label: 'Nom' },
        { key: 'description', label: 'Description' }
      ];
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editItem = {};
    this.editFields = [];
  }

  submitEdit() {
    if (this.editType === 'user') {
      this.serviceDash.updateUser(this.editItem._id, this.editItem).subscribe(() => {
        this.fetchUsersData();
        this.closeEditModal();
      });
    } else if (this.editType === 'store') {
      this.serviceDash.updateStore(this.editItem._id).subscribe(() => {
        this.fetchStoresData();
        this.closeEditModal();
      });
    } else if (this.editType === 'product') {
      this.serviceDash.updateProduct(this.editItem._id).subscribe(() => {
        this.fetchProductData();
        this.closeEditModal();
      });
    } else if (this.editType === 'category') {
      this.serviceDash.updateCategory(this.editItem._id).subscribe(() => {
        this.fetchCategorysData();
        this.closeEditModal();
      });
    }
  }
}
