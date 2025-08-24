import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiProductsService {
    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<any> {
        return this.http.get('http://localhost:3004/product/listProducts', { withCredentials: true });
    }

    getStoreProduct(storeId: string): Observable<any> {
        return this.http.get(`http://localhost:3004/product/products/${storeId}`, { withCredentials: true });
    }

    getProductsByCategory(categoryId: string): Observable<any> {
        return this.http.get(`http://localhost:3004/product/category/${categoryId}`, { withCredentials: true });
    }

    postCreateProduct(name: string, description: string, price: number, categoryId: string, image: string, storeId: string, customFields: {[key: string]: string} = {}): Observable<any> {
        return this.http.post('http://localhost:3004/product/createProduct',
            {
                name: name,
                description: description,
                price: price,
                categoryId: categoryId,
                image: image,
                storeId: storeId,
                customFields
            }, { withCredentials: true }
        );
    }

    updateProduct(productId: string, productData: any): Observable<any> {
        return this.http.put(`http://localhost:3004/product/updateProduct/${productId}`, productData, { withCredentials: true });
    }

    deleteProduct(storeId: string): Observable<any> {
        return this.http.delete(`http://localhost:3004/product/deleteProduct/${storeId}`, { withCredentials: true });
    }
}
