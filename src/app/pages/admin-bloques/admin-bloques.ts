// cSpell:ignore bloques formateur etudiant debloquer

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface UserBloque {
  id:     number;
  nom:    string;
  email:  string;
  status: string;
}

@Component({
  selector: 'app-admin-bloques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bloques.html',
  styleUrl: './admin-bloques.scss',
})
export class AdminBloques implements OnInit {

  // ── Onglets ───────────────────────────────────────────
  onglet: 'etudiants' | 'formateurs' = 'etudiants';

  // ── Data ──────────────────────────────────────────────
  etudiantsBloques:  UserBloque[] = [];
  formateursBloques: UserBloque[] = [];
  loading   = false;
  errorMsg  = '';
  searchQuery = '';

  // ── Confirm modal ─────────────────────────────────────
  showConfirm   = false;
  confirmTarget: UserBloque | null = null;
  confirmAction: 'debloquer' | '' = '';
  confirmLoading = false;

  private readonly base = 'http://localhost:8081/api/admin';

  constructor(
    private readonly http: HttpClient,
    private readonly cdr:  ChangeDetectorRef
  ) {}

  private headers() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit(): void {
    this.chargerTout();
  }

  chargerTout(): void {
    this.loading = true;
    this.errorMsg = '';
    let done = 0;

    this.http.get<UserBloque[]>(`${this.base}/etudiants/bloques`, { headers: this.headers() }).subscribe({
      next: data => { this.etudiantsBloques = data; done++; if (done === 2) { this.loading = false; this.cdr.detectChanges(); } },
      error: () => { done++; if (done === 2) { this.loading = false; this.cdr.detectChanges(); } }
    });

    this.http.get<UserBloque[]>(`${this.base}/formateurs/bloques`, { headers: this.headers() }).subscribe({
      next: data => { this.formateursBloques = data; done++; if (done === 2) { this.loading = false; this.cdr.detectChanges(); } },
      error: () => { done++; if (done === 2) { this.loading = false; this.cdr.detectChanges(); } }
    });
  }

  // ── Filtrage ──────────────────────────────────────────

  filteredEtudiants(): UserBloque[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.etudiantsBloques.filter(u =>
      !q || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  filteredFormateurs(): UserBloque[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.formateursBloques.filter(u =>
      !q || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  // ── Actions ───────────────────────────────────────────

  ouvrirConfirm(user: UserBloque): void {
    this.confirmTarget = user;
    this.confirmAction = 'debloquer';
    this.showConfirm   = true;
  }

  fermerConfirm(): void {
    this.showConfirm   = false;
    this.confirmTarget = null;
    this.confirmAction = '';
  }

  executer(): void {
    if (!this.confirmTarget) return;
    this.confirmLoading = true;
    const id   = this.confirmTarget.id;
    const type = this.onglet === 'etudiants' ? 'etudiants' : 'formateurs';
    const url  = `${this.base}/${type}/${id}/debloquer`;

    this.http.patch<UserBloque>(url, {}, { headers: this.headers() }).subscribe({
      next: (updated) => {
        if (this.onglet === 'etudiants') {
          this.etudiantsBloques = this.etudiantsBloques.filter(u => u.id !== id);
        } else {
          this.formateursBloques = this.formateursBloques.filter(u => u.id !== id);
        }
        this.confirmLoading = false;
        this.fermerConfirm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.confirmLoading = false;
        this.fermerConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}