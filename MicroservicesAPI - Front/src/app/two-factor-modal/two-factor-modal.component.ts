import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-two-factor-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor-modal.component.html',
  styleUrl: './two-factor-modal.component.css'
})
export class TwoFactorModalComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() verify = new EventEmitter<string>();

  verificationCode: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor() { }

  onSubmit() {
    if (this.verificationCode.length !== 6) {
      this.errorMessage = 'Veuillez saisir un code à 6 chiffres';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.verify.emit(this.verificationCode);
  }
  
  setError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
  }
  
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
  
  resetForm() {
    this.verificationCode = '';
    this.errorMessage = '';
    this.isLoading = false;
  }
  
  closeModal() {
    this.resetForm();
    this.close.emit();
  }
}
