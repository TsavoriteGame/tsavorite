import { Component, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ScenarioNode } from '../../../content/interfaces';
import { Move } from '../core/services/game/actions';
import { GameState, IMapDisplayInfo } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-map',
  templateUrl: './gameplay-map.component.html',
  styleUrls: ['./gameplay-map.component.scss']
})
export class GameplayMapComponent implements OnInit {

  @Select(GameState.mapInfo) mapInfo$: Observable<IMapDisplayInfo>;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  public canMoveTo(node: ScenarioNode, gridXPos: number, gridYPos: number): boolean {
    if(!node) return false;
    if(node.blockMovement) return false;

    if(gridXPos === 2 && gridYPos === 3) return true;
    if(gridXPos === 4 && gridYPos === 3) return true;
    if(gridXPos === 3 && gridYPos === 2) return true;
    if(gridXPos === 3 && gridYPos === 4) return true;

    return false;
  }

  public move(node: ScenarioNode, gridXPos: number, gridYPos: number): void {
    this.store.dispatch(new Move(gridXPos - 3, gridYPos - 3));
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  moveUp() {
    this.store.dispatch(new Move(0, -1));
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  moveDown() {
    this.store.dispatch(new Move(0, 1));
  }

  @HostListener('document:keydown.arrowleft', ['$event'])
  moveLeft() {
    this.store.dispatch(new Move(-1, 0));
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  moveRight() {
    this.store.dispatch(new Move(1, 0));
  }

}
