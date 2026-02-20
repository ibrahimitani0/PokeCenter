import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { LocalStorage } from '../../../../services/local-storage';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Team } from '../../../../models/team';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { faArrows } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-team-manager',
  standalone: false,
  templateUrl: './team-manager.html',
  styleUrl: './team-manager.css',
})
export class TeamManager {
  @Output() teamSelected = new EventEmitter<number>();
  teams$: Observable<Team[]>;
  activeIndex$: Observable<number>;
  newName = '';
  faArrows = faArrows;

  editingIndex: number | null = null;
  editedName = '';

  constructor(private teamService: LocalStorage, private elRef: ElementRef) {
    this.teams$ = this.teamService.teams$;
    this.activeIndex$ = this.teamService.activeIndex$;
  }

  addTeam() {
    this.teamService.addTeam(this.newName || undefined);
    this.newName = '';
  }

  select(index: number) {
    this.teamSelected.emit(index);
    this.teamService.setActive(index);
  }

  remove(index: number) {
    if (confirm('Remove this team?')) {
      this.teamService.removeTeam(index);
    }
  }

  startEditing(index: number) {
    this.editingIndex = index;
    this.teams$.pipe(take(1)).subscribe((teams) => {
      this.editedName = teams[index].name;
    });
  }

  stopEditing(save: boolean = false) {
    if (save && this.editingIndex !== null) {
      // Save the edited name back to your teams list
      this.teams$.pipe(take(1)).subscribe((teams) => {
        teams[this.editingIndex!].name = this.editedName;
      });
    }
    this.editingIndex = null;
    this.editedName = '';
  }

  saveName(index: number) {
    const trimmed = this.editedName.trim();
    if (trimmed) {
      this.teamService.renameTeam(index, trimmed);
    }
    this.cancelEditing();
  }

  cancelEditing() {
    this.editingIndex = null;
    this.editedName = '';
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) return;
    this.teamService.reorderTeams(event.previousIndex, event.currentIndex);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.stopEditing(); // discard changes if clicked outside
    }
  }
}
