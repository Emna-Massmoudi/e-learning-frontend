// cSpell:ignore ATTENTE VALIDATION BROUILLON SUPPRIME  formateur cours categorie

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService} from '../../services/cours';
import { Cours } from '../../models/cours.model';


@Component({
  selector: 'app-admin-cours-detail',
  standalone: true,
  templateUrl: './admin-cours-detail.html',
  styleUrls: ['./admin-cours-detail.scss'],
  imports: [CommonModule],
})
export class AdminCoursDetail implements OnInit {

  cours:        Cours | null = null;
  loading       = true;
  errorMessage  = '';
  actionLoading = false;
  successMessage = '';

  // Modal confirmation
  showConfirm:   boolean = false;
  pendingAction: 'publier' | 'supprimer' | '' = '';

  constructor(
    private readonly route:       ActivatedRoute,
    private readonly router:      Router,
    private readonly coursService: CoursService,
    private readonly cdr:          ChangeDetectorRef,
    private readonly sanitizer:    DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.chargerCours(id);
  }

  chargerCours(id: number): void {
    this.loading = true;
    this.coursService.getCoursById(id).subscribe({
      next: (data: Cours) => {
        this.cours   = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement du cours';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Actions ───────────────────────────────────────────

  confirmer(action: 'publier' | 'supprimer'): void {
    this.pendingAction = action;
    this.showConfirm   = true;
  }

  annuler(): void {
    this.showConfirm   = false;
    this.pendingAction = '';
  }

  executer(): void {
    if (!this.cours?.id || !this.pendingAction) return;
    this.actionLoading = true;
    const id = this.cours.id;

    let obs$: Observable<Cours | void>;

    switch (this.pendingAction) {
      case 'publier':   obs$ = this.coursService.publierCours(id);   break;
      case 'supprimer': obs$ = this.coursService.supprimerCours(id); break;
      default: return;
    }

    obs$.subscribe({
      next: () => {
        this.actionLoading = false;
        this.annuler();
        if (this.pendingAction === 'supprimer') {
          this.router.navigate(['/admin']);
        } else {
          // Recharger le cours pour voir le nouveau statut
          this.chargerCours(id);
          this.successMessage = `Action "${this.pendingAction}" effectuée avec succès !`;
          setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
        }
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage  = "Erreur lors de l'opération";
        this.actionLoading = false;
        this.annuler();
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  retour(): void {
    this.router.navigate(['/admin']);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      BROUILLON: 'brouillon', EN_ATTENTE_VALIDATION: 'attente', PUBLIE: 'publie', SUPPRIME: 'supprime'
    };
    return map[statut] ?? '';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      BROUILLON: '📝 Brouillon', EN_ATTENTE_VALIDATION: '⏳ En attente', PUBLIE: '🌍 Publié', SUPPRIME: '🚫 Supprimé'
    };
    return map[statut] ?? statut;
  }

  getIcon(categorieNom: string): string {
    const nom = (categorieNom ?? '').toLowerCase();
    if (nom.includes('informatique') || nom.includes('programmation') || nom.includes('développement')) return '💻';
    if (nom.includes('langue') || nom.includes('anglais')) return '🌐';
    if (nom.includes('science') || nom.includes('math')) return '🔬';
    if (nom.includes('design')) return '🎨';
    if (nom.includes('ia') || nom.includes('intelligence')) return '🤖';
    return '📚';
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getFileUrl(path: string): string {
    return `http://localhost:8081${path}`;
  }

  isYoutube(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  getYoutubeEmbed(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  imgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }
}