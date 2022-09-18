import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BUILDVARS } from '../../environments/_vars';
import { ElectronService } from '../core/services';
import { AbandonGame } from '../core/services/game/actions';
import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Select(GameState.hasGame) hasGame$: Observable<boolean>;

  public get version() {
    return BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
  }

  constructor(private router: Router, private store: Store, public electronService: ElectronService) {}

  ngOnInit(): void {

  }

  abandon(): void {
    this.store.dispatch(new AbandonGame()).subscribe(() => {
      this.router.navigate(['/play']);
    });
  }

  quit(): void {
    window.close();
  }

}
