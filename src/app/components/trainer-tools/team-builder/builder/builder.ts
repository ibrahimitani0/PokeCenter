import { Component, ViewChild } from '@angular/core';
import { LocalStorage } from '../../../../services/local-storage';
import { PokemonEditor } from '../pokemon-editor/pokemon-editor';

@Component({
  selector: 'app-builder',
  standalone: false,
  templateUrl: './builder.html',
  styleUrl: './builder.css',
})
export class Builder {
  @ViewChild(PokemonEditor) editorComponent!: PokemonEditor;
  activeTeamIndex = 0; // or null if none selected yet
  showdownExportText = '';
  showExportArea = false;
  importMode = false;

  sidebarVisible = true;
  hidePokemonList = false; // <-- NEW FLAG

  constructor(public teamService: LocalStorage) {
    // Listen for Pokemon selection globally
    window.addEventListener('select-pokemon', (e: any) => {
      const mon = e.detail;
      this.hidePokemonList = !!mon; // hide list if mon is selected
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // This method is triggered when team selection changes
  onTeamSelected(index: number) {
    // Your existing team selection logic here
    this.activeTeamIndex = index;

    // Close the editor when switching teams:
    if (this.editorComponent) {
      this.editorComponent.cancel(); // sets selected = null
    }
  }

  toggleExportArea() {
    this.showExportArea = !this.showExportArea;
    if (!this.showExportArea) {
      this.showdownExportText = '';
      this.importMode = false;
    }
    if (this.editorComponent) {
      this.editorComponent.cancel(); // sets selected = null
    }
  }

  export() {
    this.showdownExportText = this.teamService.exportAsShowdownText();
    this.importMode = false;
  }

  startImport() {
    this.showdownExportText = '';
    this.importMode = true;
  }

  confirmImport() {
    if (
      confirm(
        'Are you sure you want to import teams from the text area? This will replace all current teams.'
      )
    ) {
      this.teamService.importFromText(this.showdownExportText);
      this.importMode = false;
    }
  }

  cancelImport() {
    this.importMode = false;
    this.showdownExportText = this.teamService.exportAsShowdownText();
  }

  closeExport() {
    this.showExportArea = false;
    this.showdownExportText = '';
    this.importMode = false;
  }
}
