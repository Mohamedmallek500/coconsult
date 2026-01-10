import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/services/quiz.service';
import { Quiz } from 'src/models/Quiz.model';
import { Question, QuestionType } from 'src/models/Question.model';
import { QuizResponse } from 'src/models/Quiz-response.model';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  quiz: Quiz | null = null;
  currentQuestion: Question | null = null;
  currentQuestionIndex: number = 0;
  userResponse: string = '';
  isLoading: boolean = false;
  error: string = '';
  isQuizCompleted: boolean = false;
  responses: any[] = [];
  showFollowUp: boolean = false;
  followUpQuestions: Question[] = [];
  currentFollowUpIndex: number = 0;
  
  // For multiple choice and yes/no questions
  selectedOption: string = '';
  
  // Question types enum for template
  QuestionType = QuestionType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
  const quizId = this.route.snapshot.paramMap.get('id');
  console.log('Quiz ID from route:', quizId); // Debug
  if (quizId && !isNaN(+quizId)) {
    this.loadQuiz(+quizId);
  } else {
    this.error = 'ID du quiz invalide';
    this.isLoading = false;
  }
}

 loadQuiz(quizId: number): void {
  this.isLoading = true;
  this.error = '';
  console.log('Loading quiz with ID:', quizId); // Debug
  this.quizService.getQuiz(quizId).subscribe({
    next: (quiz) => {
      console.log('Quiz loaded:', quiz); // Debug
      this.quiz = quiz;
      if (quiz.questions && quiz.questions.length > 0) {
        this.currentQuestion = quiz.questions[0];
        this.currentQuestionIndex = 0;
        console.log('Current question set:', this.currentQuestion); // Debug
      } else {
        console.log('No questions found in quiz'); // Debug
        this.error = 'Aucune question disponible dans ce quiz';
      }
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Quiz load error:', error); // Debug
      this.error = 'Erreur lors du chargement du quiz: ' + error.message;
      this.isLoading = false;
    }
  });
}

  submitResponse(): void {
    if (!this.currentQuestion || !this.quiz) {
      return;
    }

    // Validate response
    if (!this.validateResponse()) {
      return;
    }

    const response: QuizResponse = {
      quizId: this.quiz.id!,
      questionId: this.currentQuestion.id!,
      responseText: this.getResponseText()
    };

    this.isLoading = true;
    this.error = '';

    this.quizService.submitResponse(response).subscribe({
      next: (result) => {
        // Store the response
        this.responses.push({
          questionId: this.currentQuestion!.id,
          question: this.currentQuestion!.content,
          response: this.getResponseText()
        });

        // Handle follow-up questions
        if (result.followUpQuestions && result.followUpQuestions.length > 0) {
          this.followUpQuestions = result.followUpQuestions;
          this.currentFollowUpIndex = 0;
          this.showFollowUp = true;
          this.currentQuestion = result.followUpQuestions[0];
        } else if (result.nextQuestion) {
          // Move to next main question
          this.currentQuestion = result.nextQuestion;
          this.currentQuestionIndex++;
          this.showFollowUp = false;
        } else {
          // Quiz completed
          this.isQuizCompleted = true;
        }

        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la soumission: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  validateResponse(): boolean {
    const responseText = this.getResponseText();
    
    if (!responseText || responseText.trim() === '') {
      this.error = 'Veuillez fournir une réponse';
      return false;
    }

    if (this.currentQuestion!.type === QuestionType.YES_NO) {
      if (!['Yes', 'No'].includes(responseText)) {
        this.error = 'Veuillez sélectionner Oui ou Non';
        return false;
      }
    }

    if (this.currentQuestion!.type === QuestionType.MULTIPLE_CHOICE) {
      if (this.currentQuestion!.options && !this.currentQuestion!.options.includes(responseText)) {
        this.error = 'Veuillez sélectionner une option valide';
        return false;
      }
    }

    this.error = '';
    return true;
  }

  getResponseText(): string {
    if (this.currentQuestion!.type === QuestionType.TEXT) {
      return this.userResponse.trim();
    } else {
      return this.selectedOption;
    }
  }

  resetForm(): void {
    this.userResponse = '';
    this.selectedOption = '';
  }

  nextFollowUp(): void {
    if (this.currentFollowUpIndex < this.followUpQuestions.length - 1) {
      this.currentFollowUpIndex++;
      this.currentQuestion = this.followUpQuestions[this.currentFollowUpIndex];
      this.resetForm();
    }
  }

  restartQuiz(): void {
    this.isQuizCompleted = false;
    this.responses = [];
    this.currentQuestionIndex = 0;
    this.showFollowUp = false;
    this.followUpQuestions = [];
    this.currentFollowUpIndex = 0;
    
    if (this.quiz && this.quiz.questions && this.quiz.questions.length > 0) {
      this.currentQuestion = this.quiz.questions[0];
    }
    
    this.resetForm();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getProgressPercentage(): number {
    if (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0) {
      return 0;
    }
    
    return Math.round(((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100);
  }

  hasValidResponse(): boolean {
    if (this.currentQuestion?.type === QuestionType.TEXT) {
      return this.userResponse.trim().length > 0;
    } else {
      return this.selectedOption.length > 0;
    }
  }

  getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.YES_NO:
        return 'Oui/Non';
      case QuestionType.MULTIPLE_CHOICE:
        return 'Choix Multiple';
      case QuestionType.TEXT:
        return 'Texte Libre';
      default:
        return 'Inconnu';
    }
  }

  getOptionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
}