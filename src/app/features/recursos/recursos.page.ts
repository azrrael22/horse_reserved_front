import { Component, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import { CaballosListPage } from './caballos-list.page';
import { GuiasListPage } from './guias-list.page';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CaballosListPage,
    GuiasListPage,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Recursos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-segment [value]="segmento()" (ionChange)="onSegmentChange($event)">
        <ion-segment-button value="caballos">
          <ion-label>Caballos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="guias">
          <ion-label>Guías</ion-label>
        </ion-segment-button>
      </ion-segment>

      @if (segmento() === 'caballos') {
        <app-caballos-list />
      } @else {
        <app-guias-list />
      }
    </ion-content>
  `,
})
export class RecursosPage {
  readonly segmento = signal<'caballos' | 'guias'>('caballos');

  onSegmentChange(event: SegmentCustomEvent): void {
    this.segmento.set(event.detail.value as 'caballos' | 'guias');
  }
}
