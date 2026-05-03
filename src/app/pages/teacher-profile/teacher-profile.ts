// cSpell:ignore formateur profil

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormateurService } from '../../services/formateur';
import { FormateurResponse } from '../../models/formateur.model';
@Component({
  selector: 'app-teacher-profile',
  standalone: false,
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.scss',
})
export class TeacherProfile implements OnInit {

  // ── State ─────────────────────────────────────────────
  profil:       FormateurResponse | null = null;
  loading       = true;
  errorMessage  = '';
  successMessage = '';

  // ── Edition ───────────────────────────────────────────
  editMode      = false;
  saveLoading   = false;
  editNom       = '';
  editSpecialite = '';
  editBio       = '';
  editPortfolio  = '';

  // ── Infos localStorage ────────────────────────────────
  nomFormateur    = localStorage.getItem('nom')   ?? 'Formateur';
  emailFormateur  = localStorage.getItem('email') ?? '';
  formateurId     = Number(localStorage.getItem('userId'));

  constructor(
    private readonly formateurService: FormateurService,
    private readonly router:           Router,
    private readonly cdr:              ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerProfil();
  }

  // ── Chargement ────────────────────────────────────────

  chargerProfil(): void {
    this.loading = true;
    this.formateurService.getFormateurById(this.formateurId).subscribe({
      next: (data: FormateurResponse) => {
        this.profil  = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement profil:', err);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Edition ───────────────────────────────────────────

  ouvrirEdition(): void {
    if (!this.profil) return;
    this.editNom        = this.profil.nom;
    this.editSpecialite = this.profil.specialite ?? '';
    this.editBio        = this.profil.bio ?? '';
    this.editPortfolio  = this.profil.portfolio ?? '';
    this.editMode       = true;
    this.successMessage = '';
    this.errorMessage   = '';
  }

  fermerEdition(): void {
    this.editMode = false;
  }

  sauvegarderProfil(): void {
    // TODO: ajouter endpoint PUT /api/formateurs/{id}/profil quand disponible
    // Pour l'instant on met à jour le localStorage
    localStorage.setItem('nom', this.editNom);
    this.nomFormateur = this.editNom;

    if (this.profil) {
      this.profil.nom        = this.editNom;
      this.profil.specialite = this.editSpecialite;
      this.profil.bio        = this.editBio;
      this.profil.portfolio  = this.editPortfolio;
    }

    this.successMessage = 'Profil mis à jour avec succès !';
    this.editMode       = false;
    this.cdr.detectChanges();

    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
  }

  // ── Helpers ───────────────────────────────────────────

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatutLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': '⏳ En attente de validation',
      'ACTIVE':     '✅ Compte actif',
      'REFUSE':     '❌ Candidature refusée',
      'BLOQUE':     '🚫 Compte bloqué',
    };
    return labels[status] ?? status;
  }

  getStatutClass(status: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'attente',
      'ACTIVE':     'actif',
      'REFUSE':     'refuse',
      'BLOQUE':     'bloque',
    };
    return classes[status] ?? '';
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '#';
    return `http://localhost:8081${path}`;
  }

  retourDashboard(): void {
    this.router.navigate(['/teacher']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}