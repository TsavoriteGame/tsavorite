import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Interaction } from '../../../content/interfaces';
import { AddHealth, RemoveBackpackItem } from '../core/services/game/actions';
import { GameConstant, GameService } from '../core/services/game/game.service';
import { GameState, IGameCharacter } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-character',
  templateUrl: './gameplay-character.component.html',
  styleUrls: ['./gameplay-character.component.scss']
})
export class GameplayCharacterComponent implements OnInit {

  @Select(GameState.character) character$: Observable<IGameCharacter>;

  constructor(private store: Store, private gameService: GameService) { }

  ngOnInit(): void {
  }

  dropHealth($event) {
    const { backpackIndex, item } = $event.data;

    if(!item) return;
    if(backpackIndex < 0) return;
    if(!item.interaction || item.interaction.name !== Interaction.Heals) return;

    this.store.dispatch(new AddHealth(item.interaction.level))
      .subscribe(() => {
        this.store.dispatch(new RemoveBackpackItem(backpackIndex));
      });
  }

  shouldDisableHealthStealing(character: IGameCharacter): boolean {
    if(character.hp <= 1) return true;
    if(character.items.length === this.gameService.getConstant(GameConstant.BackpackSize)) return true;

    return false;
  }

}
