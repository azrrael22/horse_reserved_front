import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  standalone: true,
})
export class UserAvatarComponent {
  @Input() firstName = '';
  @Input() lastName = '';
  @Input() photoUrl = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    const f = this.firstName?.charAt(0)?.toUpperCase() ?? '';
    const l = this.lastName?.charAt(0)?.toUpperCase() ?? '';
    return f + l || '?';
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'w-10 h-10 text-base';
      case 'lg': return 'w-24 h-24 text-3xl';
      default:   return 'w-20 h-20 text-2xl';
    }
  }
}
