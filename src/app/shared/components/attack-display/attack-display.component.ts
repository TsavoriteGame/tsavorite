import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { getAttackByName } from '../../../../../content/getters';
import { IWeaponAttack } from '../../../../../content/interfaces';
import { GameOption, OptionsState } from '../../../core/services/game/stores';

@Component({
  selector: 'app-attack-display',
  templateUrl: './attack-display.component.html',
  styleUrls: ['./attack-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttackDisplayComponent implements OnInit, OnChanges {

  @Select(OptionsState.allOptions) options$: Observable<Record<GameOption, any>>;

  @Input() name: string;

  public attackInfo: IWeaponAttack;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.attackInfo = getAttackByName(this.name);
  }

}
