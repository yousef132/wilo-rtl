import { Component, OnInit } from '@angular/core';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-program-completed',
    imports: [InnerPageBannerComponent, RouterLink,NgIf,],
    templateUrl: './program-completed.component.html',
    styleUrl: './program-completed.component.scss',
})
export class ProgramCompletedComponent implements OnInit {
    isSuccess: boolean = false;

    constructor(private route: ActivatedRoute) {
       ;
    }

    ngOnInit(): void {
       ;
        this.route.queryParamMap.subscribe((params) => {
            const status = params.get('status');
            this.isSuccess = status === 'true'; // it's a string
        }); 
    }
}
