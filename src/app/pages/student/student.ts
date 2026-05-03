// cSpell:ignore etudiant inscription cours quiz lecon

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursService} from '../../services/cours';
import { Cours } from '../../models/cours.model';
import { InscriptionService } from '../../services/inscription';
import { InscriptionResponse} from '../../models/inscription.model';
import { QuizService } from '../../services/quiz';
import { LeconResponse } from '../../models/lecon.model';
import {EvaluationResponse} from '../../models/evaluation.model';
import { QuestionResponse } from '../../models/question.model';


type Section = 'dashboard' | 'catalogue' | 'mesCours' | 'profil' | 'cours';

@Component({
  selector: 'app-student',
  standalone: true,
  templateUrl: './student.html',
  styleUrl: './student.scss',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Student implements OnInit {

  // ── Profil ────────────────────────────────────────────
  nomEtudiant   = localStorage.getItem('nom')   ?? 'Étudiant';
  emailEtudiant = localStorage.getItem('email') ?? '';
  etudiantId    = Number(localStorage.getItem('userId'));
  initiales     = this.getInitiales(localStorage.getItem('nom') ?? '');

  // ── Navigation ────────────────────────────────────────
  section: Section   = 'dashboard';
  sidebarCollapsed   = false;

  // ── State ─────────────────────────────────────────────
  catalogue:    Cours[]               = [];
  mesCours:     InscriptionResponse[] = [];
  loading       = false;
  errorMessage  = '';
  searchQuery   = '';
  filterCat     = '';

  // ── Inscription ───────────────────────────────────────
  inscriptionLoading = false;
  inscriptionSuccess = '';
  inscriptionError   = '';
  showConfirmInscrit: Cours | null = null;
  showConfirmAnnuler: InscriptionResponse | null = null;

  // ── Cours actif (contenu) ─────────────────────────────
  coursActif:   Cours | null         = null;
  lecons:       LeconResponse[]      = [];
  leconActive:  LeconResponse | null = null;
  leconLoading  = false;

  // ── Quiz ──────────────────────────────────────────────
  evaluations:      EvaluationResponse[] = [];
  evalActive:       EvaluationResponse | null = null;
  quizVue: 'liste' | 'passage' | 'resultat' = 'liste';

  // Passage quiz
  reponsesEtudiant = new Map<number, number>(); // questionId → choixId
  quizTimer        = 0;
  quizTimerMax     = 0;
  timerInterval:   ReturnType<typeof setInterval> | null = null;
  quizLoading      = false;

  // Résultat
  scoreObtenu  = 0;
  scoreTotal   = 0;
  scorePct     = 0;
  quizReussi   = false;

  constructor( 
  private coursService: CoursService,
  private inscriptionService: InscriptionService,
  private quizService: QuizService,
  private sanitizer: DomSanitizer,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.chargerCatalogue();
    this.chargerMesCours();
  }

  // ── Chargement ────────────────────────────────────────

  chargerCatalogue(): void {
    this.coursService.getAllCours().subscribe({
      next: (data: Cours[]) => {
        this.catalogue = data.filter(c => c.etatPublication === 'PUBLIE');
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error(err)
    });
  }

  chargerMesCours(): void {
    this.inscriptionService.getByEtudiant(this.etudiantId).subscribe({
      next: (data: InscriptionResponse[]) => {
        this.mesCours = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error(err)
    });
  }

  // ── Accès au contenu d'un cours ───────────────────────

  ouvrirCours(insc: InscriptionResponse): void {
    // Reset état
    this.leconActive = null;
    this.evalActive  = null;
    this.lecons      = [];
    this.evaluations = [];
    this.quizVue     = 'liste';

    // Trouver le cours dans le catalogue ou le charger
    const cours = this.catalogue.find(c => c.id === insc.coursId);
    if (cours) {
      this.coursActif = cours;
      this.section    = 'cours';
      this.chargerLecons(cours.id);
      this.cdr.detectChanges();
    } else {
      this.coursService.getCoursById(insc.coursId).subscribe({
        next: (c: Cours) => {
          this.coursActif = c;
          this.section    = 'cours';
          this.chargerLecons(c.id);
          this.cdr.detectChanges();
        },
        error: (err: unknown) => console.error(err)
      });
    }
  }

  chargerLecons(coursId: number): void {
    this.leconLoading = true;
    this.quizService.getLeconsByCours(coursId).subscribe({
      next: (data: LeconResponse[]) => {
        this.lecons      = data.sort((a, b) => a.ordre - b.ordre);
        this.leconLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => { console.error(err); this.leconLoading = false; this.cdr.detectChanges(); }
    });
  }

  selectionnerLecon(lecon: LeconResponse): void {
    this.leconActive = lecon;
    this.evalActive  = null;
    this.quizVue     = 'liste';
    // Charger les évaluations de cette leçon
    this.quizService.getEvaluationsByLecon(lecon.id).subscribe({
      next: (data: EvaluationResponse[]) => {
        this.evaluations = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error(err)
    });
    this.cdr.detectChanges();
  }

  retourLecons(): void {
    this.leconActive = null;
    this.evalActive  = null;
    this.quizVue     = 'liste';
  }

  // ── PDF ───────────────────────────────────────────────

  getPdfUrl(url: string): SafeResourceUrl {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8081${url}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  isYoutube(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  getYoutubeEmbed(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('v='))   videoId = url.split('v=')[1].split('&')[0];
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  // ── Quiz — Passage ────────────────────────────────────

  commencerQuiz(eval_: EvaluationResponse): void {
    this.reponsesEtudiant = new Map();
    this.scoreObtenu      = 0;
    this.scorePct         = 0;
    this.quizReussi       = false;
    this.quizLoading      = true;
    this.quizVue          = 'passage';

    // Charger les questions avec leurs choix depuis le backend
    this.quizService.getQuestionsByEvaluation(eval_.id).subscribe({
      next: (questions) => {
        this.evalActive = { ...eval_, questions };
        this.quizLoading = false;

        const nbQ = questions.length;
        this.quizTimerMax = nbQ > 0 ? nbQ * 120 : 300;
        this.quizTimer    = this.quizTimerMax;
        this.demarrerTimer();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.quizLoading = false;
        this.quizVue     = 'liste';
        this.cdr.detectChanges();
      }
    });
    this.cdr.detectChanges();
  }

  demarrerTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.quizTimer--;
      if (this.quizTimer <= 0) {
        this.soumettreQuiz();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  arreterTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  choisirReponse(questionId: number, choixId: number): void {
    this.reponsesEtudiant.set(questionId, choixId);
  }

  aRepondu(questionId: number): boolean {
    return this.reponsesEtudiant.has(questionId);
  }

  getReponseChoisie(questionId: number): number {
    return this.reponsesEtudiant.get(questionId) ?? -1;
  }

  soumettreQuiz(): void {
    this.arreterTimer();
    if (!this.evalActive) return;

    const questions = this.evalActive.questions ?? [];
    const resultat  = this.quizService.calculerScore(questions, this.reponsesEtudiant);

    this.scoreObtenu = resultat.score;
    this.scoreTotal  = resultat.total;
    this.scorePct    = resultat.pourcentage;
    this.quizReussi  = resultat.reussi;
    this.quizVue     = 'resultat';
    this.cdr.detectChanges();
  }

  recommencerQuiz(): void {
    if (this.evalActive) this.commencerQuiz(this.evalActive);
  }

  retourQuizListe(): void {
    this.arreterTimer();
    this.evalActive = null;
    this.quizVue    = 'liste';
  }

  // ── Helpers timer ─────────────────────────────────────

  get timerMin(): string {
    return String(Math.floor(this.quizTimer / 60)).padStart(2, '0');
  }
  get timerSec(): string {
    return String(this.quizTimer % 60).padStart(2, '0');
  }
  get timerPct(): number {
    return this.quizTimerMax > 0 ? (this.quizTimer / this.quizTimerMax) * 100 : 100;
  }
  get timerDanger(): boolean {
    return this.quizTimer < 30;
  }

  // ── Filtrage catalogue ────────────────────────────────

  filteredCatalogue(): Cours[] {
    return this.catalogue.filter(c => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = !q
        || c.titre.toLowerCase().includes(q)
        || (c.formateurNom ?? '').toLowerCase().includes(q)
        || (c.categorieNom ?? '').toLowerCase().includes(q);
      const matchCat = !this.filterCat || (c.categorieNom ?? '') === this.filterCat;
      return matchSearch && matchCat;
    });
  }

  getCategories(): string[] {
    const cats = this.catalogue.map(c => c.categorieNom ?? '').filter(Boolean);
    return [...new Set(cats)];
  }

  // ── Stats dashboard ───────────────────────────────────

  get totalInscrits(): number { return this.mesCours.length; }
  get coursActifs():   number { return this.mesCours.filter(i => i.statut === 'VALIDE').length; }
  get coursEnAttente():number { return this.mesCours.filter(i => i.statut === 'EN_ATTENTE').length; }

  isInscrit(coursId: number): boolean {
    return this.mesCours.some(i =>
      (i.coursId === coursId || (i as any).cours?.id === coursId)
      && i.statut !== 'ANNULE' && i.statut !== 'REFUSE'
    );
  }

  isAccepte(coursId: number): boolean {
    return this.mesCours.some(i => i.coursId === coursId && i.statut === 'VALIDE');
  }

  getInscription(coursId: number): InscriptionResponse | undefined {
    return this.mesCours.find(i => i.coursId === coursId && i.statut === 'VALIDE');
  }

  // ── Inscription ───────────────────────────────────────

  ouvrirConfirmInscrit(cours: Cours): void {
    this.showConfirmInscrit = cours;
    this.inscriptionError   = '';
  }

  annulerConfirmInscrit(): void { this.showConfirmInscrit = null; }

  confirmerInscription(): void {
    if (!this.showConfirmInscrit) return;
    this.inscriptionLoading = true;
    this.inscriptionError   = '';
    this.inscriptionService.inscrire({
      etudiantId: this.etudiantId,
      coursId:    this.showConfirmInscrit.id
    }).subscribe({
      next: (res: InscriptionResponse) => {
        this.mesCours = [...this.mesCours, res];
        this.inscriptionLoading = false;
        this.showConfirmInscrit = null;
        this.inscriptionSuccess = `Inscription à "${res.coursTitre}" envoyée !`;
        setTimeout(() => { this.inscriptionSuccess = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        const status = (err as any)?.status;
        if (status === 409) {
          this.inscriptionError = "Vous êtes déjà inscrit à ce cours.";
        } else if (status === 403) {
          this.inscriptionError = "Votre compte est bloqué. Contactez l'administrateur.";
        } else {
          this.inscriptionError = "Erreur lors de l'inscription. Veuillez réessayer.";
        }
        this.inscriptionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirConfirmAnnuler(insc: InscriptionResponse): void { this.showConfirmAnnuler = insc; }
  annulerConfirmAnnuler(): void { this.showConfirmAnnuler = null; }

  confirmerAnnulation(): void {
    if (!this.showConfirmAnnuler) return;
    const id = this.showConfirmAnnuler.id;
    this.inscriptionLoading = true;
    this.inscriptionService.annuler(id).subscribe({
      next: () => {
        this.mesCours = this.mesCours.filter(i => i.id !== id);
        this.inscriptionLoading = false;
        this.showConfirmAnnuler = null;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.inscriptionLoading = false;
        this.showConfirmAnnuler = null;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getInitiales(nom: string): string {
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
    const g = [
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#8b5cf6,#6366f1)',
      'linear-gradient(135deg,#4f46e5,#7c3aed)',
      'linear-gradient(135deg,#7c3aed,#4f46e5)',
      'linear-gradient(135deg,#6366f1,#4f46e5)',
    ];
    return g[(categorieId ?? 0) % g.length];
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'attente', VALIDE: 'valide', REFUSE: 'refuse', ANNULE: 'annule'
    };
    return map[statut] ?? '';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: '⏳ En attente', VALIDE: '✅ Acceptée',
      REFUSE: '❌ Refusée', ANNULE: '🚫 Annulée'
    };
    return map[statut] ?? statut;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}