import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content>
      <div class="flex h-full items-center justify-center">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>
    </ion-content>
  `,
})
export class OAuth2RedirectPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (code) {
      this.authService.exchangeOAuth2Code(code).subscribe({
        next: () => this.router.navigate(['/tabs/inicio'], { replaceUrl: true }),
        error: () => this.router.navigate(['/auth/login'], { replaceUrl: true }),
      });
    } else {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    }
  }
}
