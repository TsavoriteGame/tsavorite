import { Injectable } from '@angular/core';

import { Hotkeys } from './hotkeys';
import { GameService } from './game.service';
import { defaultKeymap } from './stores';

export enum Keybind {
  Pause = 'Pause',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  Choice1 = 'Choice1',
  Choice2 = 'Choice2',
  Choice3 = 'Choice3',
  Choice4 = 'Choice4'
}

@Injectable({
  providedIn: 'root'
})
export class KeybindsService {

  private keymap: Record<Keybind, string> = defaultKeymap();

  private hotkeys = new Hotkeys();

  constructor(private gameService: GameService) {}

  public setKeybinds(keymap: Record<Keybind, string>): void {
    Object.keys(keymap).forEach(key => {
      this.rebindShortcuts(this.keymap[key], keymap[key]);
    });

    this.keymap = keymap;
  }

  public getShortcutKey(keybind: Keybind): string {
    return this.keymap[keybind];
  }

  public addShortcut(shortcut: string, handler: (event: KeyboardEvent) => boolean|void) {
    this.hotkeys.addHotkey({ shortcut, handler: (event) => {
      if(this.gameService.areOptionsOpen) return;

      handler(event);
    } });
  }

  public removeShortcut(shortcut: string): void {
    this.hotkeys.removeHotkey(shortcut);
  }

  public rebindShortcuts(shortcut: string, newShortcut: string): void {
    if(shortcut === newShortcut) return;

    this.hotkeys.rebindHotkey(shortcut, newShortcut);
  }

  public async recordKeybind(): Promise<string> {
    return this.hotkeys.recordHotkey();
  }
}
