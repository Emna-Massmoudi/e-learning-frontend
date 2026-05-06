import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SousCategorie } from '../models/sous-categorie.model';

@Injectable({
  providedIn: 'root'
})
export class SousCategorieService {

  private apiUrl = 'https://elearning-backend-0fmz.onrender.com/api/sous-categories';

  constructor(private http: HttpClient) {}

  getByCategorieId(categorieId: number): Observable<SousCategorie[]> {
    return this.http.get<SousCategorie[]>(`${this.apiUrl}/categorie/${categorieId}`);
  }

  create(sousCat: SousCategorie): Observable<SousCategorie> {
    return this.http.post<SousCategorie>(this.apiUrl, sousCat);
  }

  update(id: number, sousCat: SousCategorie): Observable<SousCategorie> {
    return this.http.put<SousCategorie>(`${this.apiUrl}/${id}`, sousCat);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}