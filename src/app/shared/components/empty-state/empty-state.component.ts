import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: true,
  imports: [IonIcon, IonButton, RouterLink],
})
export class EmptyStateComponent {
  @Input() icon = 'alert-circle-outline';
  @Input() title = 'Sin resultados';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionRoute = '';
}
