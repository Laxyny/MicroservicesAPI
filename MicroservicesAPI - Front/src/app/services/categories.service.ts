import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiCategoriesService {
    constructor(private http: HttpClient) { }

    getAllCategories(): Observable<any> {
        return this.http.get('http://localhost:3000/category/listCategories', { withCredentials: true });
    }

    getProductCategories(productId: string): Observable<any> {
        return this.http.get(`http://localhost:3000/category/category/${productId}`, { withCredentials: true });
    }

    postCreateCategory(name: string): Observable<any> {
        return this.http.post('http://localhost:3000/category/createCategory',
            {
                name: name,
            }, { withCredentials: true }
        );
    }

    deleteCategory(categoryId: string): Observable<any> {
        return this.http.delete(`http://localhost:3000/category/deleteCategory/${categoryId}`, { withCredentials: true });
    }
}
