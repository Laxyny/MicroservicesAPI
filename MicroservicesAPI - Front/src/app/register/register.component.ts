import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule
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

  constructor(private http: HttpClient, private registerService: AuthService) { }

  onSubmit() {
    this.registerService.postRegister(this.email, this.name, this.password, this.role).subscribe(data => {
      console.log(data);
      this.message = 'Register OK';
    },
      (error) => {
        console.error(error);
        this.message = 'Register pas OK';
      }
    );
  }
}
