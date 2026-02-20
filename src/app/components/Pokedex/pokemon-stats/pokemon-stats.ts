import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Chart,
  registerables,
  Plugin,
} from 'chart.js';
import { Pokemon } from '../../../models/Pokemon/poke-details';

Chart.register(...registerables);

const drawStatLabelsWithValuesPlugin: Plugin<'radar'> = {
  id: 'drawStatLabelsWithValues',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const scale = chart.scales['r'] as any;

    const labels = chart.data.labels as string[];
    const data = chart.data.datasets[0]?.data as number[];

    if (!scale || !labels || !data) return;

    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const count = labels.length;
    const radius = scale.getDistanceFromCenterForValue(scale.max);

    const numberOffset = 20;
    const verticalSpacing = 16;

    ctx.save();
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color')
        .trim() || '#000';
    ctx.textAlign = 'center';

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;

      const numberX = centerX + Math.cos(angle) * (radius + numberOffset);
      const numberY = centerY + Math.sin(angle) * (radius + numberOffset);

      const labelX = numberX;
      let labelY = numberY;

      // Check if point is in bottom half
      const isBottom = angle > 0 && angle < Math.PI;

      if (isBottom) {
        // Label below number
        ctx.textBaseline = 'top';
        labelY = numberY + verticalSpacing;
        ctx.fillText(String(data[i]), numberX, numberY );
        ctx.fillText(labels[i], labelX, labelY);
      } else {
        // Label above number
        ctx.textBaseline = 'bottom';
        labelY = numberY - verticalSpacing;
        ctx.fillText(labels[i], labelX, labelY);
        ctx.textBaseline = 'top';
        ctx.fillText(String(data[i]), numberX, numberY);
      }
    }

    ctx.restore();
  },
};

@Component({
  selector: 'app-pokemon-stats',
  standalone: false,
  templateUrl: './pokemon-stats.html',
  styleUrl: './pokemon-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonStats implements AfterViewInit {
  @Input() pokemon: Pokemon | null = null;
  @Input() allPokemon: Pokemon[] = [];
  @ViewChild('radarChart', { static: false })
  radarChartRef!: ElementRef<HTMLCanvasElement>;

  chart?: Chart<'radar', number[], string>;
  private chartInitialized = false;

  statsLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

  compareSearch: string = '';
  filteredPokemon: Pokemon[] = [];
  showDropdown = false;
  comparisonPokemon: (Pokemon & { statsMap: Record<string, number> }) | null =
    null;

  statViewMode: 'table' | 'chart' = 'table';

  typeColors: Record<string, string> = {
    grass: '#78C850',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dark: '#705848',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
    normal: '#A8A878',
  };
  switchToChartView() {
    this.statViewMode = 'chart';
    setTimeout(() => this.createChart(), 50);
  }

  ngAfterViewInit(): void {
    if (
      this.statViewMode === 'chart' &&
      !this.chartInitialized &&
      this.radarChartRef?.nativeElement
    ) {
      this.createChart();
      this.chartInitialized = true;
    }

    if (this.statViewMode !== 'chart' && this.chartInitialized) {
      this.destroyChart();
      this.chartInitialized = false;
    }
  }

  createChart() {
    this.destroyChart();
    if (!this.radarChartRef?.nativeElement) return;

    const statValues = this.pokemon?.stats.map((s) => s.base_stat) || [];

    this.chart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: this.statsLabels,
        datasets: [
          {
            label: 'Base Stats',
            data: statValues,
            fill: true,
            backgroundColor: 'rgba(30, 136, 229, 0.25)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(30, 136, 229, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        layout: { padding: 50 },
        scales: {
          r: {
            min: 0,
            max: this.getMaxStatValue(),
            angleLines: { color: '#aaa', lineWidth: 1 },
            grid: { color: '#ccc', lineWidth: 1 },
            pointLabels: {
              font: { size: 0 }, // hidden, since we draw our own
            },
            ticks: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(30, 136, 229, 0.85)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 8,
            cornerRadius: 4,
          },
        },
      },
      plugins: [drawStatLabelsWithValuesPlugin],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemon'] && this.statViewMode === 'chart') {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.chart) {
      this.createChart();
      return;
    }
    this.chart.data.datasets[0].data =
      this.pokemon?.stats.map((s) => s.base_stat) || [];

    const rScale = this.chart.options?.scales?.['r'];
    if (rScale) {
      rScale.max = this.getMaxStatValue();
    }
    this.chart.update();
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  getMaxStatValue(): number {
    if (!this.pokemon?.stats?.length) return 150;
    const maxStat = Math.max(...this.pokemon.stats.map((s) => s.base_stat));

    // Add some padding so the top stat doesn't touch the edge
    const paddedMax = maxStat + 20;

    // Round up nicely to nearest 10 or 20
    return Math.ceil(paddedMax / 10) * 10;
  }

  calculateStatRange(
    statName: string,
    base: number
  ): { min: number; max: number } {
    const level = 100;
    const ivMin = 0;
    const ivMax = 31;
    const evMin = 0;
    const evMax = 252;

    if (statName.toLowerCase() === 'hp') {
      const min =
        Math.floor(((2 * base + ivMin + Math.floor(evMin / 4)) * level) / 100) +
        level +
        10;
      const max =
        Math.floor(((2 * base + ivMax + Math.floor(evMax / 4)) * level) / 100) +
        level +
        10;
      return { min, max };
    } else {
      const min = Math.floor(
        (((2 * base + ivMin + Math.floor(evMin / 4)) * level) / 100 + 5) * 0.9
      );
      const max = Math.floor(
        (((2 * base + ivMax + Math.floor(evMax / 4)) * level) / 100 + 5) * 1.1
      );
      return { min, max };
    }
  }

  getTotalStats(stats: { base_stat: number }[]): number {
    return stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  }

  getStatColorByValue(statValue: number): string {
    if (statValue >= 150) return 'stat-blue';
    if (statValue >= 120) return 'stat-dark-green';
    if (statValue >= 90) return 'stat-green';
    if (statValue >= 60) return 'stat-yellow';
    if (statValue >= 30) return 'stat-orange';
    return 'stat-red';
  }

  getBackgroundGradient(type: string): string {
    const gradients: Record<string, string> = {
      normal: 'linear-gradient(135deg, #d3d3b8, #f4f4e4)',
      fire: 'linear-gradient(135deg, #ff9a7c, #ffd2b1)',
      water: 'linear-gradient(135deg, #7ec8e3, #cfefff)',
      electric: 'linear-gradient(135deg, #ffe873, #fffacd)',
      grass: 'linear-gradient(135deg, #a8e6a3, #e0ffe0)',
      ice: 'linear-gradient(135deg, #b0e0e6, #e8f9ff)',
      fighting: 'linear-gradient(135deg, #e67e7e, #ffd6d6)',
      poison: 'linear-gradient(135deg, #d09bdf, #f3e6f9)',
      ground: 'linear-gradient(135deg, #e4c97c, #faf0d7)',
      flying: 'linear-gradient(135deg, #c3bfff, #e9e5ff)',
      psychic: 'linear-gradient(135deg, #fcb6d0, #ffe0eb)',
      bug: 'linear-gradient(135deg, #bde06f, #f0f8d8)',
      rock: 'linear-gradient(135deg, #c6b98b, #f0e7d3)',
      ghost: 'linear-gradient(135deg, #b49bd7, #e8dcfa)',
      dragon: 'linear-gradient(135deg, #a787ff, #e6d6ff)',
      dark: 'linear-gradient(135deg, #a89a92, #e2ddd9)',
      steel: 'linear-gradient(135deg, #d3d3dc, #f0f0f5)',
      fairy: 'linear-gradient(135deg, #f6bde2, #ffe6f4)',
    };
    return gradients[type?.toLowerCase()] || '#ffffff';
  }

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }

  filterPokemon() {
    const val = this.compareSearch.toLowerCase();
    this.filteredPokemon = this.allPokemon.filter((p) =>
      p.name.toLowerCase().includes(val)
    );
  }

  selectPokemonToCompare(poke: Pokemon) {
    const statsMap: Record<string, number> = {};
    for (const stat of poke.stats) {
      statsMap[stat.name] = stat.base_stat;
    }
    this.comparisonPokemon = { ...poke, statsMap };

    this.showDropdown = false;
    this.compareSearch = '';
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: EventTarget | null) {
    if (!(targetElement instanceof HTMLElement)) {
      return; // If it's null or not an HTMLElement, just return early
    }
    const clickedInside = targetElement.closest('.compare-search-container');
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }

  getStatComparisonClass(val: number, otherVal: number): string {
    if (val > otherVal) return 'stat-better';
    if (val < otherVal) return 'stat-worse';
    return '';
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }
}
