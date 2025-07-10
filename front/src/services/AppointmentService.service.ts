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
      observe: 'response' // Pour voir la réponse complète
    }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        
        // Message d'erreur plus précis
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
}