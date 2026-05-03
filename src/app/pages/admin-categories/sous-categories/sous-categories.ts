import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category';
import { SousCategorieService } from '../../../services/sous-categorie';
import { SousCategorie } from '../../../models/sous-categorie.model';
import { Categorie } from '../../../models/Categorie.model';

@Component({
  selector: 'app-sous-categories',
  standalone: true,
  templateUrl: './sous-categories.html',
  styleUrls: ['./sous-categories.scss'],
  imports: [CommonModule, FormsModule],
})
export class SousCategories implements OnInit {
  @Input() category: Categorie | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  sousCategories: SousCategorie[] = [];
  loading = false;
  errorMessage = '';

  // FORMULAIRE SOUS-CATÉGORIE
  showSousCategoryForm = false;
  nomSousCategorie = '';
  descriptionSousCategorie = '';

  // DELETE SOUS-CATÉGORIE
  showDeleteSousConfirm = false;
  sousCategoryToDelete: SousCategorie | null = null;

  constructor(
    private categoryService: CategoryService,
    private sousCategorieService: SousCategorieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.category?.id) {
      this.loadSousCategories();
    }
  }

  loadSousCategories(): void {
    if (!this.category?.id) return;
    
    this.loading = true;
    this.sousCategorieService.getByCategorieId(this.category.id).subscribe({
      next: (data: SousCategorie[]) => {
        this.sousCategories = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement sous-catégories:', err);
        this.errorMessage = 'Erreur chargement sous-catégories';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openSousCategoryForm(): void {
    this.showSousCategoryForm = true;
    this.nomSousCategorie = '';
    this.descriptionSousCategorie = '';
  }

  closeSousCategoryForm(): void {
    this.showSousCategoryForm = false;
    this.nomSousCategorie = '';
    this.descriptionSousCategorie = '';
  }

  addSousCategory(): void {
    if (!this.nomSousCategorie.trim()) {
      this.errorMessage = 'Le nom de la sous-catégorie est requis';
      return;
    }
    
    if (!this.category?.id) {
      this.errorMessage = 'Catégorie invalide';
      return;
    }
    
    const newSousCat: SousCategorie = {
      nom: this.nomSousCategorie.trim(),
      description: this.descriptionSousCategorie.trim() || '',
      categorieId: this.category.id
    };

    this.loading = true;
    this.errorMessage = '';
    
    this.sousCategorieService.create(newSousCat).subscribe({
      next: (createdSousCat: SousCategorie) => {
        this.sousCategories.push(createdSousCat);
        this.closeSousCategoryForm();
        this.loading = false;
        this.updated.emit(); // Notifier le parent
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur ajout sous-catégorie:', err);
        this.errorMessage = 'Erreur lors de l\'ajout';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDeleteSousCategory(sousCat: SousCategorie): void {
    this.sousCategoryToDelete = sousCat;
    this.showDeleteSousConfirm = true;
  }

  closeDeleteSousConfirm(): void {
    this.showDeleteSousConfirm = false;
    this.sousCategoryToDelete = null;
  }

  deleteSousCategory(): void {
    if (!this.sousCategoryToDelete?.id) return;
    
    this.loading = true;
    this.sousCategorieService.delete(this.sousCategoryToDelete.id).subscribe({
      next: () => {
        this.sousCategories = this.sousCategories.filter((sc: SousCategorie) => sc.id !== this.sousCategoryToDelete?.id);
        this.closeDeleteSousConfirm();
        this.loading = false;
        this.updated.emit(); // Notifier le parent
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur suppression sous-catégorie:', err);
        this.errorMessage = 'Erreur lors de la suppression';
        this.loading = false;
        this.closeDeleteSousConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
  get withDescCount(): number {
  return this.sousCategories.filter(s => s.description?.trim()).length;
}

get withoutDescCount(): number {
  return this.sousCategories.filter(s => !s.description?.trim()).length;
}
}