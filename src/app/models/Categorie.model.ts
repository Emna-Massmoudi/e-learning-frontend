import { SousCategorie } from './sous-categorie.model';
export interface Categorie {
  id?: number;
  nom: string;
  description: string;
  sousCategories?: SousCategorie[];
}