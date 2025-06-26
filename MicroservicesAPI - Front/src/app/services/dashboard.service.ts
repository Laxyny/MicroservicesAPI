import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiDashboardService {
    constructor(private http: HttpClient) { }

    //Catégories
    getAllCategories(): Observable<any> {
        return this.http.get('http://ms_dashboard:3001/dashboard/categories', { withCredentials: true });
    }

    getCategory(categoryId: string): Observable<any> {
        return this.http.get(`http://ms_dashboard:3001/dashboard/category/${categoryId}`, { withCredentials: true });
    }

    getProductCategories(productId: string): Observable<any> {
        return this.http.get(`http://ms_dashboard:3001/dashboard/product/categories/${productId}`, { withCredentials: true });
    }

    deleteCategory(categoryId: string): Observable<any> {
        return this.http.delete(`http://ms_dashboard:3001/dashboard/category/${categoryId}`, { withCredentials: true });
    }

    updateCategory(categoryId: string): Observable<any> {
        return this.http.put(`http://ms_dashboard:3001/dashboard/category/${categoryId}`, { withCredentials: true });
    }

    //Produits
    getAllProducts(): Observable<any> {
        return this.http.get('http://ms_dashboard:3001/dashboard/products', { withCredentials: true });
    }

    getProduct(productId :string): Observable<any>{
        return this.http.get('http://ms_dashboard:3001/dashboard/product/${productId}', { withCredentials: true });
    }

    getStoreProducts(storeId :string): Observable<any>{
        return this.http.get(`http://ms_dashboard:3001/dashboard/store/${storeId}/products`, { withCredentials: true });
    }

    deleteProduct(productId :string): Observable<any>{
        return this.http.delete(`http://ms_dashboard:3001/dashboard/product/${productId}`, { withCredentials: true }); 
    }

    updateProduct(productId :string): Observable<any>{
        return this.http.put(`http://ms_dashboard:3001/dashboard/product/${productId}`, { withCredentials: true });
    }

    //Boutiques
    getAllStores(): Observable<any>{
        return this.http.get('http://ms_dashboard:3001/dashboard/stores', { withCredentials: true });
    }

    getStore(storeId :string): Observable<any>{
        return this.http.get(`http://ms_dashboard:3001/dashboard/store/${storeId}`, { withCredentials: true });
    }

    updateStore(storeId :string): Observable<any>{
        return this.http.put(`http://ms_dashboard:3001/dashboard/store/${storeId}`, { withCredentials: true });
    }

    deleteStore(storeId :string): Observable<any>{
        return this.http.delete(`http://ms_dashboard:3001/dashboard/store/${storeId}`, { withCredentials: true });
    }
}
