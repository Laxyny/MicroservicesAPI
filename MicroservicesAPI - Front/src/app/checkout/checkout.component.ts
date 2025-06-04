import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  selectedPayment: string = 'card';
  termsAccepted: boolean = false;

  shipping = {
    firstName: '',
    lastName: '',
    address: '',
    zipCode: '',
    city: '',
    phone: '',
    cost: 4.99
  };

  payment = {
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCVC: ''
  };

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.total = this.subtotal;
  }

  selectPayment(method: string) {
    this.selectedPayment = method;
  }

  onCardNumberInput(event: any) {
    let input = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const blocks = [4, 4, 4, 4];
    let result = '';
    
    blocks.forEach((length, index) => {
      if (input.length > 0) {
        const block = input.substring(0, length);
        result += block;
        if (block.length === length && index < blocks.length - 1) {
          result += ' ';
        }
        input = input.substring(length);
      }
    });
    
    this.payment.cardNumber = result;
  }
  
  formatCardNumber(cardNumber?: string): string {
    if (!cardNumber) return '';
    return cardNumber;
  }
  
  onExpiryInput(event: any) {
    let input = event.target.value.replace(/[^0-9]/g, '');
    if (input.length > 2) {
      input = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
    this.payment.cardExpiry = input;
  }
  
  formatExpiry(expiry?: string): string {
    return expiry || '';
  }
  
  isPaymentValid(): boolean {
    if (!this.termsAccepted) return false;
    
    if (this.selectedPayment === 'card') {
      return !!(
        this.payment.cardNumber.replace(/\s/g, '').length === 16 &&
        this.payment.cardHolder &&
        this.payment.cardExpiry.length === 5 &&
        this.payment.cardCVC.length === 3 &&
        this.shipping.firstName &&
        this.shipping.lastName &&
        this.shipping.address &&
        this.shipping.zipCode &&
        this.shipping.city
      );
    }
    
    return !!(
      this.shipping.firstName &&
      this.shipping.lastName &&
      this.shipping.address &&
      this.shipping.zipCode &&
      this.shipping.city
    );
  }

  pay() {
    if (!this.isPaymentValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    alert('Paiement effectué ! Merci pour votre commande.');
    this.cartService.clearCart();
    this.router.navigate(['/homepage']);
  }
}