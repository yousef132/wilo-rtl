import {
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import {
    ContentPassingRequirement,
    ContentType,
} from '../../models/program/programs';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ContentData } from '../../models/content/content';
import { SharedService } from '../../shared/shared.service';
import { ContentService } from '../../services/content.service';
import { JsonPipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';


@Component({
    selector: 'app-content-dashboard',
    imports: [InnerPageBannerComponent, NgIf, ReactiveFormsModule, FormsModule,RouterLink],
    templateUrl: './content-dashboard.component.html',
    styleUrl: './content-dashboard.component.scss',
})
export class ContentDashboardComponent implements OnInit {
    contentId!: number;
    @ViewChild('editContentModal') editContentModal!: TemplateRef<any>;

    ContentType = ContentType;
    ContentPassingRequirement = ContentPassingRequirement;
    oldContentUrl! :string;
    contentForm!: FormGroup;
    selectedFile: File | null = null;
    fileError: string | null = null;
    isLoading = false;
    contentData: ContentData | null = null;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        public sharedService: SharedService,
        private contentService: ContentService,
        private route: ActivatedRoute
    ) {
        // get id from route
        this.contentId = this.route.snapshot.params['id'];
    }

    ngOnInit(): void {
        this.getContentData();
    }

    private initializeForm(): void {
        this.contentForm = this.fb.group({
            title: [this.contentData?.title, Validators.required],
            contentType: [this.contentData?.contentType, Validators.required],
            contentUrl: [this.contentData?.contentUrl],
            requiredEffort: [
                this.contentData?.requiredEffort,
                Validators.required,
            ],
            minutes: [
                this.contentData?.minutes,
                [Validators.required, Validators.min(1)],
            ],
            passingMark: [this.contentData?.passMark],
            index: [
                this.contentData?.index,
                [Validators.required, Validators.min(0)],
            ],
            textContent: [this.contentData?.contentText],
            contentPassingRequirement: [
                this.contentData?.contentPassingRequirement,
                Validators.required,
            ],
        });
    }

    getContentData(): void {
        this.isLoading = true;
        this.contentService.getContentForEdit(this.contentId).subscribe({
            next: (response: ContentData | undefined) => {
                if (response) {
                    this.contentData = response;
                    this.oldContentUrl = this.contentData.contentUrl!;
                }
                this.initializeForm();

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching content data:', error);
                this.isLoading = false;
            },
        });
    }

    private populateForm(): void {
        if (!this.contentData) return;

        this.contentForm.patchValue({
            title: this.contentData.title,
            contentType: this.contentData.contentType,
            contentUrl: this.contentData.contentUrl || '',
            requiredEffort: this.contentData.requiredEffort,
            minutes: this.contentData.minutes,
            passingMark: this.contentData.passMark,
            index: this.contentData.index,
            textContent: this.contentData.contentText || '',
            contentPassingRequirement:
                this.contentData.contentPassingRequirement,
        });

        // Set up conditional validators based on current values
        this.setupConditionalValidators();
    }

    private setupConditionalValidators(): void {
        if (!this.contentData) return;

        // Set up content URL validation based on content type
        const contentUrlControl = this.contentForm.get('contentUrl');
        if (this.contentData.contentType === ContentType.File) {
            contentUrlControl?.clearValidators();
        } else {
            contentUrlControl?.setValidators([Validators.required]);
        }
        contentUrlControl?.updateValueAndValidity();

        // Set up passing mark validation based on passing requirement
        const passingMarkControl = this.contentForm.get('passingMark');
        if (
            this.contentData.contentPassingRequirement ===
            ContentPassingRequirement.Exam
        ) {
            passingMarkControl?.setValidators([Validators.required]);
        } else {
            passingMarkControl?.clearValidators();
        }
        passingMarkControl?.updateValueAndValidity();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.selectedFile = input.files[0];
            this.fileError = this.sharedService.validateFile(
                this.selectedFile,
                [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    'image/svg',
                    'image/webp',
                    'application/pdf',
                    'video/mp4',
                    'video/avi',
                    'video/mov',
                ],
                500 // 500MB limit
            );
        }
    }

    onContentTypeChange(event: Event) {
        const selectedValue = +(event.target as HTMLSelectElement).value;

        const contentUrlControl = this.contentForm.get('contentUrl');
        if (selectedValue === ContentType.File) {
            // File is required, URL is not
            contentUrlControl?.clearValidators();
            contentUrlControl?.setValue(null);
            contentUrlControl?.updateValueAndValidity();

        } else {
            // URL is required, File is not
            contentUrlControl?.setValidators([Validators.required]);
            contentUrlControl?.updateValueAndValidity();
            contentUrlControl?.setValue(null);;

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

    onSubmit(): void {
        if (!this.contentForm.valid || !this.contentData) return;
        
        this.isSubmitting = true;
        const formData = new FormData();
        const form = this.contentForm.value;
        // form.contentUrl = this.oldContentUrl;

        // Add content ID for update
        formData.append('Id', this.contentData.id.toString());
        formData.append('Title', form.title);
        formData.append('ContentType', form.contentType.toString());
        formData.append('RequiredEffort', form.requiredEffort);
        formData.append('Minutes', form.minutes.toString());
        formData.append('Index', form.index.toString());
        formData.append(
            'ContentPassingRequirement',
            form.contentPassingRequirement.toString()
        );
        
        if (form.passingMark && form.contentPassingRequirement == ContentPassingRequirement.Exam)
            formData.append('PassMark', form.passingMark.toString());
        if (form.textContent) formData.append('ContentText', form.textContent);
        if (form.contentUrl) formData.append('ContentUrl', form.contentUrl);
        if (this.selectedFile)
            formData.append('File', this.selectedFile);
        
        if(form.contentType == ContentType.File && !this.selectedFile)
            formData.append('ContentUrl', this.oldContentUrl);  
          

        this.contentService.updateContent(formData).subscribe({
            next: () => {
                this.getContentData();
                this.populateForm();
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Error updating content:', err);
                this.isSubmitting = false;
            },
        });
    }

    resetForm(): void {
        this.populateForm(); // Reset to original data
        this.selectedFile = null;
        this.fileError = null;
    }
}
