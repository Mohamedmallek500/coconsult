import { Medicament } from "./Medicament.model";
import { User } from "./User.model";

// Interface pour la réponse du backend
export interface OrdonnanceResponse {
  id: number;
  patientId: number;
  doctorId: number;
  medicamentIds: number[];
}

// Interface pour l'utilisation côté frontend (après transformation)
export interface Ordonnance {
  id?: number;
  patientId?: number;
  doctorId?: number;
  patient?: User;
  doctor?: User;
  medicaments: Medicament[];
  medicamentIds?: number[]; // Optionnel pour la compatibilité
}