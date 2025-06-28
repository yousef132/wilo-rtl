import { Component, Input, OnInit } from '@angular/core';
import { YouTubePlayer, YouTubePlayerModule } from '@angular/youtube-player';
@Component({
    selector: 'app-youtube-player',
    imports: [YouTubePlayerModule],
    templateUrl: './youtube-player.component.html',
    styleUrl: './youtube-player.component.scss',
})
export class YoutubePlayerComponent implements OnInit {
    @Input({ required: true }) videoUrl!: string;
    videoId!: string;
    ngOnInit(): void {
        this.videoId = this.getVideoId(this.videoUrl);

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
    }

    getVideoId(url: string): string {
      try {
        const parsedUrl = new URL(url);
        const host = parsedUrl.hostname;
        const pathname = parsedUrl.pathname;
    
        if (host.includes('youtu.be')) {
          return pathname.split('/')[1];
        }
    
        if (host.includes('youtube.com')) {
          if (pathname.startsWith('/watch')) {
            return parsedUrl.searchParams.get('v') || '';
          }
    
          const pathSegments = pathname.split('/');
          if (['embed', 'v', 'live'].includes(pathSegments[1])) {
            return pathSegments[2];
          }
        }
    
        return '';
      } catch {
        return '';
      }
    }
    
    
}
