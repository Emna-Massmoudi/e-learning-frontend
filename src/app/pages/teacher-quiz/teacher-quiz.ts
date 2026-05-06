// cSpell:ignore lecon evaluation formateur quiz

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursService } from '../../services/cours';
import {QuizService} from '../../services/quiz';
import { Cours } from '../../models/cours.model';
import { LeconResponse ,LeconRequest} from '../../models/lecon.model';
import{EvaluationResponse, EvaluationRequest,TypeEvaluation} from '../../models/evaluation.model';
import { QuestionResponse, QuestionRequest } from '../../models/question.model';
import { ChoixResponse } from '../../models/choix.model';

@Component({
  selector: 'app-teacher-quiz',
  standalone: true,
  templateUrl: './teacher-quiz.html',
  styleUrls: ['./teacher-quiz.scss'],
  imports: [CommonModule, FormsModule],
})
export class TeacherQuiz implements OnInit {

  // ── State navigation ──────────────────────────────────
  vue: 'cours' | 'lecons' | 'quiz' | 'questions' = 'cours';

  // ── Data ──────────────────────────────────────────────
  mesCours:     Cours[]              = [];
  lecons:       LeconResponse[]      = [];
  evaluations:  EvaluationResponse[] = [];
  questions:    QuestionResponse[]   = [];

  coursSelectionne:  Cours | null              = null;
  leconSelectionnee: LeconResponse | null      = null;
  evalSelectionnee:  EvaluationResponse | null = null;

  loading = false;
  formateurId = Number(localStorage.getItem('userId'));

  // ── Modals Leçon ──────────────────────────────────────
  showLeconForm = false;
  leconForm: LeconRequest = { titre: '', description: '', ordre: 1, coursId: 0, videoUrl: '', pdfUrl: '' };
  leconToEdit: LeconResponse | null = null;
  leconLoading        = false;
  leconError          = '';
  leconPdfUploading   = false;
  leconPdfNomFichier  = '';
  leconVideoUploading = false;

  // ── Modals Evaluation ─────────────────────────────────
  showEvalForm = false;
  evalForm: EvaluationRequest = { titre: '', type: 'QUIZ', noteMax: 20, noteMin: 14, leconId: 0 };
  evalToEdit:  EvaluationResponse | null = null;
  evalLoading  = false;
  evalError    = '';

  // ── Modals Question ───────────────────────────────────
  showQuestionForm = false;
  questionForm: QuestionRequest = { enonce: '', point: 1, evaluationId: 0 };
  questionToEdit: QuestionResponse | null = null;
  questionLoading = false;
  questionError   = '';
  // Choix temporaires pour la question
  choixTemp: { texte: string; estCorrect: boolean }[] = [
    { texte: '', estCorrect: false },
    { texte: '', estCorrect: false },
  ];

  // ── Confirm delete ────────────────────────────────────
  showDeleteConfirm = false;
  deleteTarget: { type: string; id: number; label: string } | null = null;
  deleteLoading = false;

  constructor(
    private readonly coursService: CoursService,
    private readonly quizService:  QuizService,
    private readonly router:       Router,
    private readonly cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerMesCours();
  }

  // ── Chargement ────────────────────────────────────────

  chargerMesCours(): void {
  this.loading = true;
  this.coursService.getCoursByFormateur(this.formateurId).subscribe({
    next: (data: Cours[]) => {
      // ✅ Afficher seulement les cours publiés
      this.mesCours = data.filter(c => c.etatPublication === 'PUBLIE');
      this.loading  = false;
      this.cdr.detectChanges();
    },
    error: (err: unknown) => { console.error(err); this.loading = false; this.cdr.detectChanges(); }
  });
}

  selectionnerCours(cours: Cours): void {
    this.coursSelectionne = cours;
    this.loading = true;
    this.quizService.getLeconsByCours(cours.id).subscribe({
      next: (data: LeconResponse[]) => {
        this.lecons  = data.sort((a, b) => a.ordre - b.ordre);
        this.loading = false;
        this.vue     = 'lecons';
        this.cdr.detectChanges();
      },
      error: (err: unknown) => { console.error(err); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  selectionnerLecon(lecon: LeconResponse): void {
    this.leconSelectionnee = lecon;
    this.loading = true;
    this.quizService.getEvaluationsByLecon(lecon.id).subscribe({
      next: (data: EvaluationResponse[]) => {
        this.evaluations = data;
        this.loading     = false;
        this.vue         = 'quiz';
        this.cdr.detectChanges();
      },
      error: (err: unknown) => { console.error(err); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  selectionnerEval(eval_: EvaluationResponse): void {
    this.evalSelectionnee = eval_;
    this.questions        = eval_.questions ?? [];
    this.vue              = 'questions';
    this.cdr.detectChanges();
  }

  // ── Navigation retour ─────────────────────────────────

  retourCours():  void { this.vue = 'cours'; this.coursSelectionne = null; }
  retourLecons(): void { this.vue = 'lecons'; this.leconSelectionnee = null; }
  retourQuiz():   void { this.vue = 'quiz'; this.evalSelectionnee = null; }

  // ── PDF Leçon upload ─────────────────────────────────

  onLeconPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) { this.leconError = 'PDF trop volumineux (max 10 MB)'; return; }
    this.leconPdfUploading  = true;
    this.leconPdfNomFichier = file.name;
    this.leconError         = '';

    // Upload vers Spring Boot
    this.quizService.uploadPdf(file).subscribe({
      next: (res) => {
        this.leconForm.pdfUrl  = res.url;
        this.leconPdfUploading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.leconError        = "Erreur lors de l'upload du PDF.";
        this.leconPdfUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeLeconPdf(): void {
    this.leconForm.pdfUrl    = '';
    this.leconPdfNomFichier  = '';
    this.cdr.detectChanges();
  }

  // ── CRUD Leçon ────────────────────────────────────────

  openLeconForm(lecon?: LeconResponse): void {
    this.leconToEdit = lecon ?? null;
    this.leconForm = lecon
      ? { titre: lecon.titre, description: lecon.description, ordre: lecon.ordre, coursId: lecon.coursId || this.coursSelectionne!.id, videoUrl: lecon.videoUrl ?? '', pdfUrl: lecon.pdfUrl ?? '' }
      : { titre: '', description: '', ordre: this.lecons.length + 1, coursId: this.coursSelectionne!.id, videoUrl: '', pdfUrl: '' };
    this.leconError   = '';
    this.showLeconForm = true;
  }

  sauvegarderLecon(): void {
    if (!this.leconForm.titre.trim()) { this.leconError = 'Le titre est obligatoire.'; return; }
    this.leconLoading = true;
    const obs$ = this.leconToEdit
      ? this.quizService.updateLecon(this.leconToEdit.id, this.leconForm)
      : this.quizService.createLecon(this.leconForm);

    obs$.subscribe({
      next: (data: LeconResponse) => {
        if (this.leconToEdit) {
          this.lecons = this.lecons.map(l => l.id === data.id ? data : l);
        } else {
          this.lecons = [...this.lecons, data];
        }
        this.leconLoading  = false;
        this.showLeconForm = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.leconError   = 'Erreur lors de la sauvegarde.';
        this.leconLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── CRUD Évaluation ───────────────────────────────────

  openEvalForm(eval_?: EvaluationResponse): void {
    this.evalToEdit = eval_ ?? null;
    this.evalForm = eval_ ? {
      titre:   eval_.titre,
      type:    eval_.type,
      noteMax: eval_.noteMax,
      noteMin: eval_.noteMin,
      leconId: eval_.leconId,
    } : {
      titre:   '',
      type:    'QUIZ' as TypeEvaluation,
      noteMax: 20,
      noteMin: 14,
      leconId: this.leconSelectionnee?.id ?? 0,
    };
    this.evalError    = '';
    this.showEvalForm = true;
  }

  sauvegarderEval(): void {
    if (!this.evalForm.titre.trim()) { this.evalError = 'Le titre est obligatoire.'; return; }
    this.evalLoading = true;
    const obs$ = this.evalToEdit
      ? this.quizService.updateEvaluation(this.evalToEdit.id, this.evalForm)
      : this.quizService.createEvaluation(this.evalForm);

    obs$.subscribe({
      next: (data: EvaluationResponse) => {
        if (this.evalToEdit) {
          // Préserver les questions existantes qui ne sont pas dans la response
          const questionsExistantes = this.evalToEdit.questions ?? [];
          const evalMiseAJour = { ...data, questions: questionsExistantes };
          this.evaluations = this.evaluations.map(e => e.id === data.id ? evalMiseAJour : e);
        } else {
          this.evaluations = [...this.evaluations, { ...data, questions: [] }];
        }
        this.evalLoading  = false;
        this.showEvalForm = false;
        this.evalToEdit   = null;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.evalError   = 'Erreur lors de la sauvegarde.';
        this.evalLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── CRUD Question + Choix ─────────────────────────────

  openQuestionForm(q?: QuestionResponse): void {
    this.questionToEdit = q ?? null;
    this.questionForm = q
      ? { enonce: q.enonce, point: q.point, evaluationId: this.evalSelectionnee!.id }
      : { enonce: '', point: 1, evaluationId: this.evalSelectionnee!.id };
    this.choixTemp = q?.choix?.length
      ? q.choix.map(c => ({ texte: c.texte, estCorrect: c.estCorrect }))
      : [{ texte: '', estCorrect: false }, { texte: '', estCorrect: false }];
    this.questionError   = '';
    this.showQuestionForm = true;
  }

  ajouterChoix(): void {
    this.choixTemp.push({ texte: '', estCorrect: false });
  }

  supprimerChoix(index: number): void {
    if (this.choixTemp.length > 2) this.choixTemp.splice(index, 1);
  }

  definirCorrect(index: number): void {
    this.choixTemp.forEach((c, i) => c.estCorrect = i === index);
  }

  sauvegarderQuestion(): void {
    if (!this.questionForm.enonce.trim()) { this.questionError = "L'énoncé est obligatoire."; return; }
    if (this.choixTemp.filter(c => c.texte.trim()).length < 2) {
      this.questionError = 'Minimum 2 choix requis.'; return;
    }
    if (!this.choixTemp.some(c => c.estCorrect)) {
      this.questionError = 'Désignez au moins un choix correct.'; return;
    }
    this.questionLoading = true;

    const obs$ = this.questionToEdit
      ? this.quizService.updateQuestion(this.questionToEdit.id, this.questionForm)
      : this.quizService.createQuestion(this.questionForm);

    obs$.subscribe({
      next: (q: QuestionResponse) => {
        // Sauvegarder les choix
        const choixValides = this.choixTemp.filter(c => c.texte.trim());
        const choixObs = choixValides.map(c =>
          this.quizService.createChoix({ texte: c.texte, estCorrect: c.estCorrect, questionId: q.id })
        );

        let done = 0;
        const choixSauves: ChoixResponse[] = [];
        choixObs.forEach(obs => {
          obs.subscribe({
            next: (c: ChoixResponse) => {
              choixSauves.push(c);
              done++;
              if (done === choixObs.length) {
                const questionComplete = { ...q, choix: choixSauves };
                if (this.questionToEdit) {
                  this.questions = this.questions.map(x => x.id === q.id ? questionComplete : x);
                } else {
                  this.questions = [...this.questions, questionComplete];
                }
                this.questionLoading  = false;
                this.showQuestionForm = false;
                this.cdr.detectChanges();
              }
            },
            error: () => { done++; if (done === choixObs.length) { this.questionLoading = false; this.cdr.detectChanges(); } }
          });
        });

        if (choixObs.length === 0) {
          this.questionLoading  = false;
          this.showQuestionForm = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: unknown) => {
        console.error(err);
        this.questionError   = 'Erreur lors de la sauvegarde.';
        this.questionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Suppression ───────────────────────────────────────

  confirmerSupprimer(type: string, id: number, label: string): void {
    this.deleteTarget = { type, id, label };
    this.showDeleteConfirm = true;
  }

  annulerSupprimer(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  execSupprimer(): void {
    if (!this.deleteTarget) return;
    this.deleteLoading = true;
    const { type, id } = this.deleteTarget;

    const obs$ =
      type === 'lecon'    ? this.quizService.deleteLecon(id) :
      type === 'eval'     ? this.quizService.deleteEvaluation(id) :
      type === 'question' ? this.quizService.deleteQuestion(id) : null;

    if (!obs$) return;

    obs$.subscribe({
      next: () => {
        if (type === 'lecon')    this.lecons      = this.lecons.filter(l => l.id !== id);
        if (type === 'eval')     this.evaluations  = this.evaluations.filter(e => e.id !== id);
        if (type === 'question') this.questions    = this.questions.filter(q => q.id !== id);
        this.deleteLoading     = false;
        this.showDeleteConfirm = false;
        this.deleteTarget      = null;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(err);
        this.deleteLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getIcon(categorieNom: string): string {
    const nom = (categorieNom ?? '').toLowerCase();
    if (nom.includes('informatique') || nom.includes('programmation')) return '💻';
    if (nom.includes('langue')) return '🌐';
    if (nom.includes('science') || nom.includes('math')) return '🔬';
    if (nom.includes('design')) return '🎨';
    return '📚';
  }

  getBannerGradient(categorieId: number): string {
    const g = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#06b6d4,#0ea5e9)', 'linear-gradient(135deg,#10b981,#06b6d4)'];
    return g[(categorieId ?? 0) % g.length];
  }

  getTypeLabel(type: TypeEvaluation): string {
    return type === 'QUIZ' ? '📝 Quiz' : '📋 Examen';
  }

  getTypeClass(type: TypeEvaluation): string {
    return type === 'QUIZ' ? 'quiz' : 'examen';
  }

  totalPoints(): number {
    return this.questions.reduce((s, q) => s + (q.point ?? 1), 0);
  }
}