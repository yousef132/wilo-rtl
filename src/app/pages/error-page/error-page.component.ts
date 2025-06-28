import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';

@Component({
    selector: 'app-error-page',
    imports: [RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './error-page.component.html',
    styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {

    errorContent = [
        {
            img: 'images/error.png',
            title: 'Error 404 : Page Not Found',
            paragraphText: 'The page you are looking for might have been removed had its name changed or is temporarily unavailable.',
            goBackBtnIcon: 'flaticon-history',
            goBackBtnText: 'Go Back',
            BackToHomeBtnIcon: 'flaticon-earth-day',
            BackToHomeBtnText: 'Homepage'
        }
    ]

}