import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-services',
    imports: [RouterLink],
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss'
})
export class ServicesComponent {

    sectionTitle = [
        {
            subTitle: 'Our Services',
            title: 'We Offer Professional Solutions For Business',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleServicesBox = [
        {
            icon: 'images/services/icon1.png',
            title: 'Data Analytics',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        },
        {
            icon: 'images/services/icon2.png',
            title: 'AI & ML Development',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        },
        {
            icon: 'images/services/icon3.png',
            title: 'Data Science',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        },
        {
            icon: 'images/services/icon4.png',
            title: 'Predictive Analytics',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        },
        {
            icon: 'images/services/icon5.png',
            title: 'Software Development',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        },
        {
            icon: 'images/services/icon6.png',
            title: 'Elastic Solutions',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'service-details',
            linkText: 'Read More',
            linkIcon: 'flaticon-left'
        }
    ]
    loadMoreBtn = [
        {
            link: 'services',
            linkText: 'Load More',
            linkIcon: 'flaticon-refresh'
        }
    ]

}