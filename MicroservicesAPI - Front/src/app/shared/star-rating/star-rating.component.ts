import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})

export class StarRatingComponent implements OnInit {
  stars: { filled: boolean, hover: boolean }[] = [];
  @Input() rating: number = 0;
  @Input() ratingCount: number | undefined;
  @Input() interactive: boolean = true;
  @Input() showCount: boolean = false;
  @Output() rateChange = new EventEmitter<number>();

  hovered: number = 0;

  constructor() {
    console.log('Système de notes initialisé');
  }

  ngOnInit() {
    this.updateStars();
  }

  updateStars() {
    this.stars = Array(5).fill(0).map((_, i) => ({
      filled: i < Math.round(this.rating),
      hover: false
    }));
  }

  onRatingChange(rating: number) {
    if (!this.interactive) return;
    console.log('Star component : clic sur', rating);
    this.rateChange.emit(rating);
  }

  onStarHover(star: number) {
    if (this.interactive) {
      this.hovered = star;
    }
  }

  onStarClick(star: number) {
    if (this.interactive) {
      this.rateChange.emit(star);
    }
  }
}