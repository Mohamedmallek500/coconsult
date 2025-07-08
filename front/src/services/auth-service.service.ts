import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/models/User.model';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private baseUrl = 'http://localhost:9090/api/auth'; // Corrigé pour correspondre au backend

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, { email, password }, {
      withCredentials: true
    });
  }

  registerPatient(user: User, image: File | null = null): Observable<any> {
    const formData = new FormData();
    
    // Préparer le payload JSON
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

    // Ajouter le payload JSON au form-data
    formData.append('signUpRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    // Ajouter l'image si elle existe
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
    
    // Préparer le payload JSON
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

    // Ajouter le payload JSON au form-data
    formData.append('signUpRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    // Ajouter l'image si elle existe
    if (image) {
      formData.append('image', image);
    }

    return this.http.post(`${this.baseUrl}/signup`, formData, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de l\'inscription')))
      );
  }
}