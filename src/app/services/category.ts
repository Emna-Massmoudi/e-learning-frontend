import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categorie } from '../models/Categorie.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

 private apiUrl = 'https://elearning-backend-1-lb7k.onrender.com/api/categories';

  constructor(private http: HttpClient) {}

  // === CATEGORIES ===
  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  create(cat: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, cat);
  }

  update(id: number, cat: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, cat);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}