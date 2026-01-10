import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QuizResponse } from 'src/models/Quiz-response.model';
import { Quiz } from 'src/models/Quiz.model';
import { Question } from 'src/models/Question.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:9090/api/quiz';

  constructor(private http: HttpClient) {}

  // Create a new quiz
  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/create`, quiz, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Add a question to a quiz
  addQuestionToQuiz(quizId: number, question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/${quizId}/question`, question, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Get a quiz by ID
  getQuiz(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${quizId}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Submit a quiz response
  submitResponse(response: QuizResponse): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(`${this.apiUrl}/response`, response, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
      }
    }
    console.error('Quiz Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}