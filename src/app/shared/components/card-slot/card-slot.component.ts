import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { getAllDescriptorsForItem, getTotalDescriptorLevel } from '../../../../../content/helpers';
import { ICard, IItemConfig, IItemInteraction } from '../../../../../content/interfaces';
import { GameOption, OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-card-slot',
  templateUrl: './card-slot.component.html',
  styleUrls: ['./card-slot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardSlotComponent implements OnInit, OnChanges {

  @Select(OptionsState.allOptions) options$: Observable<Record<GameOption, any>>;

  @Input() placeholder: string;
  @Input() card: ICard;
  @Input() cardType: 'item' = 'item';

  public activeInteraction: IItemInteraction = undefined;
  public activeDescriptors = [];

  constructor() { }

  ngOnInit(): void {
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

}
