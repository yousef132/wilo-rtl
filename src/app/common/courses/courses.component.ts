import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-courses',
    imports: [RouterLink],
    templateUrl: './courses.component.html',
    styleUrl: './courses.component.scss'
})
export class CoursesComponent {

    sectionTitle = [
        {
            title: 'Online Data Science Courses',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
        }
    ]
    coursesInfo = [
        {
            paragraphText: 'Get the most dedicated consultation for your life-changing course. Earn a certification for your effort and passion',
            linkText: 'Join Free Now.',
            link: 'contact-us'
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
            link: 'course-details',
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
            link: 'course-details',
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
            link: 'course-details',
            paragraphText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
            courseDuration: '2 Weeks Long',
            studentApply: 'Not Available'
        }
    ]

}