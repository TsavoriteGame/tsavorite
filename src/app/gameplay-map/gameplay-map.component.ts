import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IMapDisplayInfo, IScenarioNode, Keybind } from '../../../content/interfaces';
import { Move } from '../../../content/actions';
import { KeybindsService } from '../core/services/game/keybinds.service';
import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-map',
  templateUrl: './gameplay-map.component.html',
  styleUrls: ['./gameplay-map.component.scss']
})
export class GameplayMapComponent implements OnInit, OnDestroy {

  @Select(GameState.mapInfo) mapInfo$: Observable<IMapDisplayInfo>;

  constructor(private store: Store, private keybindsService: KeybindsService) { }

  ngOnInit(): void {
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.MoveUp), () => this.moveDelta(0, -1));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.MoveDown), () => this.moveDelta(0, 1));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.MoveLeft), () => this.moveDelta(-1, 0));
    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.MoveRight), () => this.moveDelta(1, 0));
  }

  ngOnDestroy(): void {
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.MoveUp));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.MoveDown));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.MoveLeft));
    this.keybindsService.removeShortcut(this.keybindsService.getShortcutKeys(Keybind.MoveRight));
  }

  public canMoveTo(node: IScenarioNode, gridXPos: number, gridYPos: number): boolean {
    if(!node) {
      return false;
    }
    if(node.blockMovement) {
      return false;
    }

    if(gridXPos === 2 && gridYPos === 3) {
      return true;
    }
    if(gridXPos === 4 && gridYPos === 3) {
      return true;
    }
    if(gridXPos === 3 && gridYPos === 2) {
      return true;
    }
    if(gridXPos === 3 && gridYPos === 4) {
      return true;
    }

    return false;
  }

  public move(node: IScenarioNode, gridXPos: number, gridYPos: number): void {
    if(!this.canMoveTo(node, gridXPos, gridYPos)) {
      return;
    }

    this.store.dispatch(new Move(gridXPos - 3, gridYPos - 3));
  }

  public moveDelta(x: number, y: number): boolean {
    this.store.dispatch(new Move(x, y));
    return true;
  }

}
