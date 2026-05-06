// cSpell:ignore BROUILLON ATTENTE VALIDATION SUPPRIME formateur etudiant abonnement

import {
  Component, OnInit, AfterViewInit,
  ElementRef, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoursService }     from '../../services/cours';
import { FormateurService } from '../../services/formateur';
import { AdminService }     from '../../services/admin';
import { Cours, EtatCours } from '../../models/cours.model';
import { FormateurResponse } from '../../models/formateur.model';
import { Chart }            from 'chart.js/auto';
import { finalize }         from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  imports: [CommonModule],
})
export class AdminDashboard implements OnInit, AfterViewInit {

  today: string = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // ── ViewChild avec static:false (canvas rendu sous *ngIf) ──────────────
  @ViewChild('chartCoursRef',  { static: false }) chartCoursRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartStatutsRef',{ static: false }) chartStatutsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartLineRef',   { static: false }) chartLineRef!:   ElementRef<HTMLCanvasElement>;

  lineChart:     Chart | undefined;
  barChart:      Chart | undefined;
  doughnutChart: Chart | undefined;

  loading = true;

  stats = {
    totalCours:          0,
    coursPublies:        0,
    coursEnAttente:      0,
    coursValides:        0,
    totalFormateurs:     0,
    formateursActifs:    0,
    formateursEnAttente: 0,
    totalEtudiants:      0,
    revenus:             0,
    abonnes:             0,
  };

  derniersCours:    Cours[]             = [];
  dernieresCandidat: FormateurResponse[] = [];
  activites:        any[]               = [];
  allCours:         Cours[]             = [];

  constructor(
    private coursService:     CoursService,
    private formateurService: FormateurService,
    private adminService:     AdminService,
    private router:           Router,
    private cdr:              ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  // ngAfterViewInit ne fait rien ici — les canvas n'existent pas encore
  // car ils sont sous *ngIf="!loading"
  ngAfterViewInit(): void {}

  // ── Chargement des données ─────────────────────────────────────────────
  chargerDonnees(): void {

    this.coursService.getAllCours()
      .pipe(
        finalize(() => {
          this.loading = false;
          // 1️⃣  Forcer la détection de changement pour que *ngIf rende les canvas
          this.cdr.detectChanges();
          // 2️⃣  Attendre un tick pour que le DOM soit vraiment prêt
          setTimeout(() => this.dessinerCharts(), 0);
        })
      )
      .subscribe({
        next: (data) => {
          this.allCours = data;

          this.stats.totalCours      = data.length;
          this.stats.coursPublies    = data.filter(c => c.etatPublication === 'PUBLIE').length;
          this.stats.coursEnAttente  = data.filter(c => c.etatPublication === 'EN_ATTENTE_VALIDATION').length;
          // coursValides = brouillons (3e segment du doughnut)
          this.stats.coursValides    = data.filter(c => c.etatPublication === 'BROUILLON').length;

          this.derniersCours = [...data].reverse().slice(0, 5);
        },
        error: (err) => console.error('ERREUR API cours :', err)
      });

    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data) => {
        this.stats.formateursEnAttente = data.length;
        this.dernieresCandidat = data.slice(0, 5);
      },
      error: (err) => console.error('ERREUR API formateurs :', err)
    });

    this.adminService.getEtudiants().subscribe({
      next:  (data) => { this.stats.totalEtudiants = data.length; },
      error: (err)  => console.error('ERREUR API étudiants :', err)
    });
  }

  // ── Orchestration des charts ───────────────────────────────────────────
  dessinerCharts(): void {
    this.dessinerBarChart();
    this.dessinerDoughnut();
    this.dessinerLineChart();
  }

  // ── Bar chart : répartition par catégorie ─────────────────────────────
  dessinerBarChart(): void {
    const canvas = this.chartCoursRef?.nativeElement;
    if (!canvas) return;

    if (this.barChart) { this.barChart.destroy(); this.barChart = undefined; }

    const categories: Record<string, number> = {};
    this.allCours.forEach(c => {
      const key = c.categorieNom || 'Non classé';
      categories[key] = (categories[key] || 0) + 1;
    });

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Nombre de cours',
          data:  Object.values(categories),
          backgroundColor: [
            '#6366f1', '#8b5cf6', '#06b6d4',
            '#10b981', '#f59e0b', '#ef4444',
            '#ec4899', '#14b8a6',
          ],
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // ── Doughnut chart : distribution des statuts ─────────────────────────
  dessinerDoughnut(): void {
    const canvas = this.chartStatutsRef?.nativeElement;
    if (!canvas) return;

    if (this.doughnutChart) { this.doughnutChart.destroy(); this.doughnutChart = undefined; }

    // "Supprimés" = tout ce qui n'est ni PUBLIE, ni EN_ATTENTE_VALIDATION, ni BROUILLON
    const supprimes = Math.max(
      0,
      this.stats.totalCours
        - this.stats.coursPublies
        - this.stats.coursEnAttente
        - this.stats.coursValides   // coursValides === BROUILLON ici
    );

    this.doughnutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Publiés', 'En attente', 'Brouillons', 'Supprimés'],
        datasets: [{
          data: [
            this.stats.coursPublies,
            this.stats.coursEnAttente,
            this.stats.coursValides,  // BROUILLON
            supprimes,                // SUPPRIME
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: { legend: { display: false } },
        cutout: '65%'
      }
    });
  }

 dessinerLineChart(): void {
  const canvas = this.chartLineRef?.nativeElement;
  if (!canvas) return;

  if (this.lineChart) {
    this.lineChart.destroy();
    this.lineChart = undefined;
  }

  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  const currentMonth = new Date().getMonth();
  const last6Labels  = moisLabels.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  const countsParMois: Record<string, number> = {};
  last6Labels.forEach(m => countsParMois[m] = 0);

  // ✅ Utilisation STRICTE des données backend
  this.allCours.forEach(c => {
    if ((c as any).dateCreation) {
      const d = new Date((c as any).dateCreation);
      const label = moisLabels[d.getMonth()];
      if (label in countsParMois) {
        countsParMois[label]++;
      }
    }
  });

  const finalData = Object.values(countsParMois);

  // ❗ Si aucune donnée → afficher message 
  if (finalData.every(v => v === 0)) {
    console.warn("Aucune donnée réelle pour le graphique");
    return;
  }

  this.lineChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: last6Labels,
      datasets: [{
        label: 'Cours créés',
        data: finalData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

  // ── Helpers ───────────────────────────────────────────────────────────
  getStatutLabel(statut: EtatCours): string {
    return ({
      BROUILLON:             'Brouillon',
      EN_ATTENTE_VALIDATION: 'En attente',
      PUBLIE:                'Publié',
      SUPPRIME:              'Supprimé',
    } as Record<string, string>)[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    return ({
      PUBLIE:                'badge-success',
      EN_ATTENTE_VALIDATION: 'badge-warning',
      SUPPRIME:              'badge-danger',
      BROUILLON:             'badge-secondary',
    } as Record<string, string>)[statut] ?? 'badge-default';
  }

  getInitiales(nom: string): string {
    return (nom || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}