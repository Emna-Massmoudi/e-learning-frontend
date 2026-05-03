// cSpell:ignore etudiant inscription

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InscriptionRequest, InscriptionResponse,StatutInscription } from '../models/inscription.model';

@Injectable({ providedIn: 'root' })
export class InscriptionService {

  private readonly baseUrl = 'http://localhost:8081/api/inscriptions';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  /** POST /api/inscriptions — s'inscrire à un cours */
  inscrire(request: InscriptionRequest): Observable<InscriptionResponse> {
    return this.http.post<InscriptionResponse>(this.baseUrl, request, {
      headers: this.getAuthHeaders()
    });
  }

  /** GET /api/inscriptions/etudiant/:id — mes inscriptions */
  getByEtudiant(etudiantId: number): Observable<InscriptionResponse[]> {
    return this.http.get<InscriptionResponse[]>(
      `${this.baseUrl}/etudiant/${etudiantId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** GET /api/inscriptions/cours/:id — inscriptions d'un cours (formateur) */
  getByCours(coursId: number): Observable<InscriptionResponse[]> {
    return this.http.get<InscriptionResponse[]>(
      `${this.baseUrl}/cours/${coursId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getByFormateur(formateurId: number): Observable<InscriptionResponse[]> {
    return this.http.get<InscriptionResponse[]>(
      `${this.baseUrl}/formateur/${formateurId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** PATCH /api/inscriptions/:id/statut?statut=XXX — accepter/refuser */
  updateStatut(id: number, statut: StatutInscription): Observable<InscriptionResponse> {
    return this.http.patch<InscriptionResponse>(
      `${this.baseUrl}/${id}/statut?statut=${statut}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /** PATCH /api/inscriptions/:id/annuler — annuler une inscription */
  annuler(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${id}/annuler`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}
