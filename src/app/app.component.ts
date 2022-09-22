import { Component, HostListener, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { GameService } from './core/services/game/game.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PauseComponent } from './shared/components/pause/pause.component';
import { Select, Store } from '@ngxs/store';
import { GameOption, OptionsState } from './core/services/game/stores';
import { first, Observable } from 'rxjs';
import { SetOption } from './core/services/game/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @Select(OptionsState.isPaused) isPaused$: Observable<boolean>;
  @Select(OptionsState.isFantasyFont) isFantasyFont$: Observable<boolean>;

  constructor(
    private translate: TranslateService,
    private modalService: NgbModal,
    private store: Store,
    private gameService: GameService
  ) {
  }

  ngOnInit(): void {
    this.initTranslation();
    this.unpause();
    this.watchFontChanges();
  }

  private initTranslation() {
    this.translate.setDefaultLang('en');
  }

  // unpause the game any time it's loaded
  private unpause() {
    this.store.dispatch(new SetOption(GameOption.IsPaused, false));
  }

  // watch for changes to the font setting and update the game
  private watchFontChanges() {
    this.isFantasyFont$.subscribe(isFantasyFont => {
      if(isFantasyFont)
        document.body.classList.add('fantasy');
      else
        document.body.classList.remove('fantasy');
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent() {
    if(!this.gameService.isInGame) return;

    // handle showing/hiding the pause menu
    this.isPaused$.pipe(first()).subscribe(isPaused => {

      // if we're already paused, hitting esc again will close it anyway; no need to do anything
      if(isPaused) return;

      // tell the game we're paused
      this.store.dispatch(new SetOption(GameOption.IsPaused, true));
      const modal = this.modalService.open(PauseComponent, {
        centered: true,
        backdropClass: 'darker-backdrop',
        backdrop: 'static'
      });

      // when the pause modal is closed, tell the game we're unpaused
      modal.dismissed.subscribe(() => {
        this.store.dispatch(new SetOption(GameOption.IsPaused, false));
      });

      // when the pause modal is closed, tell the game we're unpaused
      modal.closed.subscribe(() => {
        this.store.dispatch(new SetOption(GameOption.IsPaused, false));
      });
    });
  }
}
