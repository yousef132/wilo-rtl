import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { ProgramsService } from './programs.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
})
export class PdfGeneratorService {
    constructor(
        private programService: ProgramsService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    fireAndForgetGenerateCertificate(
        templateUrl: string,
        studentName: string,
        courseName: string,
        date: string,
        studentId: string,
        courseId: number,
        contentId: number,
        isInstructor: boolean
    ): Promise<void> {
        if (!isInstructor) {
            this.toastr.info(
                'تهانينا! لقد اجتزت البرنامج بنجاح 🎉',
                'يتم الآن تجهيز شهادتك، برجاء الانتظار...'
            );
        } else {
            this.toastr.info('يتم الآن تجهيز الشهادة، برجاء الانتظار...');
        }

        return this.generateCertificate(
            templateUrl,
            studentName,
            courseName,
            date,
            studentId,
            courseId,
            contentId
        )
            .catch((err) => {
                if (!isInstructor) {
                    this.router.navigate(['/program-completed'], {
                        queryParams: { status: false },
                    });
                }
            })
            .finally(() => {
                if (!isInstructor) {
                    this.router.navigate(['/program-completed'], {
                        queryParams: { status: true },
                    });
                }
                this.toastr.clear();
            });
    }

    /**
     * Generates a certificate, downloads it, and uploads it to backend
     */
    private async generateCertificate(
        templateUrl: string,
        studentName: string,
        courseName: string,
        date: string,
        studentId: string,
        courseId: number,
        contentId: number
    ): Promise<void> {
        debugger;

        // 1. Load the template as an image into a canvas
        const bgImage = await this.loadImage(templateUrl);

        const canvas = document.createElement('canvas');
        canvas.width = bgImage.width;
        canvas.height = bgImage.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        // Draw background
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // 2. Load Tajawal font dynamically
        const font = new FontFace(
            'Tajawal',
            'url(/fonts/Tajawal-ExtraLight.ttf)'
        );
        await font.load();
        (document as any).fonts.add(font);

        // 3. Format date (Arabic style dd/mm/yyyy)
        const formattedDate = new Date(date).toLocaleDateString('ar-EG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        // 4. Build RTL-safe message
        // Use Unicode RLI (U+2067) and PDI (U+2069) around Latin words
        const rtlStudent = `\u2067${studentName}\u2069`;
        const rtlCourse = `\u2067${courseName}\u2069`;

        const message = `نشهد بأن الطالب/ة ${rtlStudent} قد اجتاز بنجاح دورة ${rtlCourse} بتاريخ ${formattedDate}`;

        // 5. Text styling
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 40px Tajawal';
        ctx.textAlign = 'center';
        ctx.direction = 'rtl'; // Important for Arabic alignment

        // 6. Multi-line wrapping
        const maxWidth = canvas.width - 400; // padding left & right
        const lineHeight = 70;
        const lines = this.wrapText(ctx, message, maxWidth);

        let startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
        });

        // 7. Convert canvas to PDF
        const pdfBytes = await this.canvasToPdf(canvas);

        // 8. Send to backend
        await this.handleFinishingCourse(
            new Uint8Array(pdfBytes),
            studentId,
            courseId,
            contentId
        );
    }

    /** Helper: wrap text into multiple lines */
    private wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    /** Load image from URL */
    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }

    /** Convert Canvas to PDF bytes */
    private async canvasToPdf(canvas: HTMLCanvasElement): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([canvas.width, canvas.height]);

        const imageData = canvas.toDataURL('image/png');
        const base64Data = imageData.split(',')[1];
        const byteArray = Uint8Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
        );

        const pngImage = await pdfDoc.embedPng(byteArray);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
        });

        return await pdfDoc.save();
    }

    /** Send the certificate to backend for upload and marking student as passed */
    private async handleFinishingCourse(
        pdfBytes: Uint8Array,
        studentId: string,
        courseId: number,
        contentId: number
    ): Promise<boolean> {
        debugger;
        const formData = new FormData();
        formData.append(
            'certificate',
            new Blob([pdfBytes.buffer as ArrayBuffer], {
                type: 'application/pdf',
            }),
            'certificate.pdf'
        );

        formData.append('courseId', courseId.toString());
        formData.append('contentId', contentId.toString());
        formData.append('userId', studentId.toString());
        let maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                await firstValueFrom(
                    this.programService.finishProgram(formData)
                );
                return true;
            } catch (error) {
                if (attempt > maxRetries) {
                    return false;
                }
                // Optional: delay between retries
                await new Promise((res) => setTimeout(res, 1000));
            }
        }

        return false;
    }
}
