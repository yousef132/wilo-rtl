import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about-us',
    imports: [RouterLink],
    templateUrl: './about-us.component.html',
    styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

aboutImg = [
  {
    img: "images/about/img1.png"
  }
];
   aboutContent = [
  {
    subTitle: "من نحن",
    title: "نحن نعيد تعريف التعلم الرقمي",
    paragraphText1: "منصتنا هي الوجهة الأولى للتعلم التفاعلي في العالم العربي. نوفر بيئة تعليمية متطورة تجمع بين أحدث التقنيات وأفضل الممارسات التعليمية لضمان تجربة تعلم استثنائية.",
    paragraphText2: "نؤمن بأن التعلم رحلة مستمرة، ولذلك نحرص على توفير المتابعة الشخصية والدعم المستمر لكل متدرب حتى يحقق أهدافه بنجاح.",
    defaultBtnLink: "about",
    defaultBtnIcon: "ri-arrow-right-line",
  }
];
    aboutList = [
  {
    icon: "flaticon-tick",
    title: "محتوى تفاعلي عالي الجودة"
  },
  {
    icon: "flaticon-tick",
    title: "نظام تقييم ومتابعة ذكي"
  },
  // {
  //   icon: "ri-check-line",
  //   title: "شهادات معتمدة عند الإنجاز"
  // }
];

}