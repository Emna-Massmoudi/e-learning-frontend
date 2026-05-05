import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cours, CoursRequest, EtatCours } from '../models/cours.model';

export interface UploadResponse {
  url: string;
  fileName: string;
  size: string;
}

@Injectable({ providedIn: 'root' })
export class CoursService {

  private readonly baseUrl = 'https://elearning-backend-1-lb7k.onrender.com/api/cours';

  constructor(private http: HttpClient) {}

  getAllCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.baseUrl);
  }

  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.baseUrl}/${id}`);
  }

  getCoursByFormateur(formateurId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/formateur/${formateurId}`);
  }

  getCoursByEtat(etat: EtatCours): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/etat/${etat}`);
  }

  getCoursEnAttente(): Observable<Cours[]> { return this.getCoursByEtat('EN_ATTENTE_VALIDATION'); }
  getCoursPublies():   Observable<Cours[]> { return this.getCoursByEtat('PUBLIE'); }

  createCours(request: CoursRequest): Observable<Cours> {
    return this.http.post<Cours>(this.baseUrl, request);
  }

  uploadPdf(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(
  'https://elearning-backend-1-lb7k.onrender.com/api/upload/pdf',
  formData
);
  }

  updateCours(id: number, request: CoursRequest): Observable<Cours> {
    return this.http.put<Cours>(`${this.baseUrl}/${id}`, request);
  }

  supprimerCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  validerCours(id: number):      Observable<Cours> { return this.updateEtat(id, 'EN_ATTENTE_VALIDATION'); }
  publierCours(id: number):      Observable<Cours> { return this.updateEtat(id, 'PUBLIE'); }
  retirerCours(id: number):      Observable<Cours> { return this.updateEtat(id, 'SUPPRIME'); }
  remettreEnAttente(id: number): Observable<Cours> { return this.updateEtat(id, 'EN_ATTENTE_VALIDATION'); }

  updateEtat(id: number, etat: EtatCours): Observable<Cours> {
    const params = new HttpParams().set('etat', etat);
    return this.http.patch<Cours>(`${this.baseUrl}/${id}/etat`, {}, { params });
  }
}
