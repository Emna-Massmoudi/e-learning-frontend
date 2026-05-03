import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  standalone: false,
})
export class Register {
  nom = '';
  email = '';
  motDePasse = '';
  role = 'ETUDIANT';
  portfolio = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onRegister() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: RegisterRequest = {
      nom: this.nom,
      email: this.email,
      motDePasse: this.motDePasse,
      role: this.role,
      portfolio: this.role === 'FORMATEUR' ? this.portfolio : '',
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.loading = false;

        localStorage.setItem('userId', response.id.toString());
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('email', response.email);
        localStorage.setItem('nom', response.nom);

        this.successMessage = 'Inscription réussie';

        setTimeout(() => {
          if (response.role === 'FORMATEUR') {
            this.router.navigate(['/teacher-application']);
          } else {
            this.router.navigate(['/student']);
          }
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur register :', error);

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = "Erreur lors de l'inscription.";
        }
      },
    });
  }
}
