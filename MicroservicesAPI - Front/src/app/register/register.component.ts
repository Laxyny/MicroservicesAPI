import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  name: string = '';
  password: string = '';
  role: string = 'user';
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private registerService: AuthService,
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    this.isLoading = true;
    this.message = 'Création de votre compte...';

    this.registerService.postRegister(this.email, this.name, this.password, this.role).subscribe(
      (data) => {
        console.log('Compte créé avec succès:', data);
        this.message = 'Compte créé avec succès, connexion en cours...';

        this.authService.postLogin(this.email, this.password).subscribe(
          (loginResponse) => {
            console.log('Connexion réussie:', loginResponse);
            this.message = 'Connexion réussie, redirection en cours...';

            this.authService.checkAuthStatus().then((isAuthenticated) => {
              if (isAuthenticated) {
                this.router.navigate(['/homepage']);
              } else {
                console.error('Échec de l\'authentification après création du compte');
                this.message = 'Échec de l\'authentification automatique, veuillez vous connecter manuellement.';
                this.isLoading = false;
              }
            });
          },
          (loginError) => {
            console.error('Erreur lors de la connexion automatique:', loginError);
            this.message = 'Compte créé mais connexion automatique impossible. Veuillez vous connecter manuellement.';
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        );
      },
      (error) => {
        console.error('Erreur lors de la création du compte:', error);
        this.message = error.error?.message || 'Erreur lors de la création du compte.';
        this.isLoading = false;
      }
    );
  }

  registerWithGoogle() {
    this.http.get('http://localhost:5000/auth/google-url').subscribe(
      (response: any) => {
        window.location.href = response.url;
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'URL Google:', error);
        this.message = 'Erreur lors de l\'inscription avec Google.';
      }
    );
  }
}
