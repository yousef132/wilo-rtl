import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-services',
    imports: [RouterLink],
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss'
})
export class ServicesComponent {

sectionTitle = [
  {
    subTitle: "خدماتنا",
    title: "ما نقدمه لك",
    paragraphText: "نوفر مجموعة شاملة من الخدمات التعليمية المتطورة التي تلبي احتياجاتك التدريبية وتساعدك في تحقيق أهدافك بأفضل الطرق."
  }
];
singleServicesItem = [
  {
    icon: "images/services/icon1.png",
    title: "برامج تدريبية شاملة",
    paragraphText: "برامج تدريبية متنوعة تغطي جميع المجالات المهنية والشخصية مع محتوى منظم ومتدرج حسب مستوى الخبرة.",
    link: "services/training-programs",
    btnIcon: "ri-arrow-right-line",
    btnText: "استكشف البرامج"
  },
  {
    icon: "images/services/icon2.png",
    title: "تقييم ومتابعة مستمرة",
    paragraphText: "نظام تقييم ذكي يتابع تقدمك خطوة بخطوة مع اختبارات تفاعلية وتقارير مفصلة عن الأداء.",
    link: "services/assessment",
    btnIcon: "ri-arrow-right-line",
    btnText: "اعرف المزيد"
  },
  {
    icon: "images/services/icon3.png",
    title: "شهادات معتمدة",
    paragraphText: "احصل على شهادات معتمدة عند إنجاز البرامج التدريبية تؤكد مهاراتك وتزيد من فرصك المهنية.",
    link: "services/certificates",
    btnIcon: "ri-arrow-right-line",
    btnText: "تفاصيل الشهادات"
  },
  {
    icon: "images/services/icon4.png",
    title: "محتوى متعدد الوسائط",
    paragraphText: "تعلم من خلال فيديوهات عالية الجودة، ملفات تفاعلية، ومحتوى من يوتيوب ولووم وفيميو.",
    link: "services/multimedia",
    btnIcon: "ri-arrow-right-line",
    btnText: "شاهد العينات"
  },
  {
    icon: "images/services/icon5.png",
    title: "منصة تفاعلية",
    paragraphText: "واجهة سهلة الاستخدام مع إمكانية البحث المتقدم عن الكورسات والتفاعل مع المدربين والطلاب.",
    link: "services/platform",
    btnIcon: "ri-arrow-right-line",
    btnText: "جرب المنصة"
  },
  {
    icon: "images/services/icon6.png",
    title: "دعم فني متواصل",
    paragraphText: "فريق دعم فني متخصص متاح على مدار الساعة لمساعدتك في أي استفسار أو مشكلة تقنية.",
    link: "services/support",
    btnIcon: "ri-arrow-right-line",
    btnText: "تواصل معنا"
  }
];

}