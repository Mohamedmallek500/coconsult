import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Medicament } from 'src/models/Medicament.model';

@Injectable({
  providedIn: 'root'
})
export class MedicamentService {
  private baseUrl = 'http://localhost:9090/api/medicaments';

  constructor(private http: HttpClient) {}

  // Create a new medicament
  createMedicament(medicament: Medicament): Observable<Medicament> {
    return this.http.post<Medicament>(this.baseUrl, medicament, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la création du médicament';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Get a medicament by ID
  getMedicamentById(id: number): Observable<Medicament> {
    return this.http.get<Medicament>(`${this.baseUrl}/${id}`, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la récupération du médicament';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Get all medicaments
  getAllMedicaments(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(this.baseUrl, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la récupération des médicaments';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Update a medicament
  updateMedicament(id: number, medicament: Medicament): Observable<Medicament> {
    return this.http.put<Medicament>(`${this.baseUrl}/${id}`, medicament, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la mise à jour du médicament';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Delete a medicament
  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la suppression du médicament';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }
}