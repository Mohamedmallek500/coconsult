import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Appointment, AppointmentRequest } from 'src/models/Appointment.model';
import { User } from 'src/models/User.model';
import { UserService } from './UserService.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:9090/api/appointments';

  constructor(private http: HttpClient,
    private userService: UserService
  ) { }

  // Récupérer tous les rendez-vous d'un médecin
  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    const url = `${this.apiUrl}/doctor/${doctorId}`;
    return this.http.get<Appointment[]>(url, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
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


  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    const url = `${this.apiUrl}/patient/${patientId}`;
    return this.http.get<Appointment[]>(url, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Erreur complète:', error);
        let errorMsg = 'Erreur lors de la récupération des rendez-vous du patient';
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

  // Méthode optimisée pour récupérer les patients d'un médecin avec leurs rendez-vous
  getPatientsWithAppointmentsByDoctor(doctorId: number): Observable<{ patient: User, appointments: Appointment[] }[]> {
    return this.getAppointmentsByDoctor(doctorId).pipe(
      switchMap((appointments: Appointment[]) => {
        // Grouper les rendez-vous par patient
        const patientAppointmentsMap = new Map<number, Appointment[]>();

        appointments.forEach(appointment => {
          const patientId = appointment.patientId;
          if (patientId) {
            if (!patientAppointmentsMap.has(patientId)) {
              patientAppointmentsMap.set(patientId, []);
            }
            patientAppointmentsMap.get(patientId)!.push(appointment);
          }
        });

        // Récupérer les informations des patients uniques
        const patientIds = Array.from(patientAppointmentsMap.keys());
        if (patientIds.length === 0) {
          return Promise.resolve([]);
        }

        const patientRequests = patientIds.map(id => this.userService.getUserById(id));

        return forkJoin(patientRequests).pipe(
          map(patients => {
            return patients.map(patient => ({
              patient: patient,
              appointments: patientAppointmentsMap.get(patient.id!) || []
            }));
          })
        );
      }),

      catchError(error => {
        console.error('Erreur lors de la récupération des patients du médecin:', error);
        let errorMsg = 'Erreur lors de la récupération des patients du médecin';
        if (error.status === 0) {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.';
        } else if (error.status === 401) {
          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.status === 404) {


          errorMsg = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }


}