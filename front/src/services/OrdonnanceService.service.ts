import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ordonnance } from 'src/models/Ordonnance.model';

@Injectable({
  providedIn: 'root'
})
export class OrdonnanceService {
  private baseUrl = 'http://localhost:9090/api/ordonnances';

  constructor(private http: HttpClient) {}

  // Get an ordonnance by ID
  getOrdonnanceById(id: number): Observable<Ordonnance> {
    return this.http.get<Ordonnance>(`${this.baseUrl}/${id}`, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la récupération de l\'ordonnance';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Get all ordonnances
  getAllOrdonnances(): Observable<Ordonnance[]> {
    return this.http.get<Ordonnance[]>(this.baseUrl, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la récupération des ordonnances';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  // Update an ordonnance
  updateOrdonnance(id: number, ordonnance: Ordonnance): Observable<Ordonnance> {
    return this.http.put<Ordonnance>(`${this.baseUrl}/${id}`, ordonnance, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de la mise à jour de l\'ordonnance';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }


}