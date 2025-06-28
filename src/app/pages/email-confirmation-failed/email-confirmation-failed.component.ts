import { Component, OnInit } from '@angular/core';
import { InnerPageBannerComponent } from "../../common/inner-page-banner/inner-page-banner.component";
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-email-confirmation-failed',
  imports: [InnerPageBannerComponent,RouterLink],
  templateUrl: './email-confirmation-failed.component.html',
  styleUrl: './email-confirmation-failed.component.scss'
})
export class EmailConfirmationFailedComponent implements OnInit {
  errorMessage: string = 'حدث خطأ غير متوقع.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParamMap.get('message');
    if (msg) {
      this.errorMessage = decodeURIComponent(msg);
    }
  }
}
