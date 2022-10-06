import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ILandmarkEncounter } from '../../../content/interfaces';
import { AddCardToSlot, MakeChoice } from '../core/services/game/actions';
import { Keybind, KeybindsService } from '../core/services/game/keybinds.service';
import { GameState, IGameCharacter } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-event',
  templateUrl: './gameplay-event.component.html',
  styleUrls: ['./gameplay-event.component.scss']
})
export class GameplayEventComponent implements OnInit, OnDestroy {

  @Select(GameState.character) character$: Observable<IGameCharacter>;
  @Select(GameState.landmarkEncounterData) landmarkEncounterData$: Observable<ILandmarkEncounter>;
  @Select(GameState.eventMessage) eventMessage$: Observable<string>;

  constructor(private store: Store, private keybindsService: KeybindsService) { }

  ngOnInit(): void {
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.Choice1), () => this.makeChoice(0));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.Choice2), () => this.makeChoice(1));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.Choice3), () => this.makeChoice(2));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.Choice4), () => this.makeChoice(3));
  }

  ngOnDestroy(): void {
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.Choice1));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.Choice2));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.Choice3));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.Choice4));
  }

  identify(index) {
    return index;
  }

  makeChoice(choice: number): boolean {
    this.store.dispatch(new MakeChoice(choice));
    return true;
  }

  addCardToSlot($event, slot: number): boolean {
    if(!$event.data.item) {
      return false;
    }

    this.store.dispatch(new AddCardToSlot(slot, $event.data.item));
    return true;
  }

  addCardToPlayerSlot($event, slot: number): boolean {
    if(!$event.data.attack) {
      return false;
    }

    console.log($event);

    return true;
  }

}
