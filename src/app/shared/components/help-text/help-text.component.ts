import { Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameOption } from '../../../../../content/interfaces';
import { OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-help-text',
  templateUrl: './help-text.component.html',
  styleUrls: ['./help-text.component.scss']
})
export class HelpTextComponent implements OnInit {

  @Select(OptionsState.allOptions) options$: Observable<Record<GameOption, any>>;

  @Input() helpText: string;

  constructor() { }

  ngOnInit(): void {
  }

}
