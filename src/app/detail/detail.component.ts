import { Component, OnInit } from '@angular/core';
import { getCombinationBetweenTwoItems, getReactionBetweenTwoItems } from '../../../content/helpers';
import { IItemConfig, IItemDescriptor, IReactionResponse } from '../../../content/interfaces';
import { ContentService } from '../core/services/game/content.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public activeIndex = -1;
  public activeItem: IItemConfig;

  public currentLeft: IItemConfig;
  public currentRight: IItemConfig;

  public reactionResult: IReactionResponse;

  constructor(public contentService: ContentService) { }

  ngOnInit(): void {
  }

  chooseItem(item: IItemConfig, index: number) {
    this.activeIndex = index;
    this.activeItem = item;
  }

  makeLeftItem() {
    this.currentLeft = structuredClone(this.activeItem);
  }

  makeRightItem() {
    this.currentRight = structuredClone(this.activeItem);
  }

  swapLeftAndRight() {
    const [left, right] = [this.currentLeft, this.currentRight];
    this.currentLeft = right;
    this.currentRight = left;
  }

  doCombine() {
    if(!this.currentLeft || !this.currentRight) {
      return;
    }

    const result = getCombinationBetweenTwoItems(this.currentLeft, this.currentRight);

    this.reactionResult = result;

    if(result.success) {
      this.currentLeft = result.newSource;
      this.currentRight = result.newTarget;
    }
  }

  doReaction() {
    if(!this.currentLeft || !this.currentRight) {
      return;
    }

    const result = getReactionBetweenTwoItems(this.currentLeft, this.currentRight);

    this.reactionResult = result;

    if(result.success) {
      this.currentLeft = result.newSource;
      this.currentRight = result.newTarget;
    }
  }

  getLevel(value: IItemDescriptor): number {
    return value.level ?? 0;
  }

}
