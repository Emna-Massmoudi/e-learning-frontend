import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: false,
})
export class Login {
  email: string = '';
  motDePasse: string = '';
  rememberMe: boolean = false;

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const payload: LoginRequest = {
      email: this.email,
      motDePasse: this.motDePasse,
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;

        localStorage.setItem('userId', response.id.toString());
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        localStorage.setItem('nom', response.nom);
        localStorage.setItem('status', response.status);

        this.successMessage = 'Connexion réussie';

        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'ETUDIANT') {
          this.router.navigate(['/student']);
        } else if (response.role === 'FORMATEUR') {
          if (response.status === 'EN_ATTENTE') {
            this.router.navigate(['/teacher-pending']);
          } else if (response.status === 'ACTIVE') {
            this.router.navigate(['/teacher']);
          } else if (response.status === 'REFUSE') {
            this.router.navigate(['/teacher-pending']);
          } else {
            this.router.navigate(['/teacher-pending']);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur login :', error);

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        }
      },
    });
  }
}
