import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-team',
    imports: [RouterLink],
    templateUrl: './team.component.html',
    styleUrl: './team.component.scss'
})
export class TeamComponent {

    singleTeamItem1 = [
        {
            img: "images/scientist/img9.jpg"
        }
    ]
    singleTeamItem2 = [
        {
            img: "images/scientist/img10.jpg"
        }
    ]
    singleTeamItem3 = [
        {
            img: "images/scientist/img11.jpg"
        }
    ]
    teamSectionTitle = [
        {
            subTitle: 'Our Team',
            title: 'Meet Our Data Team Preparing For Your Business Success',
            paragraphText1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            paragraphText2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
            link: 'team',
            linkText: 'View Our Team',
            linkIcon: 'flaticon-view'
        }
    ]

}