import { Injectable } from '@angular/core';
import { ContentPassingRequirement, ContentType } from '../models/program/programs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

      contentTypes = [
        { value: ContentType.Vimeo, label: 'Vimeo' },
        { value: ContentType.YouTube, label: 'YouTube' },
        { value: ContentType.File, label: 'File' },
        { value: ContentType.Website, label: 'Website' },
        { value: ContentType.Loom, label: 'Loom' },
        { value: ContentType.Image, label: 'Image' },
    ];
    passingRequirements = [
        {
            value: ContentPassingRequirement.Comment,
            label: 'كتابه تعليق',
        },
        {
            value: ContentPassingRequirement.Exam,
            label: 'امتحان',
        },
        {
            value: ContentPassingRequirement.Manually,
            label: 'بواسطه المدرب',
        },
    ];
    // shared attribute

    private programId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
 currentProgramId = this.programId.asObservable(); 
  constructor() { }

   changeSectionId(value: number) {
    debugger;
    this.programId.next(value); 
  }
  validateFile(file: File, allowedTypes: string[], sizeInKB: number) {
    const fileType = file.type;
    if (!allowedTypes.includes(fileType) && allowedTypes.length > 0) {
      return 'غير مسموح بتحميل هذا النوع من الملفات';
    }
    const maxSizeBytes = sizeInKB * 1024;
    const fileSize = file.size;
    if (fileSize > maxSizeBytes) {
      return `الحجم الأقصى المسموح به للملف هو ${sizeInKB} KB.`;
    }
    return null;
  }
}
