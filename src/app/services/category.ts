import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categorie } from '../models/Categorie.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'https://elearning-backend-0fmz.onrender.com/api/categories';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // === CATEGORIES ===
  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl, this.getHeaders());
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  create(cat: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, cat, this.getHeaders());
  }

  update(id: number, cat: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, cat, this.getHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}