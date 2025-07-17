import { Component } from '@angular/core';
import {
    CreateQuestionsCommand,
    Question,
    QuestionResponse,
} from '../../models/question/question';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { validateHeaderName } from 'http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-create-question',
    imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, InnerPageBannerComponent],
    templateUrl: './create-question.component.html',
    styleUrl: './create-question.component.scss',
})
export class CreateQuestionComponent {
    form: FormGroup;
    contentId: number;
    loadedquestions: QuestionResponse[] | null = null;
  
    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private questionService: QuestionService,
      private router: Router,
      private spinner: NgxSpinnerService
    ) {
      this.contentId = Number(this.route.snapshot.paramMap.get('id'));
      this.form = this.fb.group({
        questions: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      });
      this.loadQuestions();
    }
  
    get questions(): FormArray {
      return this.form.get('questions') as FormArray;
    }
  
    getChoices(qIndex: number): FormArray {
      return this.questions.at(qIndex).get('choices') as FormArray;
    }
  
    loadQuestions(): void {
      ;
      // remove all the existing questions from form and loaded questions
      this.loadedquestions = null;
      this.questions.clear();
      
      this.questionService.getContentQuestions(this.contentId).subscribe({
        next: (questions: QuestionResponse[] | undefined) => {
          this.loadedquestions = questions ?? [];
          this.loadedquestions.forEach((q) => {
            const questionGroup = this.createQuestion(q.description, q.mark, q.id);
            const choicesFormArray = questionGroup.get('choices') as FormArray;
  
            q.choices.forEach((choice) => {
              choicesFormArray.push(
                this.createChoice(choice.optionContent, choice.isCorrectAnswer, choice.id)
              );
            });
  
            this.questions.push(questionGroup);
          });
        },
        error: (err) => {
          console.error('Error loading questions', err);
        },
      });
    }
  
    createQuestion(description = '', mark = 1, id: number | null = null): FormGroup {
      const group = this.fb.group({
        id: [id],
        description: [description, Validators.required],
        mark: [mark, [Validators.required, Validators.min(1)]],
        choices: this.fb.array([], [Validators.required, this.atLeastTwoChoices(), this.onlyOneCorrectAnswer()]),
      });
  
      return group;
    }
  
    createChoice(
      optionContent = '',
      isCorrectAnswer = false,
      id: string | null = null
    ): FormGroup {
      return this.fb.group({
        id: [id],
        optionContent: [optionContent, Validators.required],
        isCorrectAnswer: [isCorrectAnswer],
      });
    }
  
    addQuestion() {
      this.questions.push(this.createQuestion());
    }
  
    removeQuestion(index: number) {
      this.questions.removeAt(index);
    }
  
    addChoice(qIndex: number) {
      this.getChoices(qIndex).push(this.createChoice());
    }
  
    removeChoice(qIndex: number, cIndex: number) {
      this.getChoices(qIndex).removeAt(cIndex);
    }
  
    atLeastTwoChoices(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const array = control as FormArray;
        return array.length >= 2 ? null : { minChoices: true };
      };
    }
  
    onlyOneCorrectAnswer(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const choices = (control as FormArray).value;
        const correctCount = choices.filter((c: any) => c.isCorrectAnswer).length;
        return correctCount === 1 ? null : { singleCorrect: true };
      };
    }
    setCorrectAnswer(questionIndex: number, choiceIndex: number) {
        const choices = this.getChoices(questionIndex);
        for (let i = 0; i < choices.length; i++) {
          const choice = choices.at(i);
          choice.get('isCorrectAnswer')?.setValue(i === choiceIndex);
        }
      }
      
    onSubmit() {
      if (this.form.invalid || this.contentId <= 0) {
        this.form.markAllAsTouched();
        return;
      }
  
      const requestBody: CreateQuestionsCommand = {
        contentId: this.contentId,
        questions: this.form.value.questions,
      };
  
      this.questionService.createQuestion(requestBody).subscribe({
        next: () => this.loadQuestions(),
        error: (error) => console.error(error),
      });
    }
}
