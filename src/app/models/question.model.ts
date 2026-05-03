import { ChoixResponse } from './choix.model';

export interface QuestionRequest {
  enonce: string;
  point: number;
  evaluationId: number;
}

export interface QuestionResponse {
  id: number;
  enonce: string;
  point: number;
  choix: ChoixResponse[];
}