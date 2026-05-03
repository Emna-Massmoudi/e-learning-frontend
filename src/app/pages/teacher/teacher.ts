import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursService } from '../../services/cours';
import { InscriptionService} from '../../services/inscription';
import { CategoryService } from '../../services/category';
import {SousCategorieService} from '../../services/sous-categorie';
import { Cours , CoursRequest, EtatCours} from '../../models/cours.model';
import { InscriptionResponse } from '../../models/inscription.model';
import { Categorie } from '../../models/Categorie.model';
import { SousCategorie } from '../../models/sous-categorie.model';


@Component({
  selector: 'app-teacher',
  standalone: false,
  templateUrl: './teacher.html',
  styleUrl: './teacher.scss',
})
export class Teacher implements OnInit {

  // ── Navigation ───────────────────────────────────────
  activeSection: 'formations' | 'etudiants' | 'quiz' = 'formations';

  // ── Inscriptions ──────────────────────────────────────
  inscriptions:      InscriptionResponse[] = [];
  inscLoading        = false;
  inscFilter: string = '';
  inscActionLoading  = false;

  // ── Profil ───────────────────────────────────────────
  nomFormateur  = localStorage.getItem('nom')   ?? 'Formateur';
  emailFormateur = localStorage.getItem('email') ?? '';
  initialesFormateur = this.getInitialesFromNom(localStorage.getItem('nom') ?? '');

  // ── PDF ──────────────────────────────────────────────
  pdfUploading  = false;
  pdfNomFichier = '';

  // ── State ─────────────────────────────────────────────
  mesCours:     Cours[]     = [];
  categories:   Categorie[] = [];
  sousCategories: SousCategorie[] = [];
  loading       = false;
  errorMessage  = '';

  // Filtres
  searchQuery   = '';
  filterStatut  = '';
  viewMode: 'grid' | 'list' = 'grid';

  // ── Modal Ajout ───────────────────────────────────────
  showAddForm  = false;
  addLoading   = false;
  addError     = '';
  newCours: CoursRequest = {
    titre: '', description: '', formateurId: Number(localStorage.getItem('userId')),
    categorieId: 0, sousCategorieId: 0, duree: '', niveau: 'debutant',
    videoUrl: '', imageUrl: '',
  };

  // ── Modal Modification ────────────────────────────────
  showEditForm  = false;
  editLoading   = false;
  editError     = '';
  editCours: CoursRequest = {
    titre: '', description: '', formateurId: Number(localStorage.getItem('userId')),
    categorieId: 0, sousCategorieId: 0, duree: '', niveau: 'debutant',
    videoUrl: '', imageUrl: '',
  };
  itemToEdit: Cours | null = null;

  // ── Modal Suppression ─────────────────────────────────
  showDeleteConfirm = false;
  itemToDelete: Cours | null = null;
  deleteLoading = false;

  constructor(
    private readonly coursService:    CoursService,
    private readonly inscriptionService: InscriptionService,
    private readonly categoryService: CategoryService,
    private readonly sousCategorieService: SousCategorieService,
    private readonly router:          Router,
    private readonly cdr:             ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerMesCours();
    this.chargerCategories();
  }

  // ── Chargement ────────────────────────────────────────

  chargerMesCours(): void {
    this.loading      = true;
    this.errorMessage = '';
    const formateurId = Number(localStorage.getItem('userId'));

    this.coursService.getCoursByFormateur(formateurId).subscribe({
      next: (data: Cours[]) => {
        this.mesCours = data;
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement cours:', err);
        this.errorMessage = 'Erreur lors du chargement de vos cours';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: Categorie[]) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erreur catégories:', err)
    });
  }

  chargerSousCategories(categorieId: number): void {
    this.sousCategories = [];
    if (!categorieId) return;
    this.sousCategorieService.getByCategorieId(categorieId).subscribe({
      next: (data: SousCategorie[]) => {
        this.sousCategories = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erreur sous-catégories:', err)
    });
  }

  // ── Filtrage ──────────────────────────────────────────

  filteredCours(): Cours[] {
    return this.mesCours.filter((c: Cours) => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = !q
        || c.titre.toLowerCase().includes(q)
        || (c.categorieNom ?? '').toLowerCase().includes(q);
      const matchStatut = !this.filterStatut
        || c.etatPublication === (this.filterStatut as EtatCours);
      return matchSearch && matchStatut;
    });
  }

  // ── Stats ─────────────────────────────────────────────

  getCountByStatut(etat: EtatCours): number {
    return this.mesCours.filter((c: Cours) => c.etatPublication === etat).length;
  }

  // ── AJOUT ─────────────────────────────────────────────

  openAddForm(): void {
    this.newCours = {
      titre: '', description: '', formateurId: Number(localStorage.getItem('userId')),
      categorieId: 0, sousCategorieId: 0, duree: '', niveau: 'debutant',
      videoUrl: '', imageUrl: '', pdfUrl: '',
    };
    this.sousCategories = [];
    this.addError       = '';
    this.showAddForm    = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.addError    = '';
  }

  onCategorieChangeAdd(): void {
    this.newCours.sousCategorieId = 0;
    this.chargerSousCategories(this.newCours.categorieId);
  }

  soumettreCours(): void {
    if (!this.newCours.titre.trim()) { this.addError = 'Le titre est obligatoire.'; return; }
    if (!this.newCours.categorieId)  { this.addError = 'Choisissez une catégorie.'; return; }
    if (!this.newCours.sousCategorieId) { this.addError = 'Choisissez une sous-catégorie.'; return; }
    if (!this.newCours.description.trim()) { this.addError = 'La description est obligatoire.'; return; }

    this.addLoading = true;
    this.addError   = '';

    this.coursService.createCours(this.newCours).subscribe({
      next: (created: Cours) => {
        this.mesCours   = [created, ...this.mesCours];
        this.addLoading = false;
        this.closeAddForm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur création:', err);
        this.addError   = 'Erreur lors de la création du cours.';
        this.addLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── MODIFICATION ──────────────────────────────────────

  openEditForm(item: Cours): void {
    this.itemToEdit = item;

    // Récupérer categorieId depuis l'item ou depuis la liste des catégories
    const categorieId = item.categorieId
      || this.categories.find(cat =>
          cat.nom?.toLowerCase() === (item.categorieNom ?? '').toLowerCase()
        )?.id
      || 0;

    this.editCours = {
      titre:           item.titre           ?? '',
      description:     item.description     ?? '',
      formateurId:     item.formateurId     ?? Number(localStorage.getItem('userId')),
      categorieId:     categorieId,
      sousCategorieId: item.sousCategorieId ?? 0,
      duree:           item.duree           ?? '',
      niveau:          item.niveau          ?? 'debutant',
      videoUrl:        item.videoUrl        ?? '',
      imageUrl:        item.imageUrl        ?? '',
      pdfUrl:          item.pdfUrl          ?? '',
    };

    // Mettre à jour pdfNomFichier si PDF existant
    this.pdfNomFichier = item.pdfUrl ? item.pdfUrl.split('/').pop() ?? 'Document existant' : '';

    this.editError = '';
    // Charger les sous-catégories pour la catégorie sélectionnée
    if (categorieId) {
      this.chargerSousCategories(categorieId);
    }
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.itemToEdit   = null;
    this.editError    = '';
  }

  onCategorieChangeEdit(): void {
    this.editCours.sousCategorieId = 0;
    this.chargerSousCategories(this.editCours.categorieId);
  }

  mettreAJourCours(): void {
    if (!this.itemToEdit?.id) return;
    if (!this.editCours.titre.trim()) { this.editError = 'Le titre est obligatoire.'; return; }
    if (!this.editCours.categorieId)  { this.editError = 'Choisissez une catégorie.'; return; }
    if (!this.editCours.sousCategorieId) { this.editError = 'Choisissez une sous-catégorie.'; return; }

    this.editLoading = true;
    this.editError   = '';

    this.coursService.updateCours(this.itemToEdit.id, this.editCours).subscribe({
      next: (updated: Cours) => {
        this.mesCours    = this.mesCours.map((c: Cours) => c.id === updated.id ? updated : c);
        this.editLoading = false;
        this.closeEditForm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur modification:', err);
        this.editError   = 'Erreur lors de la modification.';
        this.editLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── SUPPRESSION ───────────────────────────────────────

  confirmDelete(item: Cours): void {
    this.itemToDelete = item;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.itemToDelete      = null;
  }

  supprimerCours(): void {
    if (!this.itemToDelete?.id) return;
    this.deleteLoading = true;
    const id = this.itemToDelete.id;

    this.coursService.supprimerCours(id).subscribe({
      next: () => {
        this.mesCours      = this.mesCours.filter((c: Cours) => c.id !== id);
        this.deleteLoading = false;
        this.closeDeleteConfirm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur suppression:', err);
        this.errorMessage  = 'Erreur lors de la suppression.';
        this.deleteLoading = false;
        this.closeDeleteConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: '📝 Brouillon', EN_ATTENTE_VALIDATION: '⏳ En attente',
      PUBLIE: '🌍 Publié', SUPPRIME: '🚫 Supprimé',
    };
    return labels[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      BROUILLON: 'brouillon', EN_ATTENTE_VALIDATION: 'attente', PUBLIE: 'publie', SUPPRIME: 'supprime',
    };
    return classes[statut] ?? '';
  }

  getInitialesFromNom(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getIcon(categorieNom: string): string {
    const nom = (categorieNom ?? '').toLowerCase();
    if (nom.includes('informatique') || nom.includes('programmation')) return '💻';
    if (nom.includes('langue') || nom.includes('anglais')) return '🌐';
    if (nom.includes('science') || nom.includes('math')) return '🔬';
    if (nom.includes('design')) return '🎨';
    if (nom.includes('ia') || nom.includes('intelligence')) return '🤖';
    return '📚';
  }

  getBannerGradient(categorieId: number): string {
    // Toutes les couleurs dans la palette violet/indigo
    const gradients = [
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#8b5cf6,#6366f1)',
      'linear-gradient(135deg,#4f46e5,#7c3aed)',
      'linear-gradient(135deg,#7c3aed,#4f46e5)',
      'linear-gradient(135deg,#6366f1,#4f46e5)',
    ];
    return gradients[(categorieId ?? 0) % gradients.length];
  }

  // ── Inscriptions ──────────────────────────────────────

  get inscriptionsEnAttente(): number {
    return this.inscriptions.filter(i => String(i.statut).trim() === 'EN_ATTENTE').length;
  }

  get totalInscriptions(): number {
    return this.inscriptions.length;
  }

  chargerInscriptions(): void {
    this.inscLoading = true;
    const formateurId = Number(localStorage.getItem('userId'));
    const coursIds = this.mesCours.map(c => c.id);
    console.log('mesCours:', this.mesCours.length, 'coursIds:', coursIds);
    if (coursIds.length === 0) {
      console.warn('Aucun cours — chargement des cours dabord');
      // Recharger les cours puis charger les inscriptions
      this.coursService.getCoursByFormateur(formateurId).subscribe({
        next: (data: Cours[]) => {
          this.mesCours = data;
          const ids = data.map(c => c.id);
          console.log('Cours rechargés:', ids);
          if (ids.length === 0) { this.inscLoading = false; this.cdr.detectChanges(); return; }
          this._chargerInscriptionsPourCours(ids);
        },
        error: () => { this.inscLoading = false; this.cdr.detectChanges(); }
      });
      return;
    }
    this._chargerInscriptionsPourCours(coursIds);
  }

  private _chargerInscriptionsPourCours(coursIds: number[]): void {

    let loaded = 0;
    const allInscrits: InscriptionResponse[] = [];

    coursIds.forEach(coursId => {
      this.inscriptionService.getByCours(coursId).subscribe({
        next: (data: InscriptionResponse[]) => {
          allInscrits.push(...data);
          loaded++;
          if (loaded === coursIds.length) {
            this.inscriptions = allInscrits;
            console.log('Inscriptions chargées:', allInscrits);
            console.log('Statuts:', allInscrits.map(i => i.statut));
            this.inscLoading  = false;
            this.cdr.detectChanges();
          }
        },
        error: (err: unknown) => {
          console.error(err);
          loaded++;
          if (loaded === coursIds.length) {
            this.inscriptions = allInscrits;
            console.log('Inscriptions chargées:', allInscrits);
            console.log('Statuts:', allInscrits.map(i => i.statut));
            this.inscLoading  = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  filteredInscriptions(): InscriptionResponse[] {
    if (!this.inscFilter) return this.inscriptions;
    return this.inscriptions.filter(i => 
      String(i.statut).trim() === String(this.inscFilter).trim()
    );
  }

  accepterInscription(id: number): void {
    this.inscActionLoading = true;
    this.inscriptionService.updateStatut(id, 'VALIDE').subscribe({
      next: (updated: InscriptionResponse) => {
        this.inscriptions = this.inscriptions.map(i => i.id === id ? updated : i);
        this.inscActionLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.inscActionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refuserInscription(id: number): void {
    this.inscActionLoading = true;
    this.inscriptionService.updateStatut(id, 'REFUSE').subscribe({
      next: (updated: InscriptionResponse) => {
        this.inscriptions = this.inscriptions.map(i => i.id === id ? updated : i);
        this.inscActionLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.inscActionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getInscStatutClass(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'attente', VALIDE: 'valide', REFUSE: 'refuse', ANNULE: 'annule'
    };
    return map[statut] ?? '';
  }

  getInscStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: '⏳ En attente', VALIDE: '✅ Acceptée', REFUSE: '❌ Refusée', ANNULE: '🚫 Annulée'
    };
    return map[statut] ?? statut;
  }

  // ── PDF upload ────────────────────────────────────────

  onPdfChange(event: Event, mode: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      if (mode === 'new') this.addError = 'PDF trop volumineux (max 10 MB)';
      else this.editError = 'PDF trop volumineux (max 10 MB)';
      return;
    }
    this.pdfUploading  = true;
    this.pdfNomFichier = file.name;
    // Simuler une URL locale — remplacer par un vrai upload si backend disponible
    const reader = new FileReader();
    reader.onload = () => {
      const url = URL.createObjectURL(file);
      if (mode === 'new') this.newCours.pdfUrl = url;
      else this.editCours.pdfUrl = url;
      this.pdfUploading = false;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removePdf(mode: 'new' | 'edit'): void {
    if (mode === 'new') this.newCours.pdfUrl = '';
    else this.editCours.pdfUrl = '';
    this.pdfNomFichier = '';
    this.cdr.detectChanges();
  }

  voirProfil(): void {
    this.router.navigate(['/teacher-profile']);
    // À adapter selon votre routing — pour l'instant simple navigation
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}