import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ProjetMicroservices';

  constructor(public router: Router) { }

  shouldShowLayout(): boolean {
    const hiddenRoutes = ['/login', '/register', '/'];
    return !hiddenRoutes.includes(this.router.url);
  }
}
