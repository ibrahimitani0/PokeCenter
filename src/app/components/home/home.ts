import { Component } from '@angular/core';

interface PokemonType {
  name: string;
  color?: string; // Optional, in case you want to use custom type colors
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  
  types: PokemonType[] = [
    { name: 'normal' },
    { name: 'fire' },
    { name: 'water' },
    { name: 'electric' },
    { name: 'grass' },
    { name: 'ice' },
    { name: 'fighting' },
    { name: 'poison' },
    { name: 'ground' },
    { name: 'flying' },
    { name: 'psychic' },
    { name: 'bug' },
    { name: 'rock' },
    { name: 'ghost' },
    { name: 'dragon' },
    { name: 'dark' },
    { name: 'steel' },
    { name: 'fairy' }
  ];
}
