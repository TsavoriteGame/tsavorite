import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { RebindKey, ResetOptions, SetOption } from '../../../content/actions';
import { GameOption, IOptions, Keybind } from '../../../content/interfaces';
import { GameService } from '../core/services/game/game.service';
import { KeybindsService } from '../core/services/game/keybinds.service';
import { OptionsState } from '../core/services/game/stores';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit, OnDestroy {

  public recordingPrimaryKeybind = {};
  public recordingSecondaryKeybind = {};

  @Select(OptionsState.allOptions) options$: Observable<IOptions>;

  public displayOptions = [
    { type: 'checkbox', option: GameOption.IsFantasyFont, label: 'Use Bit Font' },
    { type: 'checkbox', option: GameOption.ShowDebugInfo, label: 'Show Debug Info' }
  ];

  constructor(
    private store: Store,
    public modal: NgbActiveModal,
    private keybindService: KeybindsService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameService.setOptionsOpen(true);
  }

  ngOnDestroy(): void {
    this.gameService.setOptionsOpen(false);
  }

  resetOptions(allKeybinds: Record<Keybind, [string, string]>): void {
    this.store.dispatch(new ResetOptions()).subscribe(newState => {
      const newKeybinds = newState.options.keymap;

      Object.keys(newKeybinds).forEach(key => {
        this.keybindService.rebindShortcuts(allKeybinds[key], newKeybinds[key]);
      });
    });
  }

  resetData() {

  }

  toggleOption(option: GameOption, newValue: boolean): void {
    this.store.dispatch(new SetOption(option, newValue));
  }

  async recordNewKeybind(allKeybinds: Record<Keybind, [string, string]>, keybind: string, isPrimaryKey: boolean) {

    // reset all keybind recordings
    Object.keys(allKeybinds).forEach((key) => {
      this.recordingPrimaryKeybind[key] = false;
      this.recordingSecondaryKeybind[key] = false;
    });

    if(isPrimaryKey) {
      this.recordingPrimaryKeybind[keybind] = true;
    } else {
      this.recordingSecondaryKeybind[keybind] = true;
    }

    const newKey = await this.keybindService.recordKeybind();
    this.recordingPrimaryKeybind[keybind] = this.recordingSecondaryKeybind[keybind] = false;

    if(newKey === 'Enter') {
      if(!isPrimaryKey) {
        this.store.dispatch(new RebindKey(keybind as Keybind, '', isPrimaryKey));
      }

      return;
    }

    // clear out only the key we're looking at, so we can check if the new key is already bound anywhere
    const checkKeymap = structuredClone(allKeybinds);
    checkKeymap[keybind][isPrimaryKey ? 0 : 1] = '';

    const checkOtherKeys = Object.keys(checkKeymap);
    const isKeyInUse = checkOtherKeys.some(k => allKeybinds[k][0] === newKey || allKeybinds[k][1] === newKey);

    if(isKeyInUse) {
      return;
    }

    this.store.dispatch(new RebindKey(keybind as Keybind, newKey, isPrimaryKey));
  }

}
