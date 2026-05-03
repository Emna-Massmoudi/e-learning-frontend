// cSpell:ignore formateur etudiant categorie

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Composants standalone — chacun gère ses propres données
import { AdminDashboard }   from '../admin-dashboard/admin-dashboard';
import { AdminFormateurs }  from '../admin-formateurs/admin-formateurs';
import { AdminEtudiants }   from '../admin-etudiants/admin-etudiants';
import { Categories }       from '../admin-categories/categories/categories';
import { Courses }          from '../admin-cours/admin-cours';
import { AdminBloques }     from '../admin-bloques/admin-bloques';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminDashboard,
    AdminFormateurs,
    AdminEtudiants,
    Categories,
    Courses,
    AdminBloques,
  ],
})
export class Admin implements OnInit {

  section: 'dashboard' | 'Formateurs' | 'etudiants' | 'blocked' | 'categories' | 'cours' = 'dashboard';

  nomAdmin      = localStorage.getItem('nom')   ?? 'Admin';
  emailAdmin    = localStorage.getItem('email') ?? '';
  initiales     = (localStorage.getItem('nom') ?? 'A')
                    .trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  constructor(
    private readonly router: Router,
    private readonly cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Chaque sous-composant charge ses propres données
  }

  setSection(sec: typeof this.section): void {
    this.section = sec;
    this.cdr.detectChanges();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}