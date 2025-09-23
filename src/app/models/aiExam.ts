export interface GenerateQuestionsRequest {
  contentId: number; // Changed from lectureText to contentId
}

export interface EvaluateAnswerRequest {
  contentId: number; // Changed from lectureText to contentId
  question: string;
  studentAnswer: string;
}

export interface FinalEvaluationRequest {
  contentId: number; // Changed from lectureText to contentId
  answers: StudentAnswer[];
}

export interface StudentAnswer {
  question: string;
  answer: string;
}

export interface EvaluationResponse {
  score: number;
  feedback: string;
}

export interface FinalEvaluationResponse {
  nextContentId: number;
  finalScore: number;
  feedback: string;

}

export interface QuestionResponse {
  questions: string[];
}