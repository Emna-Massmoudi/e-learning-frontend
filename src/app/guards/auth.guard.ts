import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

type Role = 'ADMIN' | 'ETUDIANT' | 'FORMATEUR';

interface JwtPayload {
  exp?: number;
}
//pour  decoder le token et vérifier son expiration
function getTokenPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4,
      '='
    );
    return JSON.parse(atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
}

function redirectToLogin(router: Router, url: string): UrlTree {
  localStorage.clear();
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
}

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    return redirectToLogin(router, state.url);
  }

  return true;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') as Role | null;
  const allowedRoles = route.data['roles'] as Role[] | undefined;

  if (!token || isTokenExpired(token)) {
    return redirectToLogin(router, state.url);
  }

  if (!allowedRoles?.length || !role || !allowedRoles.includes(role)) {
    return router.createUrlTree(['/']);
  }

  if (
    role === 'FORMATEUR'
    && localStorage.getItem('status') !== 'ACTIVE'
    && state.url !== '/teacher-pending'
    && state.url !== '/teacher-application'
  ) {
    return router.createUrlTree(['/teacher-pending']);
  }

  return true;
};
