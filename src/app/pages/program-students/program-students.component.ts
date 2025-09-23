import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GetStudentsWithLevelResponse } from '../../models/content/content';
import {
    ContentPassingRequirement,
    ProgramCertificateDetails,
} from '../../models/program/programs';

import { ProgramsService } from '../../services/programs.service';
import { ContentService } from '../../services/content.service';
import { PdfGeneratorService } from '../../services/pdf-generator.service';

import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';

@Component({
    selector: 'app-program-students',
    standalone: true,
    imports: [CommonModule, InnerPageBannerComponent],
    templateUrl: './program-students.component.html',
    styleUrl: './program-students.component.scss',
})
export class ProgramStudentsComponent {
    students: GetStudentsWithLevelResponse[] = [];
    loading = false;
    error: string | null = null;
    courseId!: number;

    ContentPassingRequirement = ContentPassingRequirement;

    constructor(
        private programService: ProgramsService,
        private contentService: ContentService,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
    ) {
        this.route.params.subscribe((params) => {
            this.courseId = +params['id'];
        });
    }

    ngOnInit(): void {
        this.loading = true;
        this.error = null;

        this.programService.getProgramStudents(this.courseId).subscribe({
            next: (students:GetStudentsWithLevelResponse[] | undefined) => {
                this.students = students ?? [];
                this.loading = false;
            },
            error: () => {
                this.error = 'فشل في تحميل البيانات. حاول مرة أخرى.';
                this.loading = false;
            },
        });
    }
    loadStudents(): void {
        this.loading = true;
        this.error = null;

        this.programService.getProgramStudents(this.courseId!).subscribe({
            next: (data: GetStudentsWithLevelResponse[] | undefined) => {
                if (data) {
                    this.students = data;
                }
                this.loading = false;
            },
            error: (error) => {
                this.error = 'فشل في تحميل الطلاب. حاول مرة أخرى.';
                this.loading = false;
                console.error('خطأ أثناء تحميل الطلاب:', error);
            },
        });
    }
    passStudent(student: GetStudentsWithLevelResponse): void {
        if (!confirm('هل أنت متأكد أنك تريد نجاح هذا الطالب؟')) return;

        debugger;
        this.loading = true;
        this.contentService
            .passStudent(student.lastContent.id, student.userId)
            .subscribe({
                next: () => {
                    this.refreshStudents();
                    this.loading = false;
                },
                error: (error) => {
                    this.error = 'فشل في نجاح الطالب. حاول مرة أخرى.';
                    this.loading = false;
                    console.error('خطأ أثناء نجاح الطالب:', error);
                },
            });
    }

    // private async handleCertificateAndRefresh(
    //     student: GetStudentsWithLevelResponse
    // ): Promise<void> {
    //     try {
    //          ;
    //         this.loading = true;

    //         await this.pdfGeneratorService.fireAndForgetGenerateCertificate(
    //             this.certificateDetails.templateUrl,
    //             student.arName,
    //             this.certificateDetails.programName,
    //             new Date().toString(),
    //             student.userId,
    //             this.certificateDetails.programId,
    //             student.lastContent.id,
    //             true
    //         );
    //         this.loading = false;

    //         this.toastr.success('تم النجاح بنجاح');
    //         this.refreshStudents();
    //     } catch (e) {
    //         console.error('Error generating certificate:', e);
    //         this.toastr.error('فشل في توليد الشهادة.');
    //     } finally {
    //         this.loading = false;
    //     }
    // }

    private refreshStudents(): void {
        this.programService.getProgramStudents(this.courseId).subscribe({
            next: (data) => {
                this.students = data ?? [];
                this.loading = false;
            },
            error: (error) => {
                this.error = 'فشل في إعادة تحميل الطلاب.';
                this.loading = false;
            },
        });
    }

    openChat(studentId: string, contentId: number): void {
        this.router.navigate([
            '/content-details',
            contentId,
            studentId,
            this.courseId,
        ]);
    }

    getPassingRequirementText(requirement: ContentPassingRequirement): string {
        switch (requirement) {
            case ContentPassingRequirement.None:
                return 'لا يوجد';
            case ContentPassingRequirement.Exam:
                return 'اختبار';
            case ContentPassingRequirement.Comment:
                return 'تعليق';
            case ContentPassingRequirement.Manually:
                return 'يدوي';
            default:
                return 'غير معروف';
        }
    }

    getPassingRequirementClass(requirement: ContentPassingRequirement): string {
        switch (requirement) {
            case ContentPassingRequirement.None:
                return 'requirement-none';
            case ContentPassingRequirement.Exam:
                return 'requirement-exam';
            case ContentPassingRequirement.Comment:
                return 'requirement-comment';
            case ContentPassingRequirement.Manually:
                return 'requirement-manual';
            default:
                return 'requirement-unknown';
        }
    }

    getProgressClass(percentage: number): string {
        if (percentage >= 80) return 'progress-excellent';
        if (percentage >= 60) return 'progress-good';
        if (percentage >= 40) return 'progress-average';
        return 'progress-low';
    }

    getProgressText(percentage: number): string {
        if (percentage >= 80) return 'ممتاز';
        if (percentage >= 60) return 'جيد';
        if (percentage >= 40) return 'متوسط';
        return 'ضعيف';
    }

    trackByStudentId(
        index: number,
        student: GetStudentsWithLevelResponse
    ): string {
        return student.userId;
    }
}
