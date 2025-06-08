import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { catchError, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartUrl = 'http://localhost:3000/cart';
  private productUrl = 'http://localhost:3000/product/product/';
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshCart();
  }

  getCartItems(): Observable<any> {
    return this.http.get<any>(this.cartUrl, { withCredentials: true });
  }

  refreshCart() {
    this.http.get<any>(this.cartUrl, { withCredentials: true }).subscribe(cart => {
      const items = cart?.items || [];
      if (items.length === 0) {
        this.cartItemsSubject.next([]);
        return;
      }
      forkJoin<any[]>(
        items.map((item: any) =>
          this.http.get<any>(this.productUrl + item.productId, { withCredentials: true }).pipe(
            catchError(err => {
              console.error('Erreur récupération produit', item.productId, err);
              return of(null);
            })
          )
        )
      ).subscribe((products: any[]) => {
        const enriched = items.map((item: any, i: number) => ({
          ...item,
          name: products[i]?.name ?? 'Produit inconnu',
          description: products[i]?.description ?? '',
          price: products[i]?.price ?? 0,
          image: products[i]?.image ?? '',
        }));
        this.cartItemsSubject.next(enriched);
      });
    });
  }

  addToCart(productId: string, quantity: number = 1) {
    return this.http.post<any>(this.cartUrl + '/add', { productId, quantity }, { withCredentials: true }).subscribe(() => {
      this.refreshCart();
    });
  }

  updateItemQuantity(productId: string, quantity: number) {
    return this.http.put<any>(this.cartUrl + '/update', { productId, quantity }, { withCredentials: true }).subscribe(() => {
      this.refreshCart();
    });
  }

  removeFromCart(productId: string) {
    return this.http.delete<any>(this.cartUrl + '/remove', { body: { productId }, withCredentials: true }).subscribe(() => {
      this.refreshCart();
    });
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.cartUrl}/empty`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.cartItemsSubject.next([]);
        })
      );
  }
}