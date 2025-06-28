import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-solutions',
    imports: [RouterLink],
    templateUrl: './solutions.component.html',
    styleUrl: './solutions.component.scss'
})
export class SolutionsComponent {

    sectionTitle = [
        {
            subTitle: 'حلولنا',
            title: 'نحن مختلفون عن الآخرين يجب أن يختارونا',
            paragraphText: 'من المهم جدًا العناية بالمريض، وسيتبع المريض المريض، لكن هذا وقت الألم والمعاناة الكبيرين.'
        }
    ]
    singleSolutionsBox = [
        {
            icon: 'flaticon-rocket',
            title: 'تطبيقات بدء التشغيل',
            paragraphText: 'من المهم جدًا التحلي بالصبر، وأن يتبعك العميل، لكنه في نفس الوقت يقع في قدر كبير من الألم والمعاناة.',
            link: 'service-details',
            linkText: 'عرض التفاصيل'
        },
        {
            icon: 'flaticon-laptop',
            title: 'حلول SaaS',
            paragraphText: 'من المهم جدًا التحلي بالصبر، وأن يتبعك العميل، لكنه في نفس الوقت يقع في قدر كبير من الألم والمعاناة.',
            link: 'service-details',
            linkText: 'عرض التفاصيل'
        },
        {
            icon: 'flaticon-money',
            title: 'منصات التجارة الإلكترونية',
            paragraphText: 'من المهم جدًا التحلي بالصبر، وأن يتبعك العميل، لكنه في نفس الوقت يقع في قدر كبير من الألم والمعاناة.',
            link: 'service-details',
            linkText: 'عرض التفاصيل'
        }
    ]

}