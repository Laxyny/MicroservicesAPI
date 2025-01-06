import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private loginService: AuthService, private router: Router, private authService: AuthService) { }

  onSubmit() {
    this.loginService.postLogin(this.email, this.password).subscribe(
      (response) => {
        console.log('Réponse du backend :', response);
        this.message = 'Connexion réussie, redirection en cours...';
        this.authService.checkAuthStatus().then((isAuthenticated) => {
          if (isAuthenticated) {
            this.router.navigate(['/homepage']);
          } else {
            console.error('Échec de l\'authentification après connexion');
          }
        });
      },
      (error) => {
        console.error('Erreur lors de la connexion :', error);
        this.message = 'Connexion échouée.';
      }
    );
  }
}
