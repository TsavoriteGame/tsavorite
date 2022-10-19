import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { EquipmentSlot, GameConstant, IGameCharacter, Interaction } from '../../../content/interfaces';
import { AddBackpackItem, AddHealth, ChangeAttack, RemoveCharacterItemById, SetEquipmentItem } from '../../../content/actions';
import { GameService } from '../core/services/game/game.service';
import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-character',
  templateUrl: './gameplay-character.component.html',
  styleUrls: ['./gameplay-character.component.scss']
})
export class GameplayCharacterComponent implements OnInit {

  @Select(GameState.characterWithAttacks) character$: Observable<IGameCharacter & { attacks: string[] }>;

  constructor(private store: Store, private gameService: GameService) { }

  ngOnInit(): void {
  }

  dropHealth($event) {
    const { backpackIndex, item } = $event.data;

    if(!item) {
      return;
    }

    if(backpackIndex < 0) {
      return;
    }

    if(!item.interaction || item.interaction.name !== Interaction.Heals) {
      return;
    }

    this.store.dispatch(new AddHealth(item.interaction.level))
      .subscribe(() => {
        this.store.dispatch(new RemoveCharacterItemById(item.cardId));
      });
  }

  shouldDisableHealthStealing(character: IGameCharacter): boolean {
    if(character.disallowHealthUpdates) {
      return true;
    }

    if(character.items.length === this.gameService.getConstant(GameConstant.BackpackSize)) {
      return true;
    }

    return false;
  }

  updateEquipment(character: IGameCharacter, slot: string, $event) {
    const newItem = $event.data.item;
    const realSlot = slot as EquipmentSlot;

    // recover an item if we place over it
    const existingItem = character.equipment[slot];
    if(existingItem) {
      if(existingItem.cardId === newItem.cardId) {
        return;
      }

      this.store.dispatch(new AddBackpackItem(existingItem));
    }

    // set the current item as equipped (or remove it)
    this.store.dispatch(new SetEquipmentItem(newItem, realSlot));

    // remove the item from the backpack if equipped
    if(newItem) {
      this.store.dispatch(new RemoveCharacterItemById(newItem.cardId));
    }
  }

  changeDefaultAttack(attack: string) {
    this.store.dispatch(new ChangeAttack(attack));
  }

}
