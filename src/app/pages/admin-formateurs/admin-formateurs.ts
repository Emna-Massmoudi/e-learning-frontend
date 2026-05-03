// cSpell:ignore formateur candidature

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormateurService } from '../../services/formateur';
import { AdminService } from '../../services/admin';
import { FormateurResponse } from '../../models/formateur.model';

@Component({
  selector: 'app-admin-formateurs',
  standalone: true,
  templateUrl: './admin-formateurs.html',
  styleUrls: ['./admin-formateurs.scss'],
  imports: [CommonModule, FormsModule],
})
export class AdminFormateurs implements OnInit {

  // ── Data ──────────────────────────────────────────────
  candidatures:   FormateurResponse[] = [];  // EN_ATTENTE
  tousFormateurs: FormateurResponse[] = [];  // tous
  loading         = false;
  errorMessage    = '';
  searchQuery     = '';

  // ── Onglets ───────────────────────────────────────────
  onglet: 'attente' | 'tous' = 'attente';

  // ── Modal Bloquer ─────────────────────────────────────
  showConfirmBloquer     = false;
  confirmBloquerTarget:  FormateurResponse | null = null;
  confirmBloquerLoading  = false;

  // ── Modal Débloquer ───────────────────────────────────
  showConfirmDebloquer    = false;
  confirmDebloquerTarget: FormateurResponse | null = null;
  confirmDebloquerLoading = false;

  private readonly baseUrl = 'http://localhost:8081/api';

  constructor(
    private readonly formateurService: FormateurService,
    private readonly adminService:     AdminService,
    private readonly http:             HttpClient,
    private readonly cdr:              ChangeDetectorRef
  ) {}

  private headers() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  ngOnInit(): void {
    this.chargerCandidatures();
    this.chargerTousFormateurs();
  }

  // ── Chargement ────────────────────────────────────────

  chargerCandidatures(): void {
    this.loading = true;
    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data) => { this.candidatures = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  chargerTousFormateurs(): void {
    this.http.get<FormateurResponse[]>(`${this.baseUrl}/formateurs`, { headers: this.headers() }).subscribe({
      next: (data) => { this.tousFormateurs = Array.isArray(data) ? data : []; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  // ── Filtrage ──────────────────────────────────────────

  filteredTous(): FormateurResponse[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.tousFormateurs.filter(f =>
      !q || (f.nom ?? '').toLowerCase().includes(q) || (f.email ?? '').toLowerCase().includes(q)
    );
  }

  // ── Stats ─────────────────────────────────────────────

  get activeCount(): number  { return this.tousFormateurs.filter(f => (f.status ?? '').toLowerCase() === 'active').length; }
  get bloqueCount(): number  { return this.tousFormateurs.filter(f => (f.status ?? '').toLowerCase() === 'bloque').length; }
  get refuseCount(): number  { return this.tousFormateurs.filter(f => (f.status ?? '').toLowerCase() === 'refuse').length; }

  // ── Accepter / Refuser (candidatures) ────────────────

  accepter(id: number): void {
    this.formateurService.accepterFormateur(id).subscribe({
      next: () => { this.chargerCandidatures(); this.chargerTousFormateurs(); },
      error: (err) => { console.error(err); this.errorMessage = "Erreur lors de l'acceptation"; this.cdr.detectChanges(); }
    });
  }

  refuser(id: number): void {
    const raison = prompt('Raison du refus :') || 'Refus';
    this.formateurService.refuserFormateur(id, { commentaireAdmin: raison }).subscribe({
      next: () => { this.chargerCandidatures(); this.chargerTousFormateurs(); },
      error: (err) => { console.error(err); this.errorMessage = "Erreur lors du refus"; this.cdr.detectChanges(); }
    });
  }

  // ── Bloquer ───────────────────────────────────────────

  ouvrirBloquer(f: FormateurResponse): void {
    this.confirmBloquerTarget = f;
    this.showConfirmBloquer   = true;
  }

  fermerBloquer(): void {
    this.showConfirmBloquer   = false;
    this.confirmBloquerTarget = null;
  }

  executerBloquer(): void {
    if (!this.confirmBloquerTarget) return;
    this.confirmBloquerLoading = true;
    this.adminService.bloquerFormateur(this.confirmBloquerTarget.id).subscribe({
      next: () => {
        this.confirmBloquerLoading = false;
        this.fermerBloquer();
        this.chargerCandidatures();
        this.chargerTousFormateurs();
        this.cdr.detectChanges();
      },
      error: (err) => { console.error(err); this.confirmBloquerLoading = false; this.fermerBloquer(); this.cdr.detectChanges(); }
    });
  }

  // ── Débloquer ─────────────────────────────────────────

  ouvrirDebloquer(f: FormateurResponse): void {
    this.confirmDebloquerTarget = f;
    this.showConfirmDebloquer   = true;
  }

  fermerDebloquer(): void {
    this.showConfirmDebloquer   = false;
    this.confirmDebloquerTarget = null;
  }

  executerDebloquer(): void {
    if (!this.confirmDebloquerTarget) return;
    this.confirmDebloquerLoading = true;
    this.adminService.debloquerFormateur(this.confirmDebloquerTarget.id).subscribe({
      next: () => {
        this.confirmDebloquerLoading = false;
        this.fermerDebloquer();
        this.chargerTousFormateurs();
        this.cdr.detectChanges();
      },
      error: (err) => { console.error(err); this.confirmDebloquerLoading = false; this.fermerDebloquer(); this.cdr.detectChanges(); }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  estBloque(f: FormateurResponse): boolean {
    return (f.status ?? '').toLowerCase() === 'bloque';
  }

  getStatusClass(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'active') return 'actif';
    if (s === 'bloque') return 'bloque';
    if (s === 'refuse') return 'refuse';
    if (s === 'en_attente') return 'attente';
    return 'pending';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: '✅ Actif', BLOQUE: '🚫 Bloqué',
      REFUSE: '❌ Refusé', EN_ATTENTE: '⏳ En attente'
    };
    return map[status?.toUpperCase()] ?? status;
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '#';
    return `http://localhost:8081${path}`;
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get withDocsCount(): number {
    return this.candidatures.filter(f => f.cvUrl || f.diplomeUrl || f.certificatUrl || f.attestationUrl).length;
  }
}