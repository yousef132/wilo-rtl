import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
    selector: 'app-get-started',
    imports: [RouterLink, NgClass, NgIf],
    templateUrl: './get-started.component.html',
    styleUrl: './get-started.component.scss'
})
export class GetStartedComponent {

    constructor (
        public router: Router
    ) {}

    // Content
    projectStartImage = [
        {
            img: 'images/project-start.png'
        }
    ]
    projectStartContent = [
        {
            title: 'We Like to Start Your Project With Us',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            defaultBtnIcon: 'flaticon-web',
            defaultBtnText: 'Get Started',
            defaultBtnLink: 'contact-us'
        }
    ]

}