import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormateurResponse } from '../models/formateur.model';



@Injectable({
  providedIn: 'root',
})
export class FormateurService {
  private apiUrl = 'https://elearning-backend-0fmz.onrender.com/api/formateurs';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  uploadCandidature(id: number, formData: FormData): Observable<FormateurResponse> {
    return this.http.put<FormateurResponse>(`${this.apiUrl}/${id}/candidature`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  getFormateursEnAttente(): Observable<FormateurResponse[]> {
    return this.http.get<FormateurResponse[]>(`${this.apiUrl}/en-attente`, {
      headers: this.getAuthHeaders(),
    });
  }

  getFormateurById(id: number): Observable<FormateurResponse> {
    return this.http.get<FormateurResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  accepterFormateur(id: number): Observable<FormateurResponse> {
    return this.http.patch<FormateurResponse>(
      `${this.apiUrl}/${id}/accepter`,
      {},
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  refuserFormateur(id: number, data: { commentaireAdmin: string }): Observable<FormateurResponse> {
    return this.http.patch<FormateurResponse>(`${this.apiUrl}/${id}/refuser`, data, {
      headers: this.getAuthHeaders(),
    });
  }
}
