import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/models/User.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:9090/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 0, size: number = 10): Observable<{ content: User[], totalPages: number }> {
    return this.http.get<{ content: User[], totalPages: number }>(`${this.baseUrl}?page=${page}&size=${size}`, { withCredentials: true });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

createUser(user: User, image?: File): Observable<{ message: string }> {
  if (image) {
    const formData = new FormData();
    // Map User to UserRequest-compatible object
    const userRequest = {
      ...user,
      roles: user.role ? [user.role] : [], // Convert role to roles array
      dossierfile: user.dossierfile ? user.dossierfile.map(item => typeof item === 'number' ? item : item.id) : []
    };
    formData.append('userRequest', new Blob([JSON.stringify(userRequest)], { type: 'application/json' }));
    formData.append('image', image);
    return this.http.post<{ message: string }>(`${this.baseUrl}`, formData, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la création')))
      );
  } else {
    const userRequest = {
      ...user,
      roles: user.role ? [user.role] : [],
      dossierfile: user.dossierfile ? user.dossierfile.map(item => typeof item === 'number' ? item : item.id) : []
    };
    return this.http.post<{ message: string }>(`${this.baseUrl}`, userRequest, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la création')))
      );
  }
}

updateUser(id: number, user: User, image?: File): Observable<{ message: string }> {
  if (image) {
    // Update with image (multipart request)
    const formData = new FormData();
    // Map User to UserRequest-compatible object
    const userRequest = {
      ...user,
      roles: user.role ? [user.role] : [], // Convert role to roles array
      dossierfile: user.dossierfile ? user.dossierfile.map(item => typeof item === 'number' ? item : item.id) : []
    };
    formData.append('userRequest', new Blob([JSON.stringify(userRequest)], { type: 'application/json' }));
    formData.append('image', image);
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, formData, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la mise à jour')))
      );
  } else {
    // Update without image (JSON request)
    const userRequest = {
      ...user,
      roles: user.role ? [user.role] : [],
      dossierfile: user.dossierfile ? user.dossierfile.map(item => typeof item === 'number' ? item : item.id) : []
    };
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, userRequest, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la mise à jour')))
      );
  }
}


updateUserImage(id: number, image: File): Observable<{ message: string }> {
  const formData = new FormData();
  formData.append('image', image);
  return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/image`, formData, { withCredentials: true })
    .pipe(
      catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la mise à jour de l\'image')))
    );
}
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  approveDoctor(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`http://localhost:9090/api/auth/approve-doctor/${id}`, {}, { withCredentials: true });
  }

  refuseDoctor(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`http://localhost:9090/api/auth/refuse-doctor/${id}`, {}, { withCredentials: true });
  }

  searchDoctors(
    nom?: string,
    prenom?: string,
    speciality?: string,
    adresse?: string,
    page: number = 0,
    size: number = 10
  ): Observable<User[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nom) params = params.set('nom', nom);
    if (prenom) params = params.set('prenom', prenom);
    if (speciality) params = params.set('speciality', speciality);
    if (adresse) params = params.set('adresse', adresse);

    return this.http.get<User[]>(`http://localhost:9090/api/doctors/search`, { params, withCredentials: true });
  }

  getAllSpecialities(): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:9090/api/doctors/specialities`, { withCredentials: true })
      .pipe(
        catchError(error => throwError(() => new Error(error.error?.message || 'Échec de la récupération des spécialités')))
      );
  }
}
