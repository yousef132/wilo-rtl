import { Component } from '@angular/core';
import { GetStudentsWithLevelResponse } from '../../models/content/content';
import { ContentPassingRequirement } from '../../models/program/programs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ContentService } from '../../services/content.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { InnerPageBannerComponent } from "../../common/inner-page-banner/inner-page-banner.component";

@Component({
    selector: 'app-program-students',
    imports: [CommonModule, InnerPageBannerComponent],
    templateUrl: './program-students.component.html',
    styleUrl: './program-students.component.scss',
})
export class ProgramStudentsComponent {
    students: GetStudentsWithLevelResponse[] = [];
    loading = false;
    error: string | null = null;
    courseId!: number; // يتم تعيينه بناءً على المسار أو المُدخل

    // إتاحة التعداد في القالب
    ContentPassingRequirement = ContentPassingRequirement;

    constructor(
        private programService: ProgramsService,
        private contentService: ContentService,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService
    ) {
        // الحصول على courseId من باراميتر الرابط
        this.route.params.subscribe((params) => {
            this.courseId = +params['id'];
        });
    }

    ngOnInit(): void {
        this.loadStudents();
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

    passStudent(studentId: string, contentId: number): void {
        if (confirm('هل أنت متأكد أنك تريد نجاح هذا الطالب؟')) {
            this.loading = true;

            this.contentService.passStudent(contentId, studentId).subscribe({
                next: () => {
                    this.loadStudents();
                    this.toastr.success('تم النجاح بنجاح');
                },
                error: (error) => {
                    this.error = 'فشل في نجاح الطالب. حاول مرة أخرى.';
                    this.loading = false;
                },
            });
        }
    }

    openChat(studentId: string,contentId:number): void {
    //content-details/:contentId/:userId/:programId
    ;
        this.router.navigate(['/content-details', contentId,studentId,this.courseId]);
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
                return 'badge-secondary';
            case ContentPassingRequirement.Exam:
                return 'badge-info';
            case ContentPassingRequirement.Comment:
                return 'badge-warning';
            case ContentPassingRequirement.Manually:
                return 'badge-primary';
            default:
                return 'badge-secondary';
        }
    }

    trackByStudentId(index: number, student: GetStudentsWithLevelResponse): string {
        return student.userId;
    }
}
