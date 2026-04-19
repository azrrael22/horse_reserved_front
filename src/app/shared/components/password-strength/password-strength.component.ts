import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss'],
})
export class PasswordStrengthComponent {
  @Input() password = '';

  constructor() {
    addIcons({ checkmarkCircle, ellipseOutline });
  }

  get hasMinLength(): boolean { return this.password.length >= 12; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.password); }
  get hasNumber(): boolean { return /[0-9]/.test(this.password); }
  get hasSpecial(): boolean { return /[^A-Za-z0-9]/.test(this.password); }
}
