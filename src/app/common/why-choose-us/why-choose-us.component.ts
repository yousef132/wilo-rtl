import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-why-choose-us',
    imports: [RouterLink],
    templateUrl: './why-choose-us.component.html',
    styleUrl: './why-choose-us.component.scss'
})
export class WhyChooseUsComponent {

    whyChooseUsContent = [
        {
            title: 'Why Choose Us?',
            paragraphText1: 'During 30 years in data analytics, we have built up comprehensive competencies that cover traditional and big data, data management, business intelligence (including self-service BI and data visualization), advanced data analytics, and data science.',
            paragraphText2: 'In 2015, we were rated A+ by BBB, recognized as the top IT company by Clutch, as well as featured on The Silicon Review listing among 10 Fastest Growing Data Analytics Companies.',
            linkIcon: 'flaticon-left',
            linkText: 'More About Us',
            link: 'about-us'
        }
    ]
    ourBrandPartnersList = [
        {
            title: 'Our Brand Partners',
            linkText: 'View All',
            link: 'partner'
        }
    ]
    brandPartnersImg = [
        {
            img: 'images/partner/img1.png'
        },
        {
            img: 'images/partner/img2.png'
        },
        {
            img: 'images/partner/img3.png'
        },
        {
            img: 'images/partner/img4.png'
        },
        {
            img: 'images/partner/img5.png'
        },
        {
            img: 'images/partner/img6.png'
        }
    ]

}