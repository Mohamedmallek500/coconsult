import { Medicament } from "./Medicament.model";
import { User } from "./User.model";

export interface Ordonnance {
  id?: number;
  patient: User;
  doctor: User;
  medicaments: Medicament[];
}
