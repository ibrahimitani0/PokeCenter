import { Component, OnInit } from '@angular/core';
import { BattleItems } from '../../../models/battle-items';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-item-info',
  standalone: false,
  templateUrl: './item-info.html',
  styleUrl: './item-info.css',
})
export class ItemInfo implements OnInit {
  item: BattleItems | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.data.subscribe({
      next: (data) => {
        this.item = data['item'];

        this.loading = false;
      },
      error: (err) => {
        this.error = err.mesage || 'item not found';
        this.loading = false;
      },
    });
  }

  getDisplayName(name: string): string {
    return name
      .split('-') // Split on dash
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each word
      )
      .join(' '); // Join with a space (no dash)
  }
}
