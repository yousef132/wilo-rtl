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

    contentForm!: FormGroup;
    selectedSectionId!: number;
    selectedFile: File | null = null;
    editingIndex?: number;
    fileError: string | null = null;
    @ViewChild('editSectionModal') editSectionModalRef!: TemplateRef<any>;
    editSectionForm!: FormGroup;
    editingSectionId: number | null = null;

    get programIsNotActive():boolean {
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
            passingMark: [null],
            index: [null, [Validators.required, Validators.min(0)]],
            textContent: [''],
            contentPassingRequirement: ['', Validators.required],
        });

        config.closeOthers = true;
    }

    ngOnInit(): void {
        this.getSections();
    }

    getSections() {
        this.sectionService.getSectionsForDashboard(this.programId).subscribe({
            next: (response: DahsboardSection[] | undefined) => {
                this.sections = (response ?? []).map((section) => ({
                    ...section,
                    editingIndex: false, // UI field
                    contents: section.contents.map((content) => ({
                        ...content,
                        editingIndex: false, // UI field
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
        this.sectionForm.reset(); // reset before opening
        this.modalService.open(this.sectionModalRef, { centered: true });
    }

    isSectionIndexValid(index: number, sectionId?: number): boolean {
        debugger;
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
            debugger;
            const formValue = this.editSectionForm.value;

            // validate no duplicate index
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
                .updateSection(this.editingSectionId, formValue.sectionName, formValue.sectionIndex)
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
        // return !this.sections?.find(
        //     (section) => section.contents.find((content) => content.index == index)
        // );
        return !this.sections?.find(
            (section) =>
                section.contents?.find((content) => content.index === index) &&
                section.id === sectionId
        );
    }
    onSubmit() {
        if (this.sectionForm.valid) {
            // check if duplicate section index
            debugger;
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
                    this.getSections(); // refresh the section list
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
        }
    }

    onContentTypeChange(event: Event) {
        const selectedValue = +(event.target as HTMLSelectElement).value;

        const contentUrlControl = this.contentForm.get('contentUrl');
        if (selectedValue === ContentType.File) {
            // ✅ File is required, URL is not
            contentUrlControl?.clearValidators();
            contentUrlControl?.setValue(null);
            contentUrlControl?.updateValueAndValidity();
        } else {
            // ✅ URL is required, File is not
            contentUrlControl?.setValidators([Validators.required]);
            contentUrlControl?.updateValueAndValidity();

            this.selectedFile = null;
        }
    }

    onPassingRequirementChange(event: Event) {
        const selectedValue = +(event.target as HTMLSelectElement).value;
        const passingMarkControl = this.contentForm.get('passingMark');

        // If the selected value is 'Exam', make passing mark required
        if (selectedValue === ContentPassingRequirement.Exam) {
            passingMarkControl?.setValidators([Validators.required]);
        } else {
            passingMarkControl?.clearValidators();
            passingMarkControl?.setValue(null); // Optional: clear value when not required
        }

        passingMarkControl?.updateValueAndValidity();
    }

    submitContent(modal: any) {
        let sectionId = this.selectedSectionId;
        // check for content index duplication
        debugger;
        if (
            !this.isContentIndexValid(this.contentForm.value.index, sectionId)
        ) {
            this.toastr.error('لا يجب تكرار ترتيب المحتويات', 'Error');
            return;
        }

        const formData = new FormData();
        const form = this.contentForm.value;
        formData.append('SectionId', sectionId.toString());
        formData.append('Title', form.title);
        formData.append('ContentType', form.contentType.toString());
        formData.append('RequiredEffort', form.requiredEffort);
        formData.append('Minutes', form.minutes.toString());
        formData.append('Index', form.index.toString());
        formData.append(
            'ContentPassingRequirement',
            form.contentPassingRequirement.toString()
        );

        if (form.passingMark) formData.append('PassingMark', form.passingMark);
        if (form.textContent) formData.append('TextContent', form.textContent);
        if (form.contentUrl) formData.append('ContentUrl', form.contentUrl);
        if (this.selectedFile)
            formData.append('ContentFile', this.selectedFile);

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

        // this.http.post('/api/content', formData).subscribe(() => {
        //   modal.close();
        //   // Optionally: refresh content list for the section
        // });
    }

    // deleteSection(sectionId: number) {
    //     console.log('Delete section', sectionId);
    // }
    // editSection(sectionId: number) {}
    // deleteContent(contentId: number) {}

    // addQuestion(contentId: number) {
    //     // logic for adding a question
    // }

    // saveSectionIndex(section: DashboardSectionUI) {
    //     if (!this.isSectionIndexValid(section.index, section.id)) {
    //         this.toastr.error('لا يجب تكرار ترتيب القسم');
    //         return;
    //     }
    //     this.sectionService
    //         .updateSectionIndex(section.id, section.index, this.programId)
    //         .subscribe({
    //             next: () => {
    //                 section.editingIndex = false;

    //                 // order the sections with new index
    //                 this.sections?.sort((a, b) => a.index - b.index);
    //             },
    //             error: (err) => console.error(err),
    //         });
    // }

    // saveContentIndex(section: DahsboardSection, content: DahsboardContent) {
    //     this.contentService.updateContentIndex(content.id, content.index).subscribe({
    //         next: () => {
    //             content.editingIndex = false;
    //             this.toastr.success('تم تحديث ترتيب المحتوى');
    //         },
    //         error: (err) => console.error(err)
    //     });
    // }
}
