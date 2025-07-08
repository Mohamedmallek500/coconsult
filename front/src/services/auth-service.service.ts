import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from 'src/models/User.model';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private baseUrl = 'http://localhost:9090/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already authenticated (e.g., on page refresh)
    this.checkInitialAuthStatus();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, { email, password }, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  registerPatient(user: User, image: File | null = null): Observable<any> {
    const formData = new FormData();
    const payload: any = {
      username: user.username,
      email: user.email,
      password: user.password,
      numCnss: user.numCnss,
      numDossier: user.numDossier,
      nom: user.nom || undefined,
      prenom: user.prenom || undefined,
      numtel: user.numtel || undefined,
      dateNaissance: user.dateNaissance || undefined,
      adresse: user.adresse || undefined,
      cin: user.cin || undefined,
      role: ['patient'],
      nomDocteurFamille: user.nomDocteurFamille || undefined,
      mpsi: user.mpsi || undefined,
      dossierfile: user.dossierfile || []
    };

    formData.append('signUpRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de l\'inscription')))
      );
  }

  registerDoctor(user: User, image: File | null = null): Observable<any> {
    const formData = new FormData();
    const payload: any = {
      username: user.username,
      email: user.email,
      password: user.password,
      nom: user.nom || undefined,
      prenom: user.prenom || undefined,
      numtel: user.numtel || undefined,
      dateNaissance: user.dateNaissance || undefined,
      adresse: user.adresse || undefined,
      cin: user.cin || undefined,
      role: ['doctor'],
      speciality: user.speciality || undefined,
      bio: user.bio || undefined
    };

    formData.append('signUpRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de l\'inscription')))
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/signout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.isAuthenticatedSubject.next(false);
        }),
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la déconnexion')))
      );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private checkInitialAuthStatus(): void {
    // You might want to check with backend or local storage
    // For simplicity, assume not authenticated initially
    this.isAuthenticatedSubject.next(false);
  }
}