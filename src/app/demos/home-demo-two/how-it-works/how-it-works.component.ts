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
            title: 'Our Data Analytics Process',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    processImage = [
        {
            img: 'images/process/img7.png'
        }
    ]
    processContent = [
        {
            img: 'images/process/img-small1.png',
            title: 'Frame the Problem',
            number: '1'
        },
        {
            img: 'images/process/img-small2.png',
            title: 'Collect the Raw Data',
            number: '2'
        },
        {
            img: 'images/process/img-small3.png',
            title: 'Process the Data',
            number: '3'
        },
        {
            img: 'images/process/img-small4.png',
            title: 'Explore the Data',
            number: '4'
        },
        {
            img: 'images/process/img-small5.png',
            title: 'Perform Analysis',
            number: '5'
        },
        {
            img: 'images/process/img-small6.png',
            title: 'Communicate Results',
            number: '6'
        }
    ]

}