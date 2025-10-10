import {
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { SectionService } from '../../services/section.service';
import {
    DahsboardContent,
    DahsboardSection,
} from '../../models/section/section';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    NgbAccordionConfig,
    NgbAccordionModule,
    NgbModal,
    NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
    CoachingProgramStatus,
    ContentPassingRequirement,
    ContentType,
} from '../../models/program/programs';
import { SharedService } from '../../shared/shared.service';
import { ContentService } from '../../services/content.service';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export type DashboardSectionUI = DahsboardSection & {
    editingIndex: boolean;
    contents: DashboardContentUI[];
};
type DashboardContentUI = DahsboardContent & { editingIndex: boolean };

@Component({
    selector: 'app-program-sections',
    imports: [
        NgIf,
        ReactiveFormsModule,
        NgbModule,
        NgbAccordionModule,
        CommonModule,
        RouterLink,
        FormsModule,
    ],
    templateUrl: './program-sections.component.html',
    styleUrl: './program-sections.component.scss',
    providers: [NgbAccordionConfig],
})
export class ProgramSectionsComponent implements OnInit {
    ContentType = ContentType;
    ContentPassingRequirement = ContentPassingRequirement;

    @Input({ required: true }) programId!: number;
    @Input({ required: true }) programStatus!: CoachingProgramStatus;
    @ViewChild('sectionModal') sectionModalRef!: TemplateRef<any>;
    @ViewChild('contentModal') contentModal!: TemplateRef<any>;

    sections: DashboardSectionUI[] | null = null;
    sectionForm: FormGroup;
    mentorsEmails: string[] = [];

    contentForm!: FormGroup;
    selectedSectionId!: number;
    selectedFile: File | null = null;
    editingIndex?: number;
    fileError: string | null = null;
    @ViewChild('editSectionModal') editSectionModalRef!: TemplateRef<any>;
    editSectionForm!: FormGroup;
    addMentorForm!: FormGroup;
    editingSectionId: number | null = null;
    @ViewChild('addMentorModal') addMentorModalRef!: TemplateRef<any>;

    get programIsNotActive(): boolean {
        return this.programStatus !== CoachingProgramStatus.Active;
    }

