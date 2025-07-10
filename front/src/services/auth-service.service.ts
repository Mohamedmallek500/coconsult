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
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('user_name'));
  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('user_role'));
  private userIdSubject = new BehaviorSubject<number | null>(Number(localStorage.getItem('user_id')) || null);

  constructor(private http: HttpClient) {
    this.checkInitialAuthStatus();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, { email, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.isAuthenticatedSubject.next(true);
        const userName = response?.username;
        const userRole = response?.roles?.[0];
        const userId = response?.id;
        if (userName) {
          localStorage.setItem('user_name', userName);
          this.userNameSubject.next(userName);
        }
        if (userRole) {
          localStorage.setItem('user_role', userRole);
          this.userRoleSubject.next(userRole);
        }
        if (userId) {
          localStorage.setItem('user_id', userId.toString());
          this.userIdSubject.next(userId);
        }
      }),
      catchError(error => throwError(() => new Error(error.error?.message || 'Login failed')))
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

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true }).pipe(
      catchError(error => throwError(() => new Error(error.error?.message || 'Patient registration failed')))
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

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true }).pipe(
      catchError(error => throwError(() => new Error(error.error?.message || 'Doctor registration failed')))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/signout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.userNameSubject.next(null);
        this.userRoleSubject.next(null);
        this.userIdSubject.next(null);
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
      }),
      catchError(error => throwError(() => new Error(error.error?.message || 'Logout failed')))
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private checkInitialAuthStatus(): void {
    const isAuthenticated = !!localStorage.getItem('user_name') && !!localStorage.getItem('user_role');
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  get userName$(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  get userRole$(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  get userId$(): Observable<number | null> {
    return this.userIdSubject.asObservable();
  }



}