import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  accessibilityOutline,
  closeOutline,
  contrastOutline,
  textOutline,
  colorPaletteOutline,
} from 'ionicons/icons';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'app-accessibility-fab',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './accessibility-fab.component.html',
  styleUrl: './accessibility-fab.component.scss',
})
export class AccessibilityFabComponent {
  readonly a11y = inject(AccessibilityService);
  readonly panelOpen = signal(false);

  constructor() {
    addIcons({ accessibilityOutline, closeOutline, contrastOutline, textOutline, colorPaletteOutline });
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }
}
