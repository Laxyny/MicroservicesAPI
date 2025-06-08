import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FooterComponent } from "../shared/footer/footer.component";
import { OrderService } from '../services/orders.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    NgIf, 
    NgFor, 
    NgClass, 
    CommonModule, 
    FormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];
  sortKey: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedOrder: any = null;
  customerNames: Map<string, string> = new Map();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = true;
    this.orderService.getUserOrders().subscribe({
      next: (response: any) => {
        this.orders = response;
        this.orders.forEach(order => {
          this.fetchCustomerInfo(order.userId);
        });
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes', error);
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  fetchCustomerInfo(userId: string) {
    if (!this.customerNames.has(userId)) {
      this.authService.getUserById(userId).subscribe({
        next: (user: any) => {
          if (user && user.name) {
            this.customerNames.set(userId, user.name);
          } else {
            this.customerNames.set(userId, 'Client inconnu');
          }
        },
        error: () => {
          this.customerNames.set(userId, 'Client inconnu');
        }
      });
    }
  }

  getCustomerName(userId: string): string {
    return this.customerNames.get(userId) || 'Chargement...';
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredOrders = [...this.orders];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOrders = this.orders.filter(order => 
        order._id.toString().includes(term) ||
        (this.customerNames.get(order.userId) || '').toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term) ||
        order.total.toString().includes(term)
      );
    }
    
    this.sort(this.sortKey, false);
    this.updatePagination();
  }

  sort(key: string, toggleDirection: boolean = true) {
    if (toggleDirection && this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.sortKey = key;
    
    this.filteredOrders.sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];
      
      if (key === 'customer') {
        valueA = this.customerNames.get(a.userId) || '';
        valueB = this.customerNames.get(b.userId) || '';
      } else if (key === 'date') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  showOrderDetails(order: any) {
    this.selectedOrder = order;
    document.body.style.overflow = 'hidden';
  }

  closeOrderDetails(event: Event) {
    if (
      event.target === event.currentTarget || 
      (event.target as Element).classList.contains('close-btn') ||
      (event.target as Element).classList.contains('btn-close')
    ) {
      this.selectedOrder = null;
      document.body.style.overflow = '';
    }
  }

  cancelOrder(order: any) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.orderService.cancelOrder(order._id).subscribe({
        next: () => {
          order.status = 'Annulée';
          this.selectedOrder = { ...order };
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation de la commande', error);
          alert('Impossible d\'annuler la commande');
        }
      });
    }
  }

  viewOrderDetails(order: any) {
    this.showOrderDetails(order);
  }

  deleteOrder(order: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.orderService.deleteOrder(order._id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o._id !== order._id);
          this.applyFilter();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la commande', error);
        }
      });
    }
  }
}