import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { getCombinationBetweenTwoItems,
  getReactionBetweenTwoItems } from '../../../content/helpers';
import { Descriptor, ItemConfig } from '../../../content/interfaces';
import { AddBackpackItem, ReduceHealth, RemoveBackpackItem, UpdateBackpackItem } from '../core/services/game/actions';
import { ContentService } from '../core/services/game/content.service';
import { GameConstant, GameService } from '../core/services/game/game.service';
import { GameState, IGame, IGameCharacter } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-backpack',
  templateUrl: './gameplay-backpack.component.html',
  styleUrls: ['./gameplay-backpack.component.scss']
})
export class GameplayBackpackComponent implements OnInit {

  @Select(GameState.character) character$: Observable<IGameCharacter>;

  public readonly slots = Array(this.gameService.getConstant(GameConstant.BackpackSize))
    .fill(undefined)
    .map((x, i) => i);

  public discardItem: ItemConfig;
  public indexDiscard = -1;

  public combineLeft: ItemConfig;
  public combineRight: ItemConfig;
  public indexLeft = -1;
  public indexRight = -1;

  public applicombineResultMessage: Subject<string> = new Subject<string>();
  public applicombineResultMessage$ = this.applicombineResultMessage.asObservable();
  public timer$: Subscription;

  constructor(private store: Store, private contentService: ContentService, private gameService: GameService) { }

  ngOnInit(): void {
  }

  dropDiscard($event) {
    const { backpackIndex, item } = $event.data;
    if(!item) return;

    this.discardItem = item;
    this.indexDiscard = backpackIndex;
  }

  dropLeft($event) {
    const { backpackIndex, item } = $event.data;
    if(!item || item === this.combineRight) return;

    this.combineLeft = item;
    this.indexLeft = backpackIndex;
  }

  dropRight($event) {
    const { backpackIndex, item } = $event.data;
    if(!item || item === this.combineLeft) return;

    this.combineRight = item;
    this.indexRight = backpackIndex;
  }

  reaction(character: IGameCharacter) {
    if(!this.combineLeft || !this.combineRight) return;

    const result = getReactionBetweenTwoItems(this.combineLeft, this.combineRight);

    // checking how many slots are available to do things
    const numExtraItems = result.extraItems ? result.extraItems.length : 0;
    const extraSlots = (result.newSource ? 0 : 1) + (result.newTarget ? 0 : 1);

    // make sure we have enough space to perform a reaction. in the future, we might just do it anyway and truncate.
    if((character.items.length - extraSlots) + numExtraItems > this.gameService.getConstant(GameConstant.BackpackSize)) {
      this.flashMessage('You don\'t have enough space in your backpack to perform this reaction.');
      return;
    }

    if(result.success) {

      // update or remove the source item
      if(result.newSource)
        this.store.dispatch(new UpdateBackpackItem(this.indexLeft, result.newSource));
      else
        this.store.dispatch(new RemoveBackpackItem(this.indexLeft));


      // update or remove the target item
      if(result.newTarget)
        this.store.dispatch(new UpdateBackpackItem(this.indexRight, result.newSource));
      else
        this.store.dispatch(new RemoveBackpackItem(this.indexRight));
    }

    // add any extra items
    if(result.extraItems) {
      result.extraItems.forEach(item => {
        this.store.dispatch(new AddBackpackItem(item));
      });
    }

    this.flashMessage(result.message);

    this.cancelApplicombine();
  }

  combine(character: IGameCharacter) {
    if(!this.combineLeft || !this.combineRight) return;

    const result = getCombinationBetweenTwoItems(this.combineLeft, this.combineRight);

    // checking how many slots are available to do things
    const numExtraItems = result.extraItems ? result.extraItems.length : 0;
    const extraSlots = (result.newSource ? 0 : 1) + (result.newTarget ? 0 : 1);

    // make sure we have enough space to perform a reaction. in the future, we might just do it anyway and truncate.
    if((character.items.length - extraSlots) + numExtraItems > this.gameService.getConstant(GameConstant.BackpackSize)) {
      this.flashMessage('You don\'t have enough space in your backpack to perform this combination.');
      return;
    }

    if(result.success) {

      // update or remove the source item
      if(result.newSource)
        this.store.dispatch(new UpdateBackpackItem(this.indexLeft, result.newSource));
      else
        this.store.dispatch(new RemoveBackpackItem(this.indexLeft));


      // update or remove the target item
      if(result.newTarget)
        this.store.dispatch(new UpdateBackpackItem(this.indexRight, result.newSource));
      else
        this.store.dispatch(new RemoveBackpackItem(this.indexRight));
    }

    // add any extra items
    if(result.extraItems) {
      result.extraItems.forEach(item => {
        this.store.dispatch(new AddBackpackItem(item));
      });
    }

    this.flashMessage(result.message);

    this.cancelApplicombine();
  }

  discard() {
    if(!this.discardItem) return;

    this.store.dispatch(new RemoveBackpackItem(this.indexDiscard)).subscribe(() => {
      this.cancelDiscard();
    });
  }

  flashMessage(message: string) {
    if(this.timer$) this.timer$.unsubscribe();

    this.applicombineResultMessage.next(message);

    this.timer$ = timer(3000).subscribe(() => this.applicombineResultMessage.next(''));
  }

  cancelApplicombine() {
    this.combineLeft = undefined;
    this.combineRight = undefined;
    this.indexLeft = -1;
    this.indexRight = -1;
  }

  cancelDiscard() {
    this.discardItem = undefined;
    this.indexDiscard = -1;
  }

  isItemInSlot(item: ItemConfig, index: number): boolean {
    return index === this.indexLeft || index === this.indexRight || index === this.indexDiscard;
  }

  canDragItem(item: ItemConfig | undefined, slot: number): boolean {
    if(!item) return false;
    if(this.isItemInSlot(item, slot)) return false;

    return true;
  }

  dropOnBackpack($event) {
    const { takeHealth } = $event.data;

    // if this drop is a take-health drop, we make a new heart item
    if(takeHealth > 0) {
      const healthItem = this.contentService.getItemById('HealingHeart-1');

      this.store.dispatch(new AddBackpackItem(healthItem))
        .subscribe(() => {
          this.store.dispatch(new ReduceHealth(1));
        });
    }
  }

}
