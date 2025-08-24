import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiStoresService } from '../services/stores.service';

@Component({
  selector: 'app-create-store',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-store.component.html',
  styleUrl: './create-store.component.css'
})
export class CreateStoreComponent {
  name: string = '';
  description: string = '';
  logo: File | null = null;
  site: string = '';
  message: string = '';

  private apiLogoUrl = 'http://localhost:3002/seller/upload-logo';

  constructor(private http: HttpClient, private createStoreService: ApiStoresService) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logo = input.files[0];
      console.log('Fichier sélectionné :', this.logo);
    }
  }

  isFormValid(): boolean {
    return this.name.length > 0 && this.description.length > 0 && this.logo !== null && this.site.length > 0;
  }  

  async onSubmit(): Promise<void> {
    if (!this.logo) {
      this.message = 'Veuillez sélectionner un logo.';
      return;
    }

    if (this.name.length > 30) {
      this.message = 'Le nom de la boutique ne peut pas dépasser 30 caractères.';
      return;
    }

    if (this.description.length > 255) {
      this.message = 'La description de la boutique ne peut pas dépasser 255 caractères.';
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('file', this.logo);
      console.log('FormData envoyé :', this.logo);
  
      const uploadResponse: any = await this.http.post(this.apiLogoUrl, formData, { withCredentials: true }).toPromise();
      console.log('Réponse upload logo :', uploadResponse);
  
      const logoUrl = uploadResponse.imageUrl;
  
      this.createStoreService.postCreateStore(this.name, this.description, logoUrl, this.site).subscribe(
        (response) => {
          console.log('Réponse création boutique :', response);
          this.message = `La boutique "${this.name}" a été créée avec succès.`;
        },
        (error) => {
          console.error('Erreur création boutique :', error);
          this.message = `Erreur lors de la création de la boutique "${this.name}".`;
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo :', error);
      this.message = 'Erreur lors de l\'upload du logo.';
    }
  }
}