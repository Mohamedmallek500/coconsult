import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Appointment, AppointmentRequest } from 'src/models/Appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:9090/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    const url = `${this.apiUrl}/doctor/${doctorId}`;
    return this.http.get<Appointment[]>(url, { withCredentials: true }).pipe(
      catchError(error =>
        throwError(() => new Error(error.error?.message || 'Failed to fetch appointments'))
      )
    );
  }

  createAppointment(appointment: AppointmentRequest): Observable<any> {
    return this.http.post(this.apiUrl, appointment, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response'
    }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMsg = 'Erreur lors de la réservation';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  confirmAppointment(appointmentId: number): Observable<Appointment> {
    const url = `${this.apiUrl}/${appointmentId}/confirm`;
    return this.http.post<Appointment>(url, null, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMsg = 'Erreur lors de la confirmation du rendez-vous';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          errorMsg = error.error?.message || 'Le rendez-vous est déjà confirmé ou invalide.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getAppointmentById(appointmentId: number): Observable<Appointment> {
    const url = `${this.apiUrl}/${appointmentId}`;
    return this.http.get<Appointment>(url, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMsg = 'Erreur lors de la récupération du rendez-vous';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.status === 404) {
          errorMsg = 'Rendez-vous non trouvé.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMsg = 'Erreur lors de la récupération des rendez-vous';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  deleteAppointment(appointmentId: number): Observable<void> {
    const url = `${this.apiUrl}/${appointmentId}`;
    return this.http.delete<void>(url, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMsg = 'Erreur lors de la suppression du rendez-vous';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.status === 404) {
          errorMsg = 'Rendez-vous non trouvé.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}