import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoFactorService } from '../services/twofactor.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-security-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.css'
})
export class SecuritySettingsComponent {
  userId: string = '';
  twoFactorEnabled: boolean = false;
  twoFactorVerified: boolean = false;
  setupData: any = null;
  verificationCode: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      if (user) {
        this.userId = user._id || user.userId;
        this.checkTwoFactorStatus();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  }

  checkTwoFactorStatus() {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.twoFactorService.getStatus(this.userId).subscribe({
      next: (status) => {
        this.twoFactorEnabled = status.enabled;
        this.twoFactorVerified = status.verified;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du statut 2FA:', err);
        this.isLoading = false;
      }
    });
  }

  setupTwoFactor() {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.twoFactorService.setup(this.userId).subscribe({
      next: (data) => {
        this.setupData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la configuration 2FA:', err);
        this.errorMessage = 'Erreur lors de la configuration. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  verifyCode() {
    if (!this.userId || !this.verificationCode) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.twoFactorService.verify(this.userId, this.verificationCode).subscribe({
      next: (result) => {
        if (result.success) {
          this.twoFactorEnabled = true;
          this.twoFactorVerified = true;
          this.setupData = null;
          this.verificationCode = '';
          this.successMessage = 'Double authentification activée avec succès !';
        } else {
          this.errorMessage = 'Code invalide. Veuillez réessayer.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du code:', err);
        this.errorMessage = 'Code invalide ou expiré. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  disableTwoFactor() {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.twoFactorService.disable(this.userId).subscribe({
      next: (result) => {
        if (result.success) {
          this.twoFactorEnabled = false;
          this.twoFactorVerified = false;
          this.successMessage = 'Double authentification désactivée avec succès.';
        } else {
          this.errorMessage = 'Erreur lors de la désactivation. Veuillez réessayer.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la désactivation 2FA:', err);
        this.errorMessage = 'Erreur lors de la désactivation. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }
}
