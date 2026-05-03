export type TypeEvaluation = 'QUIZ' | 'EXAMEN';
import { QuestionResponse } from './question.model';

export interface EvaluationRequest {
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMin: number;
  leconId: number;
}

export interface EvaluationResponse {
  id: number;
  titre: string;
  type: TypeEvaluation;
  noteMax: number;
  noteMin: number;
  leconId: number;
  leconTitre: string;
  questions: QuestionResponse[]; 
}