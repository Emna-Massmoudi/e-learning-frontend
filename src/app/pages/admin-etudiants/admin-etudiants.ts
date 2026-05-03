// cSpell:ignore etudiant

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { EtudiantResponse } from '../../models/etudiant.model';

@Component({
  selector: 'app-admin-etudiants',
  standalone: true,
  templateUrl: './admin-etudiants.html',
  styleUrls: ['./admin-etudiants.scss'],
  imports: [CommonModule, FormsModule],
})
export class AdminEtudiants implements OnInit {

  etudiants:   EtudiantResponse[] = [];
  loading      = false;
  errorMessage = '';
  searchQuery  = '';

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerEtudiants();
  }

  chargerEtudiants(): void {
    this.loading      = true;
    this.errorMessage = '';
    this.adminService.getEtudiants().subscribe({
      next: (data: EtudiantResponse[]) => {
        this.etudiants = Array.isArray(data) ? data : [];
        this.loading   = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement étudiants:', err);
        this.errorMessage = 'Erreur lors du chargement des étudiants';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  filteredEtudiants(): EtudiantResponse[] {
    if (!this.searchQuery.trim()) return this.etudiants;
    const q = this.searchQuery.toLowerCase().trim();
    return this.etudiants.filter(e =>
      (e.nom   ?? '').toLowerCase().includes(q) ||
      (e.email ?? '').toLowerCase().includes(q)
    );
  }

  get actifCount(): number {
    return this.etudiants.filter(e => {
      const s = (e.status ?? '').toLowerCase();
      return s === 'actif' || s === 'active';
    }).length;
  }

  get bloqueCount(): number {
    return this.etudiants.filter(e => {
      const s = (e.status ?? '').toLowerCase();
      return s === 'bloque' || s === 'blocked';
    }).length;
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Bloquer / Débloquer ───────────────────────────
  showConfirm    = false;
  confirmTarget: EtudiantResponse | null = null;
  confirmAction: 'bloquer' | 'debloquer' | '' = '';
  confirmLoading = false;

  ouvrirConfirm(e: EtudiantResponse, action: 'bloquer' | 'debloquer'): void {
    this.confirmTarget = e;
    this.confirmAction = action;
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
    const obs$ = this.confirmAction === 'bloquer'
      ? this.adminService.bloquerEtudiant(this.confirmTarget.id)
      : this.adminService.debloquerEtudiant(this.confirmTarget.id);

    obs$.subscribe({
      next: (updated: EtudiantResponse) => {
        this.etudiants = this.etudiants.map(e => e.id === updated.id ? updated : e);
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

  estBloque(e: EtudiantResponse): boolean {
    return (e.status ?? '').toLowerCase().includes('bloque') ||
           (e.status ?? '').toLowerCase().includes('blocked');
  }

  getStatusClass(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'actif' || s === 'active') return 'actif';
    if (s === 'bloque' || s === 'blocked') return 'bloque';
    return 'pending';
  }
}