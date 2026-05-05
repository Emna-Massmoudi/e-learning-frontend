import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'https://elearning-backend-1-lb7k.onrender.com/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * 🔐 LOGIN
   * - Appelle l’API
   * - Stocke le token + infos utilisateur
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(

      tap((response: AuthResponse) => {

        // 🔑 Token JWT
        localStorage.setItem('token', response.token);

        // 👤 Infos utilisateur (optionnel mais utile)
        localStorage.setItem('nom', response.nom);
        localStorage.setItem('email', response.email);
        localStorage.setItem('userId', response.id.toString());

      })
    );
  }

  /**
   * 📝 REGISTER
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * 🚪 LOGOUT
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  }

  /**
   * 🔍 Vérifier si connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * 🔑 Récupérer le token (pour interceptor si besoin)
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}