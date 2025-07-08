import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,catchError,throwError } from 'rxjs';
import { Maladie } from 'src/models/Maladie.model';

@Injectable({
  providedIn: 'root'
})
export class MaladieService {
  private apiUrl = 'http://localhost:9090/api/maladies';

  constructor(private http: HttpClient) {}

  // Get all maladies
  getAllMaladies(): Observable<Maladie[]> {
    return this.http.get<Maladie[]>(this.apiUrl, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la récupération des maladies')))
      );
  }

  // Get maladie by ID
  getMaladieById(id: number): Observable<Maladie> {
    return this.http.get<Maladie>(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || `Échec de la récupération de la maladie ${id}`)))
      );
  }

  // Create a new maladie
  createMaladie(maladie: Maladie): Observable<Maladie> {
    return this.http.post<Maladie>(this.apiUrl, maladie, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la création de la maladie')))
      );
  }

  // Update an existing maladie
  updateMaladie(id: number, maladie: Maladie): Observable<Maladie> {
    return this.http.put<Maladie>(`${this.apiUrl}/${id}`, maladie, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || `Échec de la mise à jour de la maladie ${id}`)))
      );
  }

  // Delete a maladie
  deleteMaladie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || `Échec de la suppression de la maladie ${id}`)))
      );
  }
 }