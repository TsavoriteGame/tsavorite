import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GameService } from './core/services/game/game.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PauseComponent } from './shared/components/pause/pause.component';
import { Select, Store } from '@ngxs/store';
import { GameState, OptionsState } from './core/services/game/stores';
import { combineLatest, first, Observable, timer } from 'rxjs';
import { AbandonGame, Move, PageLoad, SetPaused } from '../../content/actions';
import { KeybindsService } from './core/services/game/keybinds.service';
import { GameOverComponent } from './shared/components/game-over/game-over.component';
import { Keybind } from '../../content/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @Select(OptionsState.keymap) keymap$: Observable<Record<Keybind, [string, string]>>;
  @Select(OptionsState.isPaused) isPaused$: Observable<boolean>;
  @Select(OptionsState.isFantasyFont) isFantasyFont$: Observable<boolean>;

  @Select(GameState.isDead) isDead$: Observable<boolean>;

  private modal;
  private deadModal;

  constructor(
    private translate: TranslateService,
    private modalService: NgbModal,
    private store: Store,
    private keybindsService: KeybindsService,
    private gameService: GameService
  ) {
  }

  ngOnInit(): void {
    this.initTranslation();
    this.unpause();
    this.reInitCurrentTile();
    this.watchFontChanges();
    this.watchKeymapChanges();
    this.watchForDead();

    this.keybindsService.addShortcuts(this.keybindsService.getShortcutKeys(Keybind.Pause), () => this.handleKeyboardEvent());
  }

  // init the i18n for en; other languages may come
  private initTranslation() {
    this.translate.setDefaultLang('en');
  }

  // re-initialize the current tile encounter any time the game is loaded
  private reInitCurrentTile() {
    this.store.dispatch(new PageLoad());
    this.store.dispatch(new Move(0, 0));
  }

  // unpause the game any time it's loaded
  private unpause() {
    this.store.dispatch(new SetPaused(false));
  }

  // watch for changes to the font setting and update the game
  private watchFontChanges() {
    this.isFantasyFont$.subscribe(isFantasyFont => {
      if(isFantasyFont) {
        document.body.classList.add('fantasy');
      } else {
        document.body.classList.remove('fantasy');
      }
    });
  }

  private watchKeymapChanges() {
    this.keymap$.subscribe(keymap => {
      this.keybindsService.setKeybinds(keymap);
    });
  }

  handleKeyboardEvent() {
    if(!this.gameService.isInGame) {
      return;
    }

    if(this.modal) {
      this.modal.close();
      return;
    }

    // handle showing/hiding the pause menu
    this.isPaused$.pipe(first()).subscribe(isPaused => {

      // if we're already paused, hitting esc again will close it anyway; no need to do anything
      if(isPaused) {
        return;
      }

      // tell the game we're paused
      this.store.dispatch(new SetPaused(true));
      this.modal = this.modalService.open(PauseComponent, {
        centered: true,
        backdropClass: 'darker-backdrop',
        backdrop: 'static',
        keyboard: false
      });

      // when the pause modal is closed, tell the game we're unpaused
      this.modal.dismissed.subscribe(() => {
        this.store.dispatch(new SetPaused(false));
        this.modal = undefined;
      });

      // when the pause modal is closed, tell the game we're unpaused
      this.modal.closed.subscribe(() => {
        this.store.dispatch(new SetPaused(false));
        this.modal = undefined;
      });
    });

    return true;
  }

  watchForDead() {
    combineLatest([this.isDead$, timer(0, 1000)]).subscribe(([isDead]) => {
      if(!isDead) {
        return;
      }

      if(!this.gameService.isInGame) {
        this.store.dispatch(new AbandonGame());
        return;
      }

      if(this.deadModal) {
        return;
      }

      this.store.dispatch(new SetPaused(true));
      this.deadModal = this.modalService.open(GameOverComponent, {
        centered: true,
        backdropClass: 'darker-backdrop',
        backdrop: 'static',
        keyboard: false
      });

      // when the pause modal is closed, tell the game we're unpaused
      this.deadModal.dismissed.subscribe(() => {
        this.store.dispatch(new SetPaused(false));
        this.deadModal = undefined;
      });

      // when the pause modal is closed, tell the game we're unpaused
      this.deadModal.closed.subscribe(() => {
        this.store.dispatch(new SetPaused(false));
        this.deadModal = undefined;
      });
    });
  }
}
