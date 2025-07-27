import { Question } from "./Question.model";

export interface QuizResponse {
  quizId: number;
  questionId: number;
  responseText: string;
  followUpQuestions?: Question[];
  nextQuestion?: Question;
}