import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private userNameSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('user_name'));
  private userRoleSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('user_role'));
  private userIdSubject = new BehaviorSubject<number | null>(Number(sessionStorage.getItem('user_id')) || null);

  constructor(private http: HttpClient) {
    this.checkInitialAuthStatus();
  }

login(email: string, password: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/signin`, { email, password }, { withCredentials: true }).pipe(
    tap((response: any) => {
      console.log('Login response:', response); // Log the response
      this.isAuthenticatedSubject.next(true);
      const userName = response?.username;
      const userRole = response?.roles?.[0];
      const userId = response?.id;
      if (userName) {
        sessionStorage.setItem('user_name', userName);
        this.userNameSubject.next(userName);
        console.log('Set user_name:', userName); // Log storage update
      }
      if (userRole) {
        sessionStorage.setItem('user_role', userRole);
        this.userRoleSubject.next(userRole);
        console.log('Set user_role:', userRole);
      }
      if (userId) {
        sessionStorage.setItem('user_id', userId.toString());
        this.userIdSubject.next(userId);
        console.log('Set user_id:', userId);
      }
    }),
    catchError(error => {
      console.error('Login error:', error); // Log any errors
      let message = 'Échec de la connexion';
      if (error.status === 401) {
        message = 'Email ou mot de passe incorrect';
      } else if (error.error?.message) {
        message = error.error.message;
      }
      return throwError(() => new Error(message));
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

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true }).pipe(
      catchError(error => {
        let message = 'Échec de l\'inscription';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
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
      catchError(error => {
        let message = 'Échec de l\'inscription';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/signout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.userNameSubject.next(null);
        this.userRoleSubject.next(null);
        this.userIdSubject.next(null);
        sessionStorage.removeItem('user_name');
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_id');
      }),
      catchError(error => {
        let message = 'Échec de la déconnexion';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refreshtoken`, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        this.logout().subscribe(); // Logout if refresh fails
        return throwError(() => new Error('Session expirée, veuillez vous reconnecter'));
      })
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private checkInitialAuthStatus(): void {
    const isAuthenticated = !!sessionStorage.getItem('user_name') && !!sessionStorage.getItem('user_role');
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