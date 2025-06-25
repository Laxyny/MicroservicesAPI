import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RatingService {
    private apiUrl = 'http://localhost:3003';

    constructor(private http: HttpClient) { }

    rateProduct(productId: string, rating: number, comment: string): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/rating/create`,
            { productId, rating, comment },
            {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    getProductRatings(productId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/rating/product/${productId}`);
    }

    getAverageRating(productId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/rating/average/${productId}`);
    }

    getUserRating(productId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/rating/user/${productId}`, { 
        withCredentials: true 
        });
    }

    hasUserPurchasedProduct(productId: string): Observable<any> {
        return this.http.get(`localhost:3005/order/check-purchase/${productId}`, {
        withCredentials: true
        });
    }
}