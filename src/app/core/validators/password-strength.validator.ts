import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: ValidationErrors = {};
  if (value.length > 0 && value.length < 12) errors['minlength'] = { requiredLength: 12, actualLength: value.length };
  if (value.length >= 12 && !/[A-Z]/.test(value)) errors['requiresUppercase'] = true;
  if (value.length >= 12 && !/[0-9]/.test(value)) errors['requiresNumber'] = true;
  if (value.length >= 12 && !/[^A-Za-z0-9]/.test(value)) errors['requiresSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}
