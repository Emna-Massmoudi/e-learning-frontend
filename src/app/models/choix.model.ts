export interface ChoixRequest {
  texte: string;
  estCorrect: boolean;
  questionId: number;
}

export interface ChoixResponse {
  id: number;
  texte: string;
  estCorrect: boolean;
}