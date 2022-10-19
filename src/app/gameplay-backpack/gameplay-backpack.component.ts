import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { getCombinationBetweenTwoItems,
  getReactionBetweenTwoItems,
  hasDescriptor } from '../../../content/helpers';
import { Descriptor, GameConstant, IGameCharacter, IItemConfig } from '../../../content/interfaces';
import { AddBackpackItem, ReduceHealth,
  RemoveCharacterItemById,
  SetCharacterItemLockById, SetEquipmentItem, UpdateCharacterItemById } from '../../../content/actions';
import { ContentService } from '../core/services/game/content.service';
import { GameService } from '../core/services/game/game.service';
import { LoggerService } from '../core/services/game/logger.service';
import { GameState } from '../core/services/game/stores';

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

  public discardItem: IItemConfig;
  public indexDiscard = -1;

  public combineLeft: IItemConfig;
  public combineRight: IItemConfig;
  public indexLeft = -1;
  public indexRight = -1;

  public applicombineResultMessage: Subject<string> = new Subject<string>();
  public applicombineResultMessage$ = this.applicombineResultMessage.asObservable();
  public timer$: Subscription;

  constructor(
    private store: Store,
    private loggerService: LoggerService,
    private contentService: ContentService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
  }

  dropDiscard($event) {
    const { backpackIndex, item } = $event.data;
    if(!item) {
      return;
    }

    this.discardItem = item;
    this.indexDiscard = backpackIndex;

    this.store.dispatch(new SetCharacterItemLockById(this.discardItem.cardId, true));
  }

  dropLeft($event) {
    const { backpackIndex, item } = $event.data;
    if(!item || item === this.combineRight) {
      return;
    }

    this.combineLeft = item;
    this.indexLeft = backpackIndex;

    this.store.dispatch(new SetCharacterItemLockById(this.combineLeft.cardId, true));
  }

  dropRight($event) {
    const { backpackIndex, item } = $event.data;
    if(!item || item === this.combineLeft) {
      return;
    }

    this.combineRight = item;
    this.indexRight = backpackIndex;

    this.store.dispatch(new SetCharacterItemLockById(this.combineRight.cardId, true));
  }

  reaction(character: IGameCharacter) {
    if(!this.combineLeft || !this.combineRight) {
      return;
    }

    const result = getReactionBetweenTwoItems(this.combineLeft, this.combineRight);

    // checking how many slots are available to do things
    const numExtraItems = result.extraItems ? result.extraItems.length : 0;
    const extraSlots = (result.newSource ? 0 : 1) + (result.newTarget ? 0 : 1);

    // make sure we have enough space to perform a reaction. in the future, we might just do it anyway and truncate.
    if((character.items.length - extraSlots) + numExtraItems > this.gameService.getConstant(GameConstant.BackpackSize)) {
      this.flashMessage('You don\'t have enough space in your backpack to perform this reaction.');
      return;
    }

    const oldSourceId = this.combineLeft.cardId;
    const oldTargetId = this.combineRight.cardId;

    if(result.success) {

      // update or remove the source item
      if(result.newSource) {
        this.store.dispatch(new UpdateCharacterItemById(oldSourceId, result.newSource));
      } else {
        this.store.dispatch(new RemoveCharacterItemById(oldSourceId));
      }


      // update or remove the target item
      if(result.newTarget) {
        this.store.dispatch(new UpdateCharacterItemById(oldTargetId, result.newTarget));
      } else {
        this.store.dispatch(new RemoveCharacterItemById(oldTargetId));
      }
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
    if(!this.combineLeft || !this.combineRight) {
      return;
    }

    const result = getCombinationBetweenTwoItems(this.combineLeft, this.combineRight);

    // checking how many slots are available to do things
    const numExtraItems = result.extraItems ? result.extraItems.length : 0;
    const extraSlots = (result.newSource ? 0 : 1) + (result.newTarget ? 0 : 1);

    // make sure we have enough space to perform a reaction. in the future, we might just do it anyway and truncate.
    if((character.items.length - extraSlots) + numExtraItems > this.gameService.getConstant(GameConstant.BackpackSize)) {
      this.flashMessage('You don\'t have enough space in your backpack to perform this combination.');
      return;
    }

    const oldSourceId = this.combineLeft.cardId;
    const oldTargetId = this.combineRight.cardId;

    if(result.success) {

      // update or remove the source item
      if(result.newSource) {
        this.store.dispatch(new UpdateCharacterItemById(oldSourceId, result.newSource));
      } else {
        this.store.dispatch(new RemoveCharacterItemById(oldSourceId));
      }


      // update or remove the target item
      if(result.newTarget) {
        this.store.dispatch(new UpdateCharacterItemById(oldTargetId, result.newTarget));
      } else {
        this.store.dispatch(new RemoveCharacterItemById(oldTargetId));
      }
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
    if(!this.discardItem) {
      return;
    }

    this.store.dispatch(new RemoveCharacterItemById(this.discardItem.cardId)).subscribe(() => {
      this.cancelDiscard();
    });
  }

  flashMessage(message: string) {
    this.loggerService.info(message);

    if(this.timer$) {
      this.timer$.unsubscribe();
    }

    this.applicombineResultMessage.next(message);

    this.timer$ = timer(3000).subscribe(() => this.applicombineResultMessage.next(''));
  }

  cancelApplicombine() {
    if(this.combineLeft) {
      this.store.dispatch(new SetCharacterItemLockById(this.combineLeft.cardId, false));
      this.combineLeft = undefined;
    }

    if(this.combineRight) {
      this.store.dispatch(new SetCharacterItemLockById(this.combineRight.cardId, false));
      this.combineRight = undefined;
    }

    this.indexLeft = -1;
    this.indexRight = -1;
  }

  cancelDiscard() {
    this.store.dispatch(new SetCharacterItemLockById(this.discardItem.cardId, false));
    this.discardItem = undefined;
    this.indexDiscard = -1;
  }

  isItemInSlot(item: IItemConfig): boolean {
    return item.locked;
  }

  canDragItem(item: IItemConfig | undefined, slot: number): boolean {
    if(!item) {
      return false;
    }
    if(this.isItemInSlot(item)) {
      return false;
    }

    return true;
  }

  dropOnBackpack(character: IGameCharacter, $event) {
    if(character.items.length >= this.gameService.getConstant(GameConstant.BackpackSize)) {
      return;
    }

    const { takeHealth, equipmentSlot, item } = $event.data;

    if(equipmentSlot) {
      this.store.dispatch(new AddBackpackItem(item)).subscribe(() => {
        this.store.dispatch(new SetEquipmentItem(undefined, equipmentSlot));
      });
    }

    // if this drop is a take-health drop, we make a new heart item
    if(takeHealth > 0) {
      const healthItem = this.contentService.getItemById('HealingHeart-1');

      this.store.dispatch(new AddBackpackItem(healthItem))
        .subscribe(() => {
          this.store.dispatch(new ReduceHealth(1));
        });
    }
  }

  getDNDType(item: IItemConfig | undefined): string {
    if(!item) {
      return '';
    }

    if(hasDescriptor(item, Descriptor.HeadArmor)) {
      return 'HeadArmor';
    }

    if(hasDescriptor(item, Descriptor.BodyArmor)) {
      return 'BodyArmor';
    }

    if(hasDescriptor(item, Descriptor.FeetArmor)) {
      return 'FeetArmor';
    }

    if(item.parts.length > 0) {
      return 'Item';
    }

    return '';
  }

}
