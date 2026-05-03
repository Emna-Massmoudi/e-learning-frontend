// Enum des états du cours
export type EtatCours = 
  | 'BROUILLON' 
  | 'EN_ATTENTE_VALIDATION' 
  | 'PUBLIE' 
  | 'SUPPRIME';

// Interface Cours (données reçues du backend)
export interface Cours {
  id:               number;
  titre:            string;
  description:      string;
  etatPublication:  EtatCours;
  statut:           EtatCours;
  categorieId:      number;
  categorieNom:     string;
  sousCategorieId:  number;
  sousCategorieNom: string;
  formateurId:      number;
  formateurNom:     string;
  formateurEmail?:  string;
  dateCreation?:    string;
  dateMiseAJour?:   string;
  nombreInscrits?:  number;
  duree?:           string;
  niveau?:          'debutant' | 'intermediaire' | 'avance';
  imageUrl?:        string;
  videoUrl?:        string;
  pdfUrl?:          string;
}

// Interface pour création / update
export interface CoursRequest {
  titre:           string;
  description:     string;
  formateurId:     number;
  categorieId:     number;
  sousCategorieId: number;
  duree?:          string;
  niveau?:         string;
  imageUrl?:       string;
  videoUrl?:       string;
  pdfUrl?:         string;
}