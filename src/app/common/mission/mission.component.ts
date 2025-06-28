import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-mission',
    imports: [RouterLink],
    templateUrl: './mission.component.html',
    styleUrl: './mission.component.scss'
})
export class MissionComponent {

  ourMissionImage = [
  {
    img: "images/our-mission/img1.png"
  }
];
   ourMissionContent = [
  {
    subTitle: "رسالتنا",
    title: "تمكين الأفراد من خلال التعلم المتقدم",
    paragraphText1: "رسالتنا هي جعل التعليم عالي الجودة متاحاً للجميع من خلال منصة رقمية متطورة تجمع بين المحتوى المتميز والتقنيات الحديثة لتوفير تجربة تعلم فريدة.",
    paragraphText2: "نسعى لبناء مجتمع تعليمي متفاعل يمكّن الأفراد من تطوير مهاراتهم وتحقيق أهدافهم المهنية والشخصية بطريقة مرنة وفعالة.",
    defaultBtnLink: "mission",
    defaultBtnIcon: "ri-arrow-right-line",
    defaultBtnText: "اطلع على رؤيتنا"
  }
];
   ourMissionList = [
  {
    icon: "flaticon-tick",
    title: "تعليم متطور ومبتكر"
  },
  {
    icon: "flaticon-tick",
    title: "دعم ومتابعة شخصية"
  },
  {
    icon: "flaticon-tick",
    title: "وصول عالمي للمحتوى"
  }
];

}