import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subscription, timer } from 'rxjs';
import { getAllDescriptorsForItem, getTotalDescriptorLevel } from '../../../../../content/helpers';
import { ICard, IItemConfig, IItemInteraction } from '../../../../../content/interfaces';
import { pauseGame$ } from '../../../../../content/rxjs.helpers';
import { SetLandmarkSlotLock, SetLandmarkSlotTimer, LandmarkSlotTimerExpire, SetPlayerSlotTimer, SetPlayerSlotLock, PlayerSlotTimerExpire } from '../../../core/services/game/actions';
import { GameOption, OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-card-slot',
  templateUrl: './card-slot.component.html',
  styleUrls: ['./card-slot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardSlotComponent implements OnInit, OnDestroy, OnChanges {

  @Select(OptionsState.allOptions) options$: Observable<Record<GameOption, any>>;

  @Input() placeholder: string;
  @Input() card: ICard;
  @Input() cardType: 'item' = 'item';
  @Input() backgroundSize = 'size-big';
  @Input() slotIndex = -1;
  @Input() timerColor = '';
  @Input() locked = false;
  @Input() lockOnTimerExpire = false;
  @Input() maxTimer = -1;
  @Input() timer = -1;
  @Input() side: 'Player' | 'Landmark';

  @HostBinding('style.--timer-progress')
  public get timerAnimationProgress() {
    return this.timer / this.maxTimer;
  }

  private timerSub: Subscription;

  public activeInteraction: IItemInteraction = undefined;
  public activeDescriptors = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.watchTimer();
  }

  ngOnDestroy(): void {
    if(this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  ngOnChanges(): void {
    if(!this.card) {
      this.activeInteraction = undefined;
      this.activeDescriptors = [];
      return;
    }

    if(this.cardType === 'item') {
      const item: IItemConfig = this.card as IItemConfig;
      this.activeInteraction = item.interaction;

      const descriptors = getAllDescriptorsForItem(item);
      this.activeDescriptors = descriptors.map(descriptor => {
        const level = getTotalDescriptorLevel(item, descriptor);
        return { descriptor, level };
      });
    }
  }

  private watchTimer() {
    if(this.timer <= 0) {
      return;
    }

    this.timerSub = combineLatest([pauseGame$, timer(1000)]).subscribe(([paused]) => {
      if(paused) {
        return;
      }

      this.timer--;

      // always update the timer
      if(this.side === 'Landmark') {
        this.store.dispatch(new SetLandmarkSlotTimer(this.slotIndex, this.timer));
      }

      if(this.side === 'Player') {
        this.store.dispatch(new SetPlayerSlotTimer(this.slotIndex, this.timer));
      }

      if(this.timer <= 0) {
        this.timerSub.unsubscribe();

        // if we do not have a card, we can lock the slot, and we can expire the timer
        if(!this.card) {
          if(this.lockOnTimerExpire) {
            if(this.side === 'Landmark') {
              this.store.dispatch(new SetLandmarkSlotLock(this.slotIndex, true));
            }

            if(this.side === 'Player') {
              this.store.dispatch(new SetPlayerSlotLock(this.slotIndex, true));
            }
          }

          if(this.side === 'Landmark') {
            this.store.dispatch(new LandmarkSlotTimerExpire(this.slotIndex));
          }

          if(this.side === 'Player') {
            this.store.dispatch(new PlayerSlotTimerExpire(this.slotIndex));
          }

        }
      }
    });
  }

}
