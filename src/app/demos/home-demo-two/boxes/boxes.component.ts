import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-boxes',
    imports: [RouterLink],
    templateUrl: './boxes.component.html',
    styleUrl: './boxes.component.scss'
})
export class BoxesComponent {

   singleBoxesItem = [
  {
    icon: "images/services/icon1.png",
    title: "برامج تدريبية متخصصة",
    paragraphText: "اختر من بين مئات البرامج التدريبية في مختلف المجالات المهنية والشخصية مع محتوى عالي الجودة ومتابعة فردية.",
    link: "programs",
    btnIcon: "ri-arrow-right-line",
    btnText: "استكشف البرامج"
  },
  {
    icon: "images/services/icon2.png",
    title: "مدربين معتمدين",
    paragraphText: "تعلم من خبراء متخصصين في مجالاتهم مع سنوات من الخبرة العملية والأكاديمية لضمان حصولك على أفضل تجربة تعليمية.",
    link: "instructors",
    btnIcon: "ri-arrow-right-line",
    btnText: "تعرف على المدربين"
  },
  {
    icon: "images/services/icon3.png",
    title: "متابعة شخصية",
    paragraphText: "احصل على متابعة فردية من المدرب لضمان فهمك للمحتوى وتقدمك في البرنامج التدريبي بطريقة فعالة ومثمرة.",
    link: "support",
    btnIcon: "ri-arrow-right-line",
    btnText: "اعرف المزيد"
  }
];

}