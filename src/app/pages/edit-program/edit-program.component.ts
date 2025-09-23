import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    CoachingProgramStatus,
    ProgramDetailsForUpdate,
} from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';
import { SharedService } from '../../shared/shared.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { JsonPipe, NgIf } from '@angular/common';
import { debug, warn } from 'console';

@Component({
    selector: 'app-edit-program',
    imports: [NgxSpinnerModule, ReactiveFormsModule, NgIf,JsonPipe],
    templateUrl: './edit-program.component.html',
    styleUrl: './edit-program.component.scss',
})
export class EditProgramComponent implements OnInit {
    programDetails: ProgramDetailsForUpdate | null = null;
    CoachingProgramStatus = CoachingProgramStatus;
    programForm!: FormGroup;
    coverImage: File | null = null;
    certificateTemplateFile: File | null = null;
    fileErrorMessage: string | null = null;
    previewImageUrl: string | null = null;
    previewCertificateUrl: string | null = null;
    @Input({ required: true }) programId: number = 0;
    @Output() statusEmitter: EventEmitter<CoachingProgramStatus> =
        new EventEmitter();
    constructor(
        private programService: ProgramsService,
        private fb: FormBuilder,
        private sharedService: SharedService,
        private spinner: NgxSpinnerService
    ) {}
    ngOnInit(): void {
        this.getDetails();
    }

    getDetails() {
        this.programService
            .getProgramDetailsForDashboard(this.programId)
            .subscribe({
                next: (response: ProgramDetailsForUpdate | undefined) => {
                    this.programDetails = response || null;
                    this.statusEmitter.emit(response?.status);
                    this.initializeForm();
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }
    hasChanges(): boolean {
        const formChanged = this.programForm.dirty;
        const imageChanged = this.coverImage != null;
        const certificateChanged = this.certificateTemplateFile!=null;
        return formChanged || imageChanged || certificateChanged;
    }

    private handleFileChange(
        event: Event,
        allowedTypes: string[],
        maxSizeKb: number,
        onValidFile: (file: File, previewUrl: string) => void
    ) {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) return;

        const file = input.files[0];
        const message = this.sharedService.validateFile(
            file,
            allowedTypes,
            maxSizeKb
        );

        this.fileErrorMessage = message;

        if (!message) {
            const reader = new FileReader();
            reader.onload = () => {
                onValidFile(file, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    onFileChange(event: Event) {
        this.handleFileChange(
            event,
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            500,
            (file, previewUrl) => {
                this.coverImage = file;
                this.previewImageUrl = previewUrl;
            }
        );
    }

    onCertificateFileChange(event: Event) {
        this.handleFileChange(
            event,
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            5000,
            (file, previewUrl) => {
                this.certificateTemplateFile = file;
                this.previewCertificateUrl = previewUrl;
            }
        );
    }

    initializeForm() {
        const isActive =
            this.programDetails?.status === CoachingProgramStatus.Active;
        this.programForm = this.fb.group({
            title: [this.programDetails?.title, Validators.required],
            details: [this.programDetails?.details, Validators.required],
            duration: [
                this.programDetails?.duration,
                [Validators.required, Validators.min(1)],
            ],
            // price: [
            //     this.programDetails?.price,
            //     [Validators.required, Validators.min(0)],
            // ],
            status: [
                { value: this.programDetails?.status, disabled: isActive },
                Validators.required,
            ],

            secretKey: [this.programDetails?.secretKey, Validators.required],
        });
    }
    onEditingProgramStatus(event: Event) {
        const newValue = (event.target as HTMLSelectElement).value;

        const status = +newValue; // convert to number if you're using an enum

        if (status === CoachingProgramStatus.Active) {
            const confirmed = confirm(
                'احذر! لن تتمكن من إضافة المزيد من الأقسام أو المحتوى أو تعديل الترتيب بعد تفعيل البرنامج، ولا يمكنك التراجع عن هذا الإجراء. هل أنت متأكد؟'
            );

            if (!confirmed) {
                this.programForm.patchValue({
                    status: CoachingProgramStatus.InActive,
                });
            }
        }
    }

    onSubmit() {
        if (this.programForm.invalid) return;

        // display warning dialog that he can't add sections or contents more or even editing the index
        // if the program is active

        const formData = new FormData();
        const rawValues = this.programForm.getRawValue(); // includes disabled fields
        // Append text fields
        formData.append('programId', this.programId.toString());
        formData.append('secretKey', this.programForm.value.secretKey); // add if needed
        formData.append('title', this.programForm.value.title);
        formData.append('details', this.programForm.value.details);
        formData.append('duration', this.programForm.value.duration.toString());
        // formData.append('price', this.programForm.value.price.toString());
        formData.append('status', rawValues.status.toString());

        // Append file only if changed
        if (this.coverImage) {
            formData.append('cover', this.coverImage);
        }
        if (this.certificateTemplateFile) {
            formData.append(
                'certificateTemplate',
                this.certificateTemplateFile
            );
        }
         

        this.programService.updateProgramDetails(formData).subscribe({
            next: (response:ProgramDetailsForUpdate | undefined) => {
                if(response){
                    this.programDetails = response;
                }
            },
            error: (error) => console.error(error),
        });
    }
}
