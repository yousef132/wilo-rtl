import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-scientists',
    imports: [NgClass],
    templateUrl: './scientists.component.html',
    styleUrl: './scientists.component.scss'
})
export class ScientistsComponent {

    constructor (
        public router: Router
    ) {}

    // Content
    sectionTitle = [
        {
            subTitle: "Team Members",
            title: 'Our Data Scientist',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleScientistBox = [
        {
            img: 'images/scientist/img1.png',
            title: 'Merv Adrian',
            designation: 'Data Management',
            facebookLink: '#',
            facebookIcon: 'bx bxl-facebook',
            twitterLink: '#',
            twitterIcon: 'bx bxl-twitter',
            instagramLink: '#',
            instagramIcon: 'bx bxl-instagram',
            linkedinLink: '#',
            linkedinIcon: 'bx bxl-linkedin'
        },
        {
            img: 'images/scientist/img2.png',
            title: 'Kirk Borne',
            designation: 'Data Scientist',
            facebookLink: '#',
            facebookIcon: 'bx bxl-facebook',
            twitterLink: '#',
            twitterIcon: 'bx bxl-twitter',
            instagramLink: '#',
            instagramIcon: 'bx bxl-instagram',
            linkedinLink: '#',
            linkedinIcon: 'bx bxl-linkedin'
        },
        {
            img: 'images/scientist/img3.png',
            title: 'Carla Gentry',
            designation: 'Analytical Solutions',
            facebookLink: '#',
            facebookIcon: 'bx bxl-facebook',
            twitterLink: '#',
            twitterIcon: 'bx bxl-twitter',
            instagramLink: '#',
            instagramIcon: 'bx bxl-instagram',
            linkedinLink: '#',
            linkedinIcon: 'bx bxl-linkedin'
        },
        {
            img: 'images/scientist/img4.png',
            title: 'Marie Curie',
            designation: 'Data Scientist',
            facebookLink: '#',
            facebookIcon: 'bx bxl-facebook',
            twitterLink: '#',
            twitterIcon: 'bx bxl-twitter',
            instagramLink: '#',
            instagramIcon: 'bx bxl-instagram',
            linkedinLink: '#',
            linkedinIcon: 'bx bxl-linkedin'
        }
    ]

}