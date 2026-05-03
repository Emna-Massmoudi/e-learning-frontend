import { HttpInterceptorFn } from '@angular/common/http';

/**
 * 🔐 Intercepteur d'authentification
 *
 * Rôle :
 * On utilise ce code pour envoyer le token de l’utilisateur connecté avec chaque requête,
 *  afin que le backend puisse identifier l’utilisateur et vérifier ses permissions (rôles et privilèges).
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 🔑 Récupération du token depuis le localStorage
  const token = localStorage.getItem('token');

  console.log("Interceptor ok, token:", token);

  // ✅ Si le token existe → ajouter Authorization header
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    // 🔁 Envoi de la requête modifiée
    return next(cloned);
  }

  // ❌ Sinon → envoi de la requête originale
  return next(req);
};