    constructor(
        private sectionService: SectionService,
        private fb: FormBuilder,
        private modalService: NgbModal,
        config: NgbAccordionConfig,
        public sharedService: SharedService,
        private contentService: ContentService,
        private toastr: ToastrService
    ) {
        this.sectionForm = this.fb.group({
            sectionName: ['', Validators.required],
            sectionIndex: [null, [Validators.required, Validators.min(0)]],
        });

        this.editSectionForm = this.fb.group({
            sectionName: ['', Validators.required],
            sectionIndex: [null, [Validators.required, Validators.min(0)]],
        });

        this.contentForm = this.fb.group({
            title: ['', Validators.required],
            contentType: [null, Validators.required],
            contentUrl: [''],
            requiredEffort: ['', Validators.required],
            minutes: [null, [Validators.required, Validators.min(1)]],
            passingMark: [null, [Validators.min(0), Validators.max(100)]],
            index: [null, [Validators.required, Validators.min(0)]],
            textContent: [null],
            contentPassingRequirement: ['', Validators.required],
            isAiChatEnabled: [false],
            isInstructorChatEnabled: [false],
        });

        this.addMentorForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
        });

        config.closeOthers = true;
    }

    logFormStatus(): void {
        console.log('Form Valid:', this.contentForm.valid);

        Object.keys(this.contentForm.controls).forEach((controlName) => {
            const control = this.contentForm.get(controlName);
            console.log(
                `${controlName} => Value:`,
                control?.value,
                '| Valid:',
                control?.valid,
                '| Errors:',
                control?.errors
            );
        });

        console.log('File Error:', this.fileError);
    }

    ngOnInit(): void {
        this.getSections();
        this.getMentors();
        this.contentForm.valueChanges.subscribe(() => {
            this.logFormStatus();
        });
    }

    getMentors() {
        this.contentService.getCourseMentors(this.programId).subscribe({
            next: (response: string[] | undefined) => {
                if (response) {
                    this.mentorsEmails = response;
                }
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    openMentorModal() {
        this.addMentorForm.reset();
        this.modalService.open(this.addMentorModalRef, { centered: true });
        setTimeout(() => {
            const input = document.querySelector(
                '#mentorEmailInput'
            ) as HTMLElement;
            input?.focus();
        }, 100);
    }

    submitAddMentor(modal: any): void {
        if (this.addMentorForm.valid) {
            const email = this.addMentorForm.value.email;

            if (confirm(`هل أنت متأكد من إضافة المدرب بالبريد: ${email}؟`)) {
                this.contentService.addMentor(this.programId, email).subscribe({
                    next: (response) => {
                        this.toastr.success('تمت إضافة المدرب بنجاح');
                        modal.close();
                        this.getMentors();
                    },
                    error: (err) => {
                        this.toastr.error('فشل في إضافة المدرب');
                        console.error(err);
                    },
                });
            }
        }
    }

    getSections() {
        this.sectionService.getSectionsForDashboard(this.programId).subscribe({
            next: (response: DahsboardSection[] | undefined) => {
                this.sections = (response ?? []).map((section) => ({
                    ...section,
                    editingIndex: false,
                    contents: section.contents.map((content) => ({
                        ...content,
                        editingIndex: false,
                    })),
                }));
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    createContent(sectionId: number) {
        console.log(sectionId);
    }

    openSectionModal() {
        this.sectionForm.reset();
        this.modalService.open(this.sectionModalRef, { centered: true });
    }

    isSectionIndexValid(index: number, sectionId?: number): boolean {
        return !this.sections?.find(
            (section) => section.index == index && section.id !== sectionId
        );
    }

    openEditSectionModal(section: DashboardSectionUI) {
        this.editingSectionId = section.id;
        this.editSectionForm.patchValue({
            sectionName: section.name,
            sectionIndex: section.index,
        });

        this.modalService.open(this.editSectionModalRef, { centered: true });
    }

    submitEditSection(modal: any) {
        if (this.editSectionForm.valid && this.editingSectionId !== null) {
            const formValue = this.editSectionForm.value;

            if (
                !this.isSectionIndexValid(
                    formValue.sectionIndex,
                    this.editingSectionId
                )
            ) {
                this.toastr.error('لا يجب تكرار ترتيب القسم');
                return;
            }

            this.sectionService
                .updateSection(
                    this.editingSectionId,
                    formValue.sectionName,
                    formValue.sectionIndex
                )
                .subscribe({
                    next: () => {
                        modal.close();
                        this.getSections();
                    },
                    error: (err) => console.error(err),
                });
        }
    }

    isContentIndexValid(index: number, sectionId: number): boolean {
        return !this.sections?.find(
            (section) =>
                section.contents?.find((content) => content.index === index) &&
                section.id === sectionId
        );
    }

    onSubmit() {
        if (this.sectionForm.valid) {
            if (
                !this.isSectionIndexValid(this.sectionForm.value.sectionIndex)
            ) {
                this.toastr.error('لا يجب تكرار ترتيب الاقسام', 'Error');
                return;
            }

            const newSection = {
                name: this.sectionForm.value.sectionName,
                index: this.sectionForm.value.sectionIndex,
                programId: this.programId,
            };

            this.sectionService.createSection(newSection).subscribe({
                next: () => {
                    this.modalService.dismissAll();
                    this.getSections();
                },
                error: (err) => console.error(err),
            });
        }
    }

    openContentModal(sectionId: number) {
        this.selectedSectionId = sectionId;
        this.modalService.open(this.contentModal);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.selectedFile = input.files[0];
            this.fileError = this.sharedService.validateFile(
                this.selectedFile,
                [],
                500
            );
            
            this.contentForm.updateValueAndValidity();
        } else {
            this.selectedFile = null;
            this.fileError = null;
        }
    }

    onContentTypeChange(event: Event) {
        const selectedValue = +(event.target as HTMLSelectElement).value;

        const contentUrlControl = this.contentForm.get('contentUrl');
        const textContentControl = this.contentForm.get('textContent');
        
        // Clear ALL content-related fields first
        contentUrlControl?.clearValidators();
        contentUrlControl?.setValue(null);
        contentUrlControl?.setErrors(null);
        
        textContentControl?.clearValidators();
        textContentControl?.setValue(null);
        textContentControl?.setErrors(null);
        
        this.selectedFile = null;
        this.fileError = null;

        // Then set validators based on selected type
        if (selectedValue === ContentType.File || selectedValue === ContentType.Image) {
            // File/Image is required, URL and text are not
            // File validation will be done in onFileSelected and submitContent
        } else if (
            selectedValue === ContentType.Vimeo || 
            selectedValue === ContentType.YouTube || 
            selectedValue === ContentType.Website || 
            selectedValue === ContentType.Loom
        ) {
            // URL is required
            contentUrlControl?.setValidators([Validators.required]);
        } else if (selectedValue === ContentType.Text) {
            // Text content is required
            textContentControl?.setValidators([Validators.required]);
        }
        
        // Update validity for all controls
        contentUrlControl?.updateValueAndValidity();
        textContentControl?.updateValueAndValidity();
    }

    onPassingRequirementChange(event: Event) {
        const selectedValue = +(event.target as HTMLSelectElement).value;
        const passingMarkControl = this.contentForm.get('passingMark');
        const isInstructorChatEnabledControl = this.contentForm.get('isInstructorChatEnabled');

        // Clear validators and errors first
        passingMarkControl?.clearValidators();
        passingMarkControl?.setValue(null);
        passingMarkControl?.setErrors(null);

        // Then set validators based on selected requirement
        if (
            selectedValue === ContentPassingRequirement.Exam ||
            selectedValue === ContentPassingRequirement.AiExam
        ) {
            passingMarkControl?.setValidators([
                Validators.required,
                Validators.min(0),
                Validators.max(100)
            ]);
        }

        // If Comment is selected, enable instructor chat automatically
        if (selectedValue === ContentPassingRequirement.Comment) {
            isInstructorChatEnabledControl?.setValue(true);
        }

        passingMarkControl?.updateValueAndValidity();
    }

    // Add this new method to handle instructor chat toggle
    onInstructorChatToggle(event: Event) {
        const checkbox = event.target as HTMLInputElement;
        const currentPassingRequirement = this.contentForm.get('contentPassingRequirement')?.value;
        
        // If trying to turn OFF instructor chat while Comment is selected
        debugger
        if (!checkbox.checked && currentPassingRequirement == ContentPassingRequirement.Comment) {
            // Prevent the change
            event.preventDefault();
            checkbox.checked = true;
            this.contentForm.get('isInstructorChatEnabled')?.setValue(true);
            
            // Show warning message
            this.toastr.warning(
                'لا يمكن إيقاف الدردشة مع المدرب عندما يكون متطلب الاجتياز هو التعليق. يجب السماح للمتدرب بالتعليق.',
                'تنبيه'
            );
        }
    }

    submitContent(modal: any) {
        let sectionId = this.selectedSectionId;

        if (
            !this.isContentIndexValid(this.contentForm.value.index, sectionId)
        ) {
            this.toastr.error('لا يجب تكرار ترتيب المحتويات', 'Error');
            return;
        }

        const form = this.contentForm.value;
        
        // Validate based on content type
        if (form.contentType === ContentType.File || form.contentType === ContentType.Image) {
            if (!this.selectedFile) {
                this.toastr.error('يجب اختيار ملف', 'Error');
                return;
            }
            if (this.fileError) {
                this.toastr.error(this.fileError, 'Error');
                return;
            }
        } else if (
            form.contentType === ContentType.Vimeo || 
            form.contentType === ContentType.YouTube || 
            form.contentType === ContentType.Website || 
            form.contentType === ContentType.Loom
        ) {
            if (!form.contentUrl) {
                this.toastr.error('يجب إدخال رابط المحتوى', 'Error');
                return;
            }
        } else if (form.contentType === ContentType.Text) {
            if (!form.textContent) {
                this.toastr.error('يجب إدخال المحتوى النصي', 'Error');
                return;
            }
        }
        
        // Validate passing mark if required
        if (
            (form.contentPassingRequirement === ContentPassingRequirement.Exam ||
            form.contentPassingRequirement === ContentPassingRequirement.AiExam) &&
            (form.passingMark === null || form.passingMark === undefined)
        ) {
            this.toastr.error('يجب إدخال درجة النجاح', 'Error');
            return;
        }

        // Check if form is valid
        if (!this.contentForm.valid) {
            this.toastr.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'Error');
            return;
        }

        const formData = new FormData();
        
        // Append required fields with null checks
        if (sectionId !== null && sectionId !== undefined) {
            formData.append('SectionId', sectionId.toString());
        }
        
        if (form.title) {
            formData.append('Title', form.title);
        }
        
        if (form.contentType !== null && form.contentType !== undefined) {
            formData.append('ContentType', form.contentType.toString());
        }
        
        if (form.requiredEffort) {
            formData.append('RequiredEffort', form.requiredEffort);
        }
        
        if (form.minutes !== null && form.minutes !== undefined) {
            formData.append('Minutes', form.minutes.toString());
        }
        
        if (form.index !== null && form.index !== undefined) {
            formData.append('Index', form.index.toString());
        }
        
        if (form.contentPassingRequirement !== null && form.contentPassingRequirement !== undefined) {
            formData.append('ContentPassingRequirement', form.contentPassingRequirement.toString());
        }

        formData.append('IsAiChatEnabled', (form.isAiChatEnabled || false).toString());
        formData.append('IsInstructorChatEnabled', (form.isInstructorChatEnabled || false).toString());

        // Append optional fields
        if (form.passingMark !== null && form.passingMark !== undefined) {
            formData.append('PassingMark', form.passingMark.toString());
        }
        
        if (form.textContent) {
            formData.append('TextContent', form.textContent);
        }
        
        if (form.contentUrl) {
            formData.append('ContentUrl', form.contentUrl);
        }
        
        if (this.selectedFile) {
            formData.append('ContentFile', this.selectedFile);
        }

        this.contentService.createContent(formData).subscribe({
            next: () => {
                modal.close();
                this.getSections();
                this.contentForm.reset();
                this.selectedFile = null;
                this.fileError = null;
                this.selectedSectionId = 0;
            },
            error: (err) => console.error(err),
        });
    }
}