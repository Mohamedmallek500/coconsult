import { Ordonnance } from "./Ordonnance.model";
import { User } from "./User.model";

// Interface for Appointment response (from backend)
export interface Appointment {
  id?: number;
  doctor: User | number; // User in response, number in some contexts
  patient: User | number; // User in response, number in some contexts
  date: Date | string; // Date or ISO string in response
  ordonnance?: Ordonnance;
}

// Interface for Appointment request payload (to backend)
export interface AppointmentRequest {
  doctorId: number;
  patientId: number;
  date: string;
}