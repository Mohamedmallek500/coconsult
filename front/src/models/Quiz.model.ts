import { Question } from "./Question.model";

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  questions: Question[];
}