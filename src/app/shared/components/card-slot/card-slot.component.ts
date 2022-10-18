import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, interval, Observable, Subscription } from 'rxjs';
import { getAllDescriptorsForItem, getTotalDescriptorLevel } from '../../../../../content/helpers';
import { ICard, IItemConfig, IItemInteraction } from '../../../../../content/interfaces';
import { pauseGame$ } from '../../../../../content/rxjs.helpers';
import { SetLandmarkSlotLock, SetLandmarkSlotTimer, LandmarkSlotTimerExpire,
  SetPlayerSlotLock, PlayerSlotTimerExpire, SetPlayerSlotTimer } from '../../../core/services/game/actions';
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
  @Input() animation = '';
  @Input() slotIndex = -1;
  @Input() timerColor = '';
  @Input() locked = false;
  @Input() lockOnTimerExpire = false;
  @Input() hideTimerWhenCardPresent = false;
  @Input() maxTimer = -1;
  @Input() timer = -1;
  @Input() side: 'Player' | 'Landmark';

  @HostBinding('style.--timer-progress')
  public get timerAnimationProgress() {
    return this.timer / this.maxTimer;
  }

  public get shouldShowTimer(): boolean {
    return this.timer > 0 && (!this.hideTimerWhenCardPresent || !this.card);
  }

  private timerSub: Subscription;

  public activeInteraction: IItemInteraction = undefined;
  public activeDescriptors = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.watchTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  ngOnChanges(changes): void {

    // attempt to restart the timer if the value ever resets
    const { timer } = changes;

    // update the timer, restart if needed
    if(timer) {
      const { previousValue, currentValue } = timer;
      if(previousValue < currentValue) {
        this.watchTimer();
      }

      if(currentValue <= -1) {
        this.timerSub?.unsubscribe();
      }
    }

    // if we don't have a card, we don't have these
    if(!this.card) {
      this.activeInteraction = undefined;
      this.activeDescriptors = [];
    }

    // if the card is an item, we can grab descriptors
    if(this.card && this.cardType === 'item') {
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

    this.timerSub = combineLatest([pauseGame$, interval(1000)]).subscribe(([paused]) => {
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
    });
  }

}
