import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private loginService: AuthService, private router: Router, private authService: AuthService) { }

  message: string = '';

  loginWithGoogle() {
    window.location.href = 'http://localhost:5000/auth/google';
  }
}