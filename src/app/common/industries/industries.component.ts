import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-industries',
    imports: [RouterLink],
    templateUrl: './industries.component.html',
    styleUrl: './industries.component.scss'
})
export class IndustriesComponent {

    sectionTitle = [
        {
            title: 'Industries We Serve',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleIndustriesServeBox = [
        {
            title: 'Manufacturing',
            icon: 'flaticon-factory',
            link: 'service-details'
        },
        {
            title: 'Healthcare',
            icon: 'flaticon-hospital',
            link: 'service-details'
        },
        {
            title: 'Automobile',
            icon: 'flaticon-tracking',
            link: 'service-details'
        },
        {
            title: 'Banking',
            icon: 'flaticon-investment',
            link: 'service-details'
        },
        {
            title: 'Real Estate',
            icon: 'flaticon-house',
            link: 'service-details'
        },
        {
            title: 'Logistics',
            icon: 'flaticon-order',
            link: 'service-details'
        },
        {
            title: 'Insurance',
            icon: 'flaticon-family-insurance',
            link: 'service-details'
        },
        {
            title: 'Capital Markets',
            icon: 'flaticon-bitcoin',
            link: 'service-details'
        }
    ]
    
}