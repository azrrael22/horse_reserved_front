import { Component, Input } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular/standalone';

export type CardSkeletonVariant = 'ruta-card' | 'reserva-card' | 'list-row';

@Component({
  selector: 'app-card-skeleton',
  templateUrl: './card-skeleton.component.html',
  standalone: true,
  imports: [IonSkeletonText],
})
export class CardSkeletonComponent {
  @Input() variant: CardSkeletonVariant = 'ruta-card';
  @Input() count = 3;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
