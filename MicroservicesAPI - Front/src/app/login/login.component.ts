import { Component } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ApiLoginService } from '../services/api_login.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private http: HttpClient, private loginService: ApiLoginService) { }

  onSubmit() {
    this.loginService.postLogin(this.email, this.password).subscribe(data => {
        console.log(data);
        this.message = 'Connexion OK';
      },
      (error) => {
        console.log(error);
        this.message = 'Connexion pas OK';
      }
    );
  }
}
