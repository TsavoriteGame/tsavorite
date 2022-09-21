import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { getAllDescriptorsForItem, getTotalDescriptorLevel } from '../../../../../content/helpers';
import { Card, ItemConfig, ItemInteraction } from '../../../../../content/interfaces';
import { GameOption, OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-card-slot',
  templateUrl: './card-slot.component.html',
  styleUrls: ['./card-slot.component.scss']
})
export class CardSlotComponent implements OnInit, OnChanges {

  @Select(OptionsState.allOptions) options$: Observable<Record<GameOption, any>>;

  @Input() placeholder: string;
  @Input() card: Card;
  @Input() cardType: 'item' = 'item';

  public activeInteraction: ItemInteraction = undefined;
  public activeDescriptors = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if(!this.card) return;

    if(this.cardType === 'item') {
      const item: ItemConfig = this.card as ItemConfig;
      this.activeInteraction = item.interaction;

      const descriptors = getAllDescriptorsForItem(item);
      this.activeDescriptors = descriptors.map(descriptor => {
        const level = getTotalDescriptorLevel(item, descriptor);
        return { descriptor, level };
      });
    }
  }

}
