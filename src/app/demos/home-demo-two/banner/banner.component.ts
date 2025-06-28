import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-banner',
    imports: [RouterLink, NgIf],
    templateUrl: './banner.component.html',
    styleUrl: './banner.component.scss'
})
export class BannerComponent {

    // Content
 bannerContent = [
  {
    title: "اول نظام الكتروني لمتابعة فريق العمل واعداد القادة في صناعة البيع المباشر",
    paragraphText: "برنامج نظام المتابعة الذكي هو أول نظام إلكتروني متخصص لمتابعة فريق العمل وإعداد القادة في مجال صناعة البيع المباشر. يعتمد البرنامج على تقنيات مبتكرة تسهم في تعزيز الأداء ومتابعة تطور أعضاء الفريق بشكل مستمر، مما يساعد في رفع الكفاءة وتحقيق النتائج المرجوة.",
    defaultBtnLink: "programs",
    defaultBtnIcon: "flaticon-structure",
    defaultBtnText: "ابدأ التعلم الآن",
    videoBtnIcon: "flaticon-google-play",
    videoBtnText: "شاهد الفيديو التعريفي"
  }
];

    // Video Popup
    isOpen = false;
    openPopup(): void {
        this.isOpen = true;
    }
    closePopup(): void {
        this.isOpen = false;
    }

}