// Enum des statuts
export type StatutInscription =
  | 'EN_ATTENTE'
  | 'VALIDE'
  | 'REFUSE'
  | 'ANNULE';

// DTO pour création
export interface InscriptionRequest {
  etudiantId: number;
  coursId: number;
}

// DTO pour réponse backend
export interface InscriptionResponse {
  id: number;
  etudiantId: number;
  etudiantNom: string;
  coursId: number;
  coursTitre: string;
  coursImage?: string;
  statut: StatutInscription;
  dateInscription?: string;
}