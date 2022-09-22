import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SetOption } from '../core/services/game/actions';
import { GameOption, IOptions, OptionsState } from '../core/services/game/stores';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  @Select(OptionsState.allOptions) options$: Observable<IOptions>;

  public displayOptions = [
    { type: 'checkbox', option: GameOption.IsFantasyFont, label: 'Use Bit Font' },
  ];

  constructor(
    private store: Store,
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

  resetData() {

  }

  toggleOption(option: GameOption, newValue: boolean): void {
    this.store.dispatch(new SetOption(option, newValue));
  }

}
