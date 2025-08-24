import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'http://localhost:3011/wishlist';

  constructor(private http: HttpClient) {}

  getWishlist(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

  addToWishlist(userId: string, productId: string): Observable<any> {
    return this.http.post(this.apiUrl, { userId, productId });
  }

  removeFromWishlist(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, {
      body: { userId }
    });
  }
}
