import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

/**
 * 🔐 Intercepteur d'authentification
 *
 * 🎯 Rôle :
 * - Ajouter automatiquement le token JWT dans chaque requête HTTP
 * - Gérer les erreurs (ex: token expiré)
 * - Rediriger l'utilisateur vers login si nécessaire
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 🔑 Récupération du token depuis le localStorage
  const token = localStorage.getItem('token');

  // 🚀 Injection du Router (nécessaire dans un interceptor fonctionnel)
  const router = inject(Router);

  // 🧾 Par défaut, on garde la requête originale
  let clonedRequest = req;

  // ✅ Si le token existe → on ajoute Authorization header
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // format standard JWT
      }
    });
  }

  // 🔁 Envoi de la requête (modifiée ou non)
  return next(clonedRequest).pipe(

    // ⚠️ Intercepter les erreurs HTTP
    catchError((error: HttpErrorResponse) => {

      // ❌ Cas : token expiré ou invalide
      if (error.status === 401) {

        console.warn("🔒 Token expiré ou invalide");

        // 🧹 Supprimer uniquement le token (éviter clear() global)
        localStorage.removeItem('token');

        // 🔄 Rediriger vers la page de connexion
        router.navigate(['/login']);
      }

      // 🔁 Propager l'erreur pour ne pas bloquer l'application
      throw error;
    })
  );
};