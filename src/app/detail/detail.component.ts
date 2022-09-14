import { Component, OnInit } from '@angular/core';
import { getReactionBetweenTwoItems } from '../../../content/helpers';
import { ItemConfig, ReactionResponse } from '../../../content/interfaces';

import * as items from '../../../content/items/items.json';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public activeIndex = -1;
  public activeItem: ItemConfig;

  public currentLeft: ItemConfig;
  public currentRight: ItemConfig;

  public reactionResult: ReactionResponse;

  public get allItems() {
    return (items as any).default || items;
  }

  ngOnInit(): void {
  }

  chooseItem(item: ItemConfig, index: number) {
    this.activeIndex = index;
    this.activeItem = item;
  }

  makeLeftItem() {
    this.currentLeft = structuredClone(this.activeItem);
  }

  makeRightItem() {
    this.currentRight = structuredClone(this.activeItem);
  }

  doReaction() {
    if(!this.currentLeft || !this.currentRight) return;

    const result = getReactionBetweenTwoItems(this.currentLeft, this.currentRight);

    this.reactionResult = result;

    if(result.success) {
      this.currentLeft = result.newSource;
      this.currentRight = result.newTarget;
    }
  }

}
