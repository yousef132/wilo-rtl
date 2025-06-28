import { Component } from '@angular/core';
import { BannerComponent } from './banner/banner.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { BoxesComponent } from './boxes/boxes.component';
import { MissionComponent } from '../../common/mission/mission.component';
import { FunfactsComponent } from '../../common/funfacts/funfacts.component';
import { ServicesComponent } from './services/services.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { TeamComponent } from '../../common/team/team.component';
import { PartnerComponent } from '../../common/partner/partner.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { GetStartedComponent } from '../../common/get-started/get-started.component';

@Component({
    selector: 'app-home-demo-two',
    imports: [
        BannerComponent,
        BoxesComponent,
        AboutUsComponent,
        MissionComponent,
        FunfactsComponent,

        GetStartedComponent,
    ],
    templateUrl: './home-demo-two.component.html',
    styleUrl: './home-demo-two.component.scss',
})
export class HomeDemoTwoComponent {



}
