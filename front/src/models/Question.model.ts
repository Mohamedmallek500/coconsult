export interface Question {
  id?: number;
  content: string;
  type: QuestionType;
  options?: string[];
  parentQuestionId?: number;
  parentAnswer?: string;
  followUpQuestions?: Question[];
}

export enum QuestionType {
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT'
}