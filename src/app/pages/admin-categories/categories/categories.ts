import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryService } from '../../../services/category';
import { SousCategories } from '../sous-categories/sous-categories';
import { Categorie } from '../../../models/Categorie.model';
import { SousCategorieService } from '../../../services/sous-categorie';

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [CommonModule, FormsModule, SousCategories],
})
export class Categories implements OnInit {
  categories: Categorie[] = [];
  loading = false;
  errorMessage = '';

  // ─── Recherche ─────────────────────────────────────
  searchQuery = '';

  // ─── Formulaire ajout ──────────────────────────────
  showForm = false;
  nomCategorie = '';
  descriptionCategorie = '';

  // ─── Formulaire modification ───────────────────────
  showEditForm = false;
  editNom = '';
  editDescription = '';
  categoryToEdit: Categorie | null = null;

  // ─── Suppression ───────────────────────────────────
  showDeleteConfirm = false;
  categoryToDelete: Categorie | null = null;

  // ─── Sous-catégories ───────────────────────────────
  showSousCategoriesModal = false;
  selectedCategory: Categorie | null = null;

  private gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #6366f1)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #f97316, #ec4899)',
    'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    'linear-gradient(135deg, #6366f1, #10b981)',
  ];

  constructor(
    private categoryService: CategoryService,
    private sousCategorieService: SousCategorieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ─── Chargement ────────────────────────────────────
  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getAll().subscribe({
      next: (categories: Categorie[]) => {
        if (categories.length === 0) {
          this.categories = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const requests = categories.map(cat =>
          this.sousCategorieService.getByCategorieId(cat.id!).pipe(
            catchError(() => of([]))
          )
        );

        forkJoin(requests).subscribe({
          next: (sousCategoriesArray) => {
            this.categories = categories.map((cat, index) => ({
              ...cat,
              sousCategories: sousCategoriesArray[index]
            }));
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.categories = [...categories];
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.errorMessage = 'Erreur chargement catégories';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Recherche ─────────────────────────────────────
  filteredCategories(): Categorie[] {
    if (!this.searchQuery.trim()) return this.categories;
    const q = this.searchQuery.toLowerCase().trim();
    return this.categories.filter(cat =>
      cat.nom.toLowerCase().includes(q) ||
      (cat.description || '').toLowerCase().includes(q)
    );
  }

  // ─── Stats ─────────────────────────────────────────
  getTotalSousCategories(): number {
    return this.categories.reduce((sum, cat) => sum + (cat.sousCategories?.length || 0), 0);
  }

  getAverage(): string {
    if (this.categories.length === 0) return '0';
    return (this.getTotalSousCategories() / this.categories.length).toFixed(1);
  }

  // ─── Helpers visuels ───────────────────────────────
  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  getCategoryIcon(nom: string): string {
    const icons: { [key: string]: string } = {
      'développement': '💻', 'web': '🌐', 'design': '🎨',
      'marketing': '📈', 'business': '💼', 'langues': '🗣️',
      'musique': '🎵', 'photo': '📸', 'vidéo': '🎬',
      'science': '🔬', 'math': '📐', 'santé': '🏥',
      'sport': '⚽', 'data': '📊', 'ia': '🤖',
      'sécurité': '🔒', 'cloud': '☁️', 'mobile': '📱',
    };
    const lower = nom.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lower.includes(key)) return icon;
    }
    return '📚';
  }

  getSousCategoriesCount(category: Categorie): number {
    return category.sousCategories?.length || 0;
  }

  // ─── Ajout ─────────────────────────────────────────
  openAddForm(): void {
    this.nomCategorie = '';
    this.descriptionCategorie = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.nomCategorie = '';
    this.descriptionCategorie = '';
  }

  addCategory(): void {
    if (!this.nomCategorie.trim()) {
      this.errorMessage = 'Le nom est requis';
      return;
    }
    const newCat: Categorie = {
      nom: this.nomCategorie.trim(),
      description: this.descriptionCategorie.trim() || ''
    };
    this.loading = true;
    this.errorMessage = '';
    this.categoryService.create(newCat).subscribe({
      next: (created: Categorie) => {
        this.categories = [...this.categories, { ...created, sousCategories: [] }];
        this.closeForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'ajout';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Modification ──────────────────────────────────
  openEditForm(category: Categorie): void {
    this.categoryToEdit = category;
    this.editNom = category.nom;
    this.editDescription = category.description || '';
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.categoryToEdit = null;
    this.editNom = '';
    this.editDescription = '';
  }

  updateCategory(): void {
    if (!this.editNom.trim() || !this.categoryToEdit?.id) return;

    const updated: Categorie = {
      ...this.categoryToEdit,
      nom: this.editNom.trim(),
      description: this.editDescription.trim()
    };

    this.loading = true;
    this.categoryService.update(this.categoryToEdit.id, updated).subscribe({
      next: (res: Categorie) => {
        this.categories = this.categories.map(c =>
          c.id === res.id ? { ...res, sousCategories: c.sousCategories } : c
        );
        this.closeEditForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la modification';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Suppression ───────────────────────────────────
  confirmDelete(category: Categorie): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  deleteCategory(): void {
    if (!this.categoryToDelete?.id) return;
    this.loading = true;
    this.categoryService.delete(this.categoryToDelete.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.categoryToDelete?.id);
        this.closeDeleteConfirm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression';
        this.loading = false;
        this.closeDeleteConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Sous-catégories ───────────────────────────────
  openSousCategories(category: Categorie): void {
    this.selectedCategory = category;
    this.showSousCategoriesModal = true;
  }

  closeSousCategoriesModal(): void {
    this.showSousCategoriesModal = false;
    this.selectedCategory = null;
  }

  onSousCategoriesUpdated(): void {
    this.loadCategories();
  }
}