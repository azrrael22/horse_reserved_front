import { Component, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import { AuditLogListPage } from './audit-log-list.page';
import { CaballosListPage } from './caballos-list.page';
import { GuiasListPage } from './guias-list.page';
import { RutasAdminListPage } from './rutas-admin-list.page';
import { ProgresoCabalgatasPage } from './progreso-cabalgatas.page';
import { GananciasDashboardPage } from './ganancias-dashboard.page';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    AuditLogListPage,
    CaballosListPage,
    GuiasListPage,
    RutasAdminListPage,
    ProgresoCabalgatasPage,
    GananciasDashboardPage,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Recursos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="recursos-content">
      <div class="px-4 pt-4 pb-2">
        <ion-segment [value]="segmento()" (ionChange)="onSegmentChange($event)">
          <ion-segment-button value="caballos">
            <ion-label>Caballos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="guias">
            <ion-label>Guías</ion-label>
          </ion-segment-button>
          <ion-segment-button value="auditoria">
            <ion-label>Auditoría</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ganancias">
            <ion-label>Ganancias</ion-label>
          </ion-segment-button>
          <ion-segment-button value="rutas">
            <ion-label>Rutas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      @if (segmento() === 'caballos') {
        <app-caballos-list />
      } @else if (segmento() === 'guias') {
        <app-guias-list />
      } @else if (segmento() === 'auditoria') {
        <app-audit-log-list />
      } @else if (segmento() === 'rutas') {
        <app-rutas-admin-list />
      } @else {
        <app-ganancias-dashboard />
      }
    </ion-content>
  `,
  styles: [`
    ion-content.recursos-content {
      --background: #f9f5ef;
    }
  `],
})
export class RecursosPage {
  readonly segmento = signal<'caballos' | 'guias' | 'auditoria' | 'ganancias' | 'rutas'>('caballos');

  onSegmentChange(event: SegmentCustomEvent): void {
    this.segmento.set(event.detail.value as 'caballos' | 'guias' | 'auditoria' | 'ganancias' | 'rutas');
  }
}
