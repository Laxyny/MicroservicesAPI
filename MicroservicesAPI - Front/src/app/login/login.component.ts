import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { TwoFactorService } from '../services/twofactor.service';
import { TwoFactorModalComponent } from '../two-factor-modal/two-factor-modal.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TwoFactorModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('twoFactorModal') twoFactorModal!: TwoFactorModalComponent;

  email: string = '';
  password: string = '';
  message: string = '';
  show2FAModal: boolean = false;
  currentUserId: string = '';

  constructor(private http: HttpClient, private loginService: AuthService, private router: Router, private authService: AuthService, private twoFactorService: TwoFactorService) { }

  onSubmit() {
    this.message = 'Connexion en cours...';

    this.loginService.postLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Réponse de connexion:', response);
        if (response.requiresTwoFactor) {
          console.log('2FA requis, affichage du modal');
          this.currentUserId = response.userId;
          this.show2FAModal = true;
          this.message = '';
        } else {
          this.message = 'Connexion réussie, redirection en cours...';
          this.redirectAfterLogin();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la connexion :', error);
        this.message = error.error?.message || 'Connexion échouée.';
      }
    });
  }

  verifyTwoFactorCode(code: string) {
    this.twoFactorModal.setLoading(true);
    this.loginService.postLogin(this.email, this.password, code).subscribe({
      next: () => {
        this.show2FAModal = false;
        this.message = 'Connexion réussie, redirection en cours...';
        this.redirectAfterLogin();
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du code 2FA:', error);
        this.twoFactorModal.setError(error.error?.message || 'Code invalide.');
        this.twoFactorModal.setLoading(false);
      }
    });
  }

  private redirectAfterLogin() {
    this.authService.checkAuthStatus().then((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/homepage']);
      } else {
        console.error('Échec de l\'authentification');
        this.message = 'Erreur lors de la connexion';
      }
    });
  }

  closeTwoFactorModal() {
    this.show2FAModal = false;
  }

  loginWithGoogle() {
    this.http.get('http://localhost:5000/auth/google-url').subscribe(
      (response: any) => {
        window.location.href = response.url;
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'URL Google:', error);
        this.message = 'Erreur lors de la connexion avec Google.';
      }
    );
  }
}
