import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-funfacts',
    imports: [NgIf, NgClass],
    templateUrl: './funfacts.component.html',
    styleUrl: './funfacts.component.scss'
})
export class FunfactsComponent {

    constructor (
        public router: Router
    ) {}

    // Content
singleFunfactsBox = [
  {
    icon: "images/funfacts/icon1.png",
    title: "5000+",
    subTitle: "طالب متدرب"
  },
  {
    icon: "images/funfacts/icon2.png",
    title: "200+",
    subTitle: "برنامج تدريبي"
  },
  {
    icon: "images/funfacts/icon3.png",
    title: "50+",
    subTitle: "مدرب متخصص"
  },
  {
    icon: "images/funfacts/icon4.png",
    title: "95%",
    subTitle: "معدل الرضا"
  }
];


}