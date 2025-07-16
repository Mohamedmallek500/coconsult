import { Ordonnance } from "./Ordonnance.model";
import { User } from "./User.model";

// Interface for Appointment response (from backend)
export interface Appointment {
  id?: number;
  doctorId?: number;
  patientId?: number;
  patient: User | number;
  doctor: User | number;
  date: Date;
ordonnanceId: number | null;
  status: 'PENDING' | 'CONFIRMED'| 'CANCELLED';
}

export interface AppointmentRequest {
  doctorId: number;
  patientId: number;
  date: string;
  status?: 'PENDING' | 'CONFIRMED';
}