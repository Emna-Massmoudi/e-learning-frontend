// cSpell:ignore lecon evaluation leconId evaluationId

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LeconRequest, LeconResponse } from '../models/lecon.model';
import { EvaluationRequest, EvaluationResponse } from '../models/evaluation.model';
import { QuestionRequest, QuestionResponse } from '../models/question.model';
import { ChoixRequest, ChoixResponse } from '../models/choix.model';
import { ResultatQuiz } from '../models/resultat.model';

@Injectable({ providedIn: 'root' })
export class QuizService {

  private readonly baseLecon = 'http://localhost:8081/api/lecons';
  private readonly baseEval  = 'http://localhost:8081/api/evaluations';
  private readonly baseQues  = 'http://localhost:8081/api/questions';
  private readonly baseChoix = 'http://localhost:8081/api/choix';

  constructor(private http: HttpClient) {}

  private headers() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` };
  }

  // ── Leçons ────────────────────────────────────────────
  getLeconsByCours(coursId: number): Observable<LeconResponse[]> {
    return this.http.get<LeconResponse[]>(`${this.baseLecon}/cours/${coursId}`, { headers: this.headers() });
  }
  createLecon(req: LeconRequest): Observable<LeconResponse> {
    return this.http.post<LeconResponse>(this.baseLecon, req, { headers: this.headers() });
  }
  updateLecon(id: number, req: LeconRequest): Observable<LeconResponse> {
    return this.http.put<LeconResponse>(`${this.baseLecon}/${id}`, req, { headers: this.headers() });
  }
  deleteLecon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseLecon}/${id}`, { headers: this.headers() });
  }

  // ── Évaluations ───────────────────────────────────────
  getEvaluationsByLecon(leconId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.baseEval}/lecon/${leconId}`, { headers: this.headers() });
  }
  getEvaluationById(id: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.baseEval}/${id}`, { headers: this.headers() });
  }
  createEvaluation(req: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.baseEval, req, { headers: this.headers() });
  }
  updateEvaluation(id: number, req: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.put<EvaluationResponse>(`${this.baseEval}/${id}`, req, { headers: this.headers() });
  }
  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseEval}/${id}`, { headers: this.headers() });
  }

  // ── Questions ─────────────────────────────────────────
  getQuestionsByEvaluation(evaluationId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${this.baseQues}/evaluation/${evaluationId}`, { headers: this.headers() });
  }
  createQuestion(req: QuestionRequest): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(this.baseQues, req, { headers: this.headers() });
  }
  updateQuestion(id: number, req: QuestionRequest): Observable<QuestionResponse> {
    return this.http.put<QuestionResponse>(`${this.baseQues}/${id}`, req, { headers: this.headers() });
  }
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseQues}/${id}`, { headers: this.headers() });
  }

  // ── Upload PDF ───────────────────────────────────────
  uploadPdf(file: File): Observable<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; fileName: string }>(
      'http://localhost:8081/api/upload/pdf',
      formData,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  }

  // ── Choix ─────────────────────────────────────────────
  createChoix(req: ChoixRequest): Observable<ChoixResponse> {
    return this.http.post<ChoixResponse>(this.baseChoix, req, { headers: this.headers() });
  }
  updateChoix(id: number, req: ChoixRequest): Observable<ChoixResponse> {
    return this.http.put<ChoixResponse>(`${this.baseChoix}/${id}`, req, { headers: this.headers() });
  }
  deleteChoix(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseChoix}/${id}`, { headers: this.headers() });
  }

  // ── Calcul score local (côté client) ──────────────────
  calculerScore(questions: QuestionResponse[], reponses: Map<number, number>): ResultatQuiz {
    let score = 0;
    let total = 0;

    questions.forEach(q => {
      total += q.point ?? 1;
      const choixId = reponses.get(q.id);
      if (choixId) {
        const bon = q.choix.find(c => c.id === choixId && c.estCorrect);
        if (bon) score += q.point ?? 1;
      }
    });

    const pourcentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return {
      score,
      total,
      pourcentage,
      reussi: pourcentage >= 70,
    };
  }
}