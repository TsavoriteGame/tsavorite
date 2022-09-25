import { Component, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LandmarkEncounter } from '../../../content/interfaces';
import { MakeChoice } from '../core/services/game/actions';
import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-event',
  templateUrl: './gameplay-event.component.html',
  styleUrls: ['./gameplay-event.component.scss']
})
export class GameplayEventComponent implements OnInit {

  @Select(GameState.landmarkEncounterData) landmarkEncounterData$: Observable<LandmarkEncounter>;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  makeChoice(choice: number): void {
    this.store.dispatch(new MakeChoice(choice));
  }

  @HostListener('document:keydown.1', ['$event'])
  choice0() {
    this.store.dispatch(new MakeChoice(0));
  }

  @HostListener('document:keydown.2', ['$event'])
  choice1() {
    this.store.dispatch(new MakeChoice(1));
  }

  @HostListener('document:keydown.3', ['$event'])
  choice2() {
    this.store.dispatch(new MakeChoice(2));
  }

  @HostListener('document:keydown.4', ['$event'])
  choice3() {
    this.store.dispatch(new MakeChoice(3));
  }

  @HostListener('document:keydown.5', ['$event'])
  choice4() {
    this.store.dispatch(new MakeChoice(4));
  }

}
