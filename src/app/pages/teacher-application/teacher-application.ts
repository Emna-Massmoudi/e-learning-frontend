import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormateurService } from '../../services/formateur';

@Component({
  selector: 'app-teacher-application',
  templateUrl: './teacher-application.html',
  styleUrl: './teacher-application.scss',
  standalone: false,
})
export class TeacherApplication {
  specialite = '';
  bio = '';
  portfolio = '';
  github = '';
  linkedin = '';
  motivation = '';

  cvFile: File | null = null;
  diplomeFile: File | null = null;
  certificatFile: File | null = null;
  attestationFile: File | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formateurService: FormateurService,
    private router: Router,
  ) {}

  onFileSelect(event: Event, type: string) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Seuls les fichiers PDF sont autorisés.';
      return;
    }

    if (type === 'cv') this.cvFile = file;
    if (type === 'diplome') this.diplomeFile = file;
    if (type === 'certificat') this.certificatFile = file;
    if (type === 'attestation') this.attestationFile = file;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const userId = Number(localStorage.getItem('userId'));

    if (!userId) {
      this.errorMessage = "Impossible de trouver l'identifiant du formateur connecté.";
      return;
    }

    const portfolioComplet = [this.portfolio.trim(), this.github.trim(), this.linkedin.trim()]
      .filter((value) => value)
      .join(' | ');

    const formData = new FormData();

    formData.append('specialite', this.specialite);
    formData.append('bio', this.bio);
    formData.append('portfolio', portfolioComplet);
    formData.append('motivation', this.motivation);

    if (this.cvFile) formData.append('cv', this.cvFile);
    if (this.diplomeFile) formData.append('diplome', this.diplomeFile);
    if (this.certificatFile) formData.append('certificat', this.certificatFile);
    if (this.attestationFile) formData.append('attestation', this.attestationFile);

    this.loading = true;

    this.formateurService.uploadCandidature(userId, formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/teacher-pending']);
        this.successMessage = 'Votre candidature a été envoyée avec succès.';

        setTimeout(() => {
          this.router.navigate(['/teacher-pending']);
        }, 1200);
      },
      error: (error) => {
        this.loading = false;
        console.error(error);

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = "Une erreur est survenue lors de l'envoi de la candidature.";
        }
      },
    });
  }
}
