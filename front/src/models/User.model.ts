import { Maladie } from "./Maladie.model";

export interface User {
  id?: number; // Optional for signup, set by backend
  username?: string; // Required for signup
  email: string; // Required for login and signup
  password?: string; // Required for login and signup
  numtel?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string; // ISO date string (e.g., '1990-05-15')
  adresse?: string;
  cin?: string;
  role?: string; // 'patient', 'doctor', or 'admin'
  numCnss?: string; // Required for patient signup
  nomDocteurFamille?: string;
  mpsi?: string;
  numDossier?: string; // Required for patient signup
  dossierfile?: (Maladie | number)[]; // number[] for signup, Maladie[] for response
  speciality?: string; // Required for doctor signup
  bio?: string; // Required for doctor signup
  isApproved?: boolean; // Default false for doctors
  image?: string; // Path to profile image (e.g., 'C:/Users/mmall/Desktop/Coconsult/front/src/assets/images/...')

}