import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../services/orders.service';
import { ToastService } from '../services/toast.service';

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

  selectedPayment: 'card' | 'paypal' = 'card';
  termsAccepted: boolean = false;
  processingPayment: boolean = false;

  constructor(private cartService: CartService, private orderService: OrderService, private router: Router, private toastService: ToastService) { }

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
  
  selectPayment(method: 'card' | 'paypal') {
    this.selectedPayment = method;
  }

  onCardNumberInput(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    let formatted = '';

    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }

    this.payment.cardNumber = formatted;
  }

  onExpiryInput(event: any) {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length > 2) {
      this.payment.cardExpiry = input.substring(0, 2) + '/' + input.substring(2);
    } else {
      this.payment.cardExpiry = input;
    }
  }

  formatCardNumber(cardNumber?: string): string {
    if (!cardNumber) return '';
    return cardNumber;
  }

  formatExpiry(expiry: string): string {
    if (!expiry) return '';
    return expiry;
  }

  isPaymentValid(): boolean {
    if (!this.termsAccepted) return false;

    if (this.selectedPayment === 'card') {
      return Boolean (
        this.shipping.firstName &&
        this.shipping.lastName &&
        this.shipping.address &&
        this.shipping.zipCode &&
        this.shipping.city &&
        this.shipping.phone &&
        this.payment.cardNumber &&
        this.payment.cardHolder &&
        this.payment.cardExpiry &&
        this.payment.cardCVC
      );
    } else {
      return Boolean (
        this.shipping.firstName &&
        this.shipping.lastName &&
        this.shipping.address &&
        this.shipping.zipCode &&
        this.shipping.city &&
        this.shipping.phone
      );
    }
  }

  pay() {
    if (!this.isPaymentValid()) {
      this.toastService.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.processingPayment = true;

    setTimeout(() => {
      this.createOrder();
    }, 1500);
  }

  createOrder() {
    const orderData = {
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      shippingAddress: {
        firstName: this.shipping.firstName,
        lastName: this.shipping.lastName,
        address: this.shipping.address,
        zipCode: this.shipping.zipCode,
        city: this.shipping.city,
        phone: this.shipping.phone
      },
      paymentMethod: this.selectedPayment,
      total: this.total + this.shipping.cost
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.processingPayment = false;
        this.toastService.showSuccess('Votre commande a été passée avec succès !');
        this.cartService.clearCart().subscribe({
          next: () => {
            this.router.navigate(['/order-confirmation'], {
              queryParams: { orderId: response._id }
            });
          }
        });
      },
      error: (error) => {
        this.processingPayment = false;
        console.error('Erreur lors de la création de la commande', error);
        this.toastService.showError('Une erreur est survenue lors du traitement de votre commande.');
      }
    });
  }
}