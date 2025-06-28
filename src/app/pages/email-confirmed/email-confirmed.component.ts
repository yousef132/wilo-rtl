import { Component } from '@angular/core';
import { InnerPageBannerComponent } from "../../common/inner-page-banner/inner-page-banner.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-email-confirmed',
  imports: [InnerPageBannerComponent,RouterLink],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.scss'
})
export class EmailConfirmedComponent {

}
