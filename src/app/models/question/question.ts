
  
  export interface Question {
    content: string;
    mark: number;
    correctAnswerIndex: number;
    choices: Choice[];
  }

  export interface CreateQuestionsCommand {
    contentId: number;
    questions: CreateQuestionDto[];
  }
  
  export interface CreateQuestionDto {
    description: string;
    mark: number;
    id?:number;
    choices: Choice[];
  }
  
  export interface Choice {
    isCorrectAnswer: boolean;
    optionContent: string;
    id?:string;
  }
  
  export interface ChoiceResponse {
    id: string;
    optionContent: string;
    isCorrectAnswer?:boolean;
  }
  
  export interface QuestionResponse {
    id: number;
    question: string;
    description: string;
    mark: number;
    choices: ChoiceResponse[];
  }
  
  export interface SubmitQuestions{
    contentId: number;
    submissions: AnswerSubmission[];
  }
  export interface AnswerSubmission {
    questionId: number;
    choiceId: string;
  }