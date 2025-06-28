import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-testimonials',
    imports: [RouterLink, CarouselModule],
    templateUrl: './testimonials.component.html',
    styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {

    // Content
    sectionTitle = [
        {
            subTitle: "Testimonials",
            title: 'What Our Clients Are Saying?',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    singleTestimonialsItem = [
        {
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.',
            clientImg: 'images/testimonials/img1.jpg',
            clientName: 'Alex Maxwell',
            clientDesignation: 'CEO at EnvyTheme'
        },
        {
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.',
            clientImg: 'images/testimonials/img2.jpg',
            clientName: 'David Warner',
            clientDesignation: 'CEO at Envato'
        },
        {
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.',
            clientImg: 'images/testimonials/img3.jpg',
            clientName: 'Sarah Taylor',
            clientDesignation: 'CEO at ThemeForest'
        }
    ]
    testimonialsBtn = [
        {
            link: ".",
            icon: 'flaticon-view',
            text: 'Check Out All Reviews'
        }
    ]

    // Owl Carousel
    testimonialsSlides: OwlOptions = {
		nav: true,
        rtl: true,
		loop: true,
		margin: 25,
		dots: false,
		autoplay: true,
		smartSpeed: 500,
		autoplayHoverPause: true,
		navText: [
			"<i class='flaticon-right-1'></i>",
			"<i class='flaticon-left-1'></i>"
		],
        responsive: {
			0: {
				items: 1
			},
			515: {
				items: 1
			},
			695: {
				items: 2
			},
			935: {
				items: 2
			},
			1115: {
				items: 2
			}
		}
    }

}