import { Component } from '@angular/core';

@Component({
    selector: 'app-how-it-works',
    imports: [],
    templateUrl: './how-it-works.component.html',
    styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent {

    sectionTitle = [
        {
            subTitle: "How It's Work",
            title: 'The Data Science Process',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleProcessBox = [
        {
            img: 'images/process/img1.png',
            title: 'Frame the Problem',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '1'
        },
        {
            img: 'images/process/img2.png',
            title: 'Collect the Raw Data',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '2'
        },
        {
            img: 'images/process/img3.png',
            title: 'Process the Data',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '3'
        },
        {
            img: 'images/process/img4.png',
            title: 'Explore the Data',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '4'
        },
        {
            img: 'images/process/img5.png',
            title: 'Perform In-depth Analysis',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '5'
        },
        {
            img: 'images/process/img6.png',
            title: 'Communicate Results',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            number: '6'
        }
    ]

}