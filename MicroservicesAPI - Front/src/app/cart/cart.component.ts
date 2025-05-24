import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [NgIf, NgFor],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) return;
    this.cartService.updateItemQuantity(item.productId, newQty);
  }

  removeFromCart(item: any) {
    this.cartService.removeFromCart(item.productId);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
