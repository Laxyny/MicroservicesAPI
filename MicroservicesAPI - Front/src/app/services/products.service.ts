import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiProductsService {
    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<any> {
        return this.http.get('http://localhost:3000/product/listProducts', { withCredentials: true });
    }

    getMyProduct(): Observable<any> {
        return this.http.get('http://localhost:3000/product/products', { withCredentials: true });
    }

    postCreateStore(name: string, description: string, logo: string, site: string): Observable<any> {
        return this.http.post(
            'http://localhost:3000/product/createProduct',
            {
                name: name,
                description: description,
                logo: logo,
                site: site
            }, { withCredentials: true }
        );
    }
    deleteProduct(storeId: string): Observable<any> {
        return this.http.delete(`http://localhost:3000/product/deleteProduct/${storeId}`, { withCredentials: true });
    }
}
