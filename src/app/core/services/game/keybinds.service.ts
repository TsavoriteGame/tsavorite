import { Injectable } from '@angular/core';

import { Hotkeys } from './hotkeys';
import { GameService } from './game.service';
import { Keybind } from '../../../../../content/interfaces';
import { defaultKeymap } from '../../../../../content/attachments/options/options.functions';


@Injectable({
  providedIn: 'root'
})
export class KeybindsService {

  private keymap: Record<Keybind, [string, string]> = defaultKeymap();

  private hotkeys = new Hotkeys();

  constructor(private gameService: GameService) {}

  public setKeybinds(keymap: Record<Keybind, [string, string]>): void {
    Object.keys(keymap).forEach(key => {
      this.rebindShortcuts(this.keymap[key], keymap[key]);
    });

    this.keymap = keymap;
  }

  public getShortcutKeys(keybind: Keybind): [string, string] {
    return this.keymap[keybind];
  }

  public getPrimaryShortcutKey(keybind: Keybind): string {
    return this.getShortcutKeys(keybind)[0];
  }

  public getSecondaryShortcutKey(keybind: Keybind): string {
    return this.getShortcutKeys(keybind)[1];
  }

  public addShortcuts(shortcuts: [string, string], handler: (event: KeyboardEvent) => boolean|void) {
    shortcuts.forEach(shortcut => this.addShortcut(shortcut, handler));
  }

  public addShortcut(shortcut: string, handler: (event: KeyboardEvent) => boolean|void): void {
    this.hotkeys.addHotkey({ shortcut, handler: (event) => {
      if(this.gameService.areOptionsOpen) {
        return;
      }

      handler(event);
    } });
  };

  public removeShortcut(shortcut: [string, string]): void {
    this.hotkeys.removeHotkeys(shortcut);
  }

  public rebindShortcuts(shortcut: [string, string], newShortcut: [string, string]): void {

    // we're rebinding the primary shortcut
    // they can't be unbound, so they don't require other weird logic
    if(shortcut[0] !== newShortcut[0]) {
      this.hotkeys.rebindHotkey(shortcut[0], newShortcut[0]);
    }

    // we have a secondary shortcut we're unbinding
    if(shortcut[1] && !newShortcut[1]) {
      this.hotkeys.removeHotkey(shortcut[1]);
    }

    // we have an unbound secondary shortcut we're binding
    if(!shortcut[1] && newShortcut[1]) {
      this.hotkeys.duplicateHotkey(shortcut[0], newShortcut[1]);
    }

    // we have a secondary shortcut we're rebinding
    if(shortcut[1] && newShortcut[1] && shortcut[1] !== newShortcut[1]) {
      this.hotkeys.rebindHotkey(shortcut[1], newShortcut[1]);
    }
  }

  public async recordKeybind(): Promise<string> {
    return this.hotkeys.recordHotkey();
  }
}
