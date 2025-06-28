import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ContentSubscribers } from '../../models/content/content';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-subscripters',
  imports: [NgIf,NgFor,RouterLink],
  templateUrl: './subscripters.component.html',
  styleUrl: './subscripters.component.scss'
})
export class SubscriptersComponent {
  contentId: number | null = null;
  programId: number | null = null;
  subscribers: ContentSubscribers[] | null = null;
  constructor(private route:ActivatedRoute,
    private programService : ProgramsService
  ) { 
    // get program id from route
    this.route.params.subscribe((params) => {
      this.contentId = +params['contentId'];
      this.programId = +params['programId'];

      this.getSubscribers();
    });
  }

  getSubscribers(){
        this.programService.getContentSubscribers(this.contentId!).subscribe({
      next: (response:ContentSubscribers[] | undefined) => {
        this.subscribers = response || [];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  ngOnInit( ): void {

  }
  trackByUserId(index: number, subscriber: ContentSubscribers): string {
  return subscriber.userId;
}

getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

formatDate(date: Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

getTimeAgo(date: Date): string {
  if (!date) return '';
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'اليوم';
  } else if (diffDays === 1) {
    return 'أمس';
  } else if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
  }
}
}
