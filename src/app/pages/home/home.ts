import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursService } from '../../services/cours';
import { Cours } from '../../models/cours.model';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  cours:       Cours[] = [];
  loading      = false;
  searchQuery  = '';
  filterCat    = '';

  constructor(
    private readonly coursService: CoursService,
    public  readonly router:       Router,
    private readonly cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Essayer d'abord getCoursPublies, sinon getAllCours avec filtre
    this.coursService.getCoursPublies().subscribe({
      next: (data) => {
        this.cours   = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback sur getAllCours
        this.coursService.getAllCours().subscribe({
          next: (data) => {
            this.cours   = data.filter(c => c.etatPublication === 'PUBLIE');
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
      }
    });
  }

  filteredCours(): Cours[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.cours.filter(c => {
      const matchSearch = !q
        || c.titre.toLowerCase().includes(q)
        || (c.categorieNom ?? '').toLowerCase().includes(q)
        || (c.formateurNom ?? '').toLowerCase().includes(q);
      const matchCat = !this.filterCat || (c.categorieNom ?? '') === this.filterCat;
      return matchSearch && matchCat;
    });
  }

  getCategories(): string[] {
    return [...new Set(this.cours.map(c => c.categorieNom ?? '').filter(Boolean))];
  }

  inscrire(cours: Cours): void {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (!token) {
      // Non connecté → rediriger vers login
      this.router.navigate(['/login']);
      return;
    }
    // Connecté → rediriger vers son dashboard
    if (role === 'ADMIN')     this.router.navigate(['/admin']);
    else if (role === 'FORMATEUR') this.router.navigate(['/teacher']);
    else this.router.navigate(['/student']);
  }

  goLogin():    void { this.router.navigate(['/login']); }
  goRegister(): void { this.router.navigate(['/register']); }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }

  getDashboardRoute(): string {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN')     return '/admin';
    if (role === 'FORMATEUR') return '/teacher';
    return '/student';
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
    const g = [
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#8b5cf6,#6366f1)',
      'linear-gradient(135deg,#4f46e5,#7c3aed)',
      'linear-gradient(135deg,#7c3aed,#4f46e5)',
      'linear-gradient(135deg,#6366f1,#4f46e5)',
    ];
    return g[(categorieId ?? 0) % g.length];
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}