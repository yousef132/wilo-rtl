import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-related-courses',
    imports: [RouterLink],
    templateUrl: './related-courses.component.html',
    styleUrl: './related-courses.component.scss'
})
export class RelatedCoursesComponent {

    sectionTitle = [
        {
            title: 'More Projects You Might Like'
        }
    ]
    singleCoursesBox = [
        {
            courseImg: 'images/courses/img1.jpg',
            coursePrice: 'Free',
            coursePriceClass: 'free',
            authorImg: 'images/user1.jpg',
            authorName: 'Alex Morgan',
            title: 'Introduction to Quantitative Methods',
            link: 'courses-details',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
            courseDuration: '8 Weeks Long',
            studentApply: 'Available Now'
        },
        {
            courseImg: 'images/courses/img2.jpg',
            coursePrice: '$49',
            coursePriceClass: 'paid',
            authorImg: 'images/user2.jpg',
            authorName: 'Sarah Taylor',
            title: 'Introduction to Linear Models and Matrix Algebra',
            link: 'courses-details',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
            courseDuration: '7 Weeks Long',
            studentApply: 'Available Now'
        },
        {
            courseImg: 'images/courses/img3.jpg',
            coursePrice: '$69',
            coursePriceClass: 'paid',
            authorImg: 'images/user3.jpg',
            authorName: 'David Warner',
            title: 'Data Science: Inference and Modeling',
            link: 'courses-details',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
            courseDuration: '2 Weeks Long',
            studentApply: 'Not Available'
        }
    ]
    
}