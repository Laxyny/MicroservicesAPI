import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiDashboardService } from "../services/dashboard.service";
import { NgForm, FormsModule } from "@angular/forms";
import { CommonModule, NgFor, NgIf } from "@angular/common";

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
  users: any[] = [];
  isAdmin = false;
  selectedTab = "users";

  showEditModal = false;
  editType: "user" | "store" | "product" | "category" = "user";
  editItem: any = {};
  editFields: { key: string; label: string }[] = [];

  selectedImageUrl: string | null = null;
  showImageModal = false;

  private apiUrl = "http://localhost:3000/user";

  constructor(
    private serviceDash: ApiDashboardService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchAllData();
  }

  fetchAllData() {
    this.http.get(this.apiUrl, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.isAdmin = user?.role === "admin";
        if (!this.isAdmin) this.router.navigate(["/login"]);
      },
      error: () => this.router.navigate(["/login"]),
    });
    this.serviceDash.getAllUsers().subscribe({ next: users => (this.users = users) });
    this.serviceDash.getAllStores().subscribe({ next: stores => (this.stores = stores) });
    this.serviceDash.getAllProducts().subscribe({ next: products => (this.products = products) });
    this.serviceDash.getAllCategories().subscribe({ next: cats => (this.categorys = cats) });
  }

  deleteStore(id: string) {
    this.serviceDash.deleteStore(id).subscribe(() => this.fetchAllData());
  }
  deleteProduct(id: string) {
    this.serviceDash.deleteProduct(id).subscribe(() => this.fetchAllData());
  }
  deleteCategory(id: string) {
    this.serviceDash.deleteCategory(id).subscribe(() => this.fetchAllData());
  }
  deleteUser(id: string) {
    this.serviceDash.deleteUser(id).subscribe(() => this.fetchAllData());
  }

  openEditModal(type: "user" | "store" | "product" | "category", item: any) {
    this.editType = type;
    this.editItem = { ...item };
    this.showEditModal = true;
    const exclude = {
      user: ['_id', 'googleId', 'passwordHash', '__v'],
      store: ['_id', '__v', 'createdAt', 'userId', 'logo', 'updatedAt'],
      product: ['_id', '__v', 'createdAt', 'storeId', 'userId', 'image', 'logo', 'customFields', 'updatedAt'],
      category: ['_id', '__v']
    }[type];
    this.editFields = Object.keys(item)
      .filter(key => !exclude.includes(key))
      .map(key => ({ key, label: this.headerLabel(key) }));
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editItem = {};
    this.editFields = [];
  }

  submitEdit() {
    const updateMap = {
      user: () => this.serviceDash.updateUser(this.editItem._id, this.editItem),
      store: () => this.serviceDash.updateStore(this.editItem._id, this.editItem),
      product: () => this.serviceDash.updateProduct(this.editItem._id, this.editItem),
      category: () => this.serviceDash.updateCategory(this.editItem._id, this.editItem)
    };
    updateMap[this.editType]().subscribe(() => {
      this.fetchAllData();
      this.closeEditModal();
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getStoreName(storeId: string): string {
    return this.stores.find(s => s._id === storeId)?.name || storeId;
  }
  getCategoryName(categoryId: string): string {
    return this.categorys.find(c => c._id === categoryId)?.name || categoryId;
  }
  getUserName(userId: string): string {
    return this.users.find(u => u._id === userId)?.name || userId;
  }

  openImageModal(url: string) {
    this.selectedImageUrl = url;
    this.showImageModal = true;
  }
  closeImageModal() {
    this.selectedImageUrl = null;
    this.showImageModal = false;
  }

  getRoleLabel(role: string): string {
    return { user: "Client", seller: "Vendeur", admin: "Administrateur" }[role] || role;
  }

  headerLabel(key: string): string {
    const map: { [key: string]: string } = {
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      description: 'Description',
      price: 'Prix',
      category: 'Catégorie',
      categoryId: 'Catégorie',
      image: 'Image',
      storeId: 'Boutique',
      logo: 'Logo',
      site: 'Site',
      userId: 'Utilisateur',
      createdAt: 'Créé le',
      updatedAt: 'Modifié le'
    };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }
}