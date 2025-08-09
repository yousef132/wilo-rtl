import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { ProgramsService } from './programs.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
    providedIn: 'root',
})
export class PdfGeneratorService {
    constructor(
        private programService: ProgramsService,
        private router: Router,
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

        // 1. Create canvas and load template image
        const canvas = document.createElement('canvas');
        canvas.width = 3508; // A3 size at high resolution
        canvas.height = 2480;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Failed to get canvas context');

        const bgImage = await this.loadImage(templateUrl); //May Cause CORS Errors
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // 2. Add student name & course name
        ctx.fillStyle = '#000';
        ctx.font = 'bold 90px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(studentName, canvas.width / 2, 1200);
        ctx.font = '70px Arial';
        ctx.fillText(courseName, canvas.width / 2, 1400);

        // 3. Add date
        ctx.font = '50px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Date: ${date}`, 500, 1600);

        // 4. Generate and draw QR Code
        // const qrImg = await this.generateQRCode(verificationUrl);
        // ctx.drawImage(qrImg, canvas.width - 900, 1600, 300, 300);

        // 5. Convert to PDF using pdf-lib
        const pdfBytes = await this.canvasToPdf(canvas);

        // 6. Download PDF for user
        // this.downloadPdf(pdfBytes, `Certificate-${studentName}.pdf`);

        // 7. Upload to backend
        await this.handleFinishingCourse(
            pdfBytes,
            studentId,
            courseId,
            contentId
        );
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
        const formData = new FormData();
        formData.append(
            'certificate',
            new Blob([pdfBytes], { type: 'application/pdf' }),
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
