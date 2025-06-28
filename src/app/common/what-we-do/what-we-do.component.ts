import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-what-we-do',
    imports: [RouterLink],
    templateUrl: './what-we-do.component.html',
    styleUrl: './what-we-do.component.scss'
})
export class WhatWeDoComponent {

    sectionTitle = [
        {
            title: 'What We Do',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleWhatWeDoBox = [
        {
            icon: 'flaticon-segmentation',
            title: 'Research',
            paragraphText: 'Lorem ipsum dolor sit consectetur, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            linkText1: 'Market Research',
            link1: 'service-details',
            linkText2: 'Investment Research',
            link2: 'service-details',
            linkText3: 'Read More',
            link3: 'service-details'
        },
        {
            icon: 'flaticon-analytics',
            title: 'Analytics',
            paragraphText: 'Lorem ipsum dolor sit consectetur, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            linkText1: 'Data Analytics',
            link1: 'service-details',
            linkText2: 'Business Intelligence',
            link2: 'service-details',
            linkText3: 'Read More',
            link3: 'service-details'
        },
        {
            icon: 'flaticon-settings',
            title: 'Technology',
            paragraphText: 'Lorem ipsum dolor sit consectetur, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            linkText1: 'Intelligence Automation',
            link1: 'service-details',
            linkText2: 'Quality Engineering',
            link2: 'service-details',
            linkText3: 'Read More',
            link3: 'service-details'
        }
    ]

}