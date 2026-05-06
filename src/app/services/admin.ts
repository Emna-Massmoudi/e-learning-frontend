import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormateurResponse } from '../models/formateur.model';
import { EtudiantResponse } from '../models/etudiant.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private apiUrl = 'https://elearning-backend-0fmz.onrender.com/api/admin';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  // ── Étudiants ──────────────────────────────────────

  getEtudiants(): Observable<EtudiantResponse[]> {
    return this.http.get<EtudiantResponse[]>(
      `${this.apiUrl}/etudiants`,
      { headers: this.getAuthHeaders() }
    );
  }

  getEtudiantsBloques(): Observable<EtudiantResponse[]> {
    return this.http.get<EtudiantResponse[]>(
      `${this.apiUrl}/etudiants/bloques`,
      { headers: this.getAuthHeaders() }
    );
  }

  bloquerEtudiant(id: number): Observable<EtudiantResponse> {
    return this.http.patch<EtudiantResponse>(
      `${this.apiUrl}/etudiants/${id}/bloquer`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  debloquerEtudiant(id: number): Observable<EtudiantResponse> {
    return this.http.patch<EtudiantResponse>(
      `${this.apiUrl}/etudiants/${id}/debloquer`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ── Formateurs ─────────────────────────────────────

  getFormateursBloques(): Observable<FormateurResponse[]> {
    return this.http.get<FormateurResponse[]>(
      `${this.apiUrl}/formateurs/bloques`,
      { headers: this.getAuthHeaders() }
    );
  }

  bloquerFormateur(id: number): Observable<FormateurResponse> {
    return this.http.patch<FormateurResponse>(
      `${this.apiUrl}/formateurs/${id}/bloquer`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  debloquerFormateur(id: number): Observable<FormateurResponse> {
    return this.http.patch<FormateurResponse>(
      `${this.apiUrl}/formateurs/${id}/debloquer`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}