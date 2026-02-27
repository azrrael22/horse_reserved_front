import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.models';

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
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    const role = this.route.snapshot.queryParamMap.get('role') as UserRole | null;

    if (token && email && role) {
      this.authService.handleOAuth2Redirect(token, email, role);
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    }
  }
}
