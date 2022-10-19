import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Keybind } from '../../../../../content/interfaces';
import { OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-key-display',
  templateUrl: './key-display.component.html',
  styleUrls: ['./key-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyDisplayComponent implements OnInit {

  @Select(OptionsState.keymap) keymap$: Observable<Record<Keybind, [string, string]>>;

  @Input() keybind: string | Keybind;
  @Input() isPrimary = true;

  constructor() { }

  ngOnInit(): void {
  }

}
