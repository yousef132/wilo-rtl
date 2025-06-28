import { Component } from '@angular/core';

@Component({
    selector: 'app-history',
    imports: [],
    templateUrl: './history.component.html',
    styleUrl: './history.component.scss'
})
export class HistoryComponent {

    sectionTitle = [
        {
            subTitle: "Our History",
            title: 'History Begins in 2010',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    historyTimeline = [
        {
            year: '2010',
            date: 'February 20',
            title: 'Founded',
            paragraphText: 'Real innovations and a positive customer experience are the heart of successful communication. Lorem ipsum dolor sit amet, sectetur adipiscing elit, tempor incididunt ut labore et dolore magna.',
            img: 'images/history/img1.jpg'
        },
        {
            year: '2013',
            date: 'January 14',
            title: 'Global Success',
            paragraphText: 'Real innovations and a positive customer experience are the heart of successful communication. Lorem ipsum dolor sit amet, sectetur adipiscing elit, tempor incididunt ut labore et dolore magna.',
            img: 'images/history/img2.jpg'
        },
        {
            year: '2016',
            date: 'March 25',
            title: 'Founded Data Center',
            paragraphText: 'Real innovations and a positive customer experience are the heart of successful communication. Lorem ipsum dolor sit amet, sectetur adipiscing elit, tempor incididunt ut labore et dolore magna.',
            img: 'images/history/img3.jpg'
        },
        {
            year: '2023',
            date: 'December 10',
            title: 'International Award',
            paragraphText: 'Real innovations and a positive customer experience are the heart of successful communication. Lorem ipsum dolor sit amet, sectetur adipiscing elit, tempor incididunt ut labore et dolore magna.',
            img: 'images/history/img4.jpg'
        }
    ]

}