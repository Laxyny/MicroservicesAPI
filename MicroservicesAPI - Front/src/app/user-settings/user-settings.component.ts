import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-user-settings',
  imports: [NgIf, CommonModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {

  user: any = null;
  isGoogleAccount = false;
  roleChangeError = false;
  isUpdating = false;
  isDeleting = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/user', { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.user = res;
        this.isGoogleAccount = res.googleId;
      },
      error: (err) => {
        console.error('Erreur de récupération utilisateur :', err);
      },
    });
  }

  onRoleChange() {
    if (this.user.role === 'client') {
      this.http.get<any[]>(`http://localhost:3002/stores/user`, { withCredentials: true }).subscribe({
        next: (stores) => {
          if (stores.length > 0) {
            this.roleChangeError = true;
            this.user.role = 'seller';
          } else {
            this.roleChangeError = false;
          }
        },
        error: () => {
          this.roleChangeError = true;
          this.user.role = 'seller';
        },
      });
    }
  }

  updateUser() {
    if (!this.user || !this.user._id) {
      alert("Impossible de mettre à jour le profil. ID utilisateur introuvable.");
      return;
    }

    this.http.put(`http://localhost:3000/user/updateUser/${this.user._id}`, this.user, { withCredentials: true }).subscribe({
      next: () => {
        alert('Profil mis à jour');
        this.router.navigate(['/homepage']);
      },
      error: (err) => {
        console.error('Erreur mise à jour :', err);
        alert('Erreur pendant la mise à jour.');
      },
    });
  }

  deleteUser() {
    if (!this.user || !this.user._id) {
      alert("Impossible de supprimer le profil. ID utilisateur introuvable.");
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) return;
    if (!confirm('Cette action est irréversible.')) return;

    if (this.user.role === 'seller') {
      this.http.get<any[]>(`http://localhost:3002/seller/stores`, { withCredentials: true }).subscribe({
        next: (stores) => {
          if (stores.length > 0) {
            alert('Vous devez d\'abord supprimer vos boutiques et produits avant de supprimer votre compte.');
            return;
          } else {
            this.performDelete();
          }
        },
        error: () => {
          alert('Impossible de vérifier les boutiques. Veuillez réessayer.');
        },
      });
    } else {
      this.performDelete();
    }
  }

  performDelete() {
    this.http.delete(`http://localhost:3000/user/deleteUser/${this.user._id}`, { withCredentials: true }).subscribe({
      next: () => {
        alert('Profil supprimé avec succès');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erreur suppression :', err);
        alert('Erreur pendant la suppression.');
      },
    });
  }
}
