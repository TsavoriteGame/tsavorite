import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BUILDVARS } from '../../environments/_vars';
import { ElectronService } from '../core/services';
import { AbandonGame, ToggleOption } from '../core/services/game/actions';
import { GameOption, GameState, OptionsState } from '../core/services/game/stores';
import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public debugClicks = 0;

  @Select(GameState.hasGame) hasGame$: Observable<boolean>;
  @Select(OptionsState.isDebugMode) isDebugMode$: Observable<boolean>;

  public get version() {
    return BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
  }

  public readonly socialLinks = [
    { icon: 'home',     link: 'https://tsavoritegame.com' },
    { icon: 'discord',  link: 'http://discord.tsavoritegame.com' },
    { icon: 'twitter',  link: 'http://twitter.tsavoritegame.com' },
    { icon: 'reddit',   link: 'http://reddit.tsavoritegame.com' },
    { icon: 'github',   link: 'http://github.tsavoritegame.com' }
  ];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private store: Store,
    public electronService: ElectronService
  ) {}

  ngOnInit(): void {

  }

  abandon(): void {
    this.store.dispatch(new AbandonGame()).subscribe(() => {
      this.router.navigate(['/play']);
    });
  }

  openOptions(): void {
    this.modalService.open(OptionsComponent, {
      modalDialogClass: 'options-dialog',
      backdropClass: 'darker-backdrop',
      backdrop: 'static',
      keyboard: false
    });
  }

  debugClick(): void {
    if(++this.debugClicks < 10) return;

    this.debugClicks = 0;
    this.store.dispatch(new ToggleOption(GameOption.IsDebugMode));
  }

  quit(): void {
    window.close();
  }

}
