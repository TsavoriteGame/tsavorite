import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { AbandonGame } from '../../../core/services/game/actions';
import { GameState, IGameCharacter } from '../../../core/services/game/stores';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent implements OnInit {

  @Select(GameState.character) character$: Observable<IGameCharacter>;

  constructor(
    private router: Router,
    private store: Store,
    public modal: NgbActiveModal,
    public electronService: ElectronService
  ) { }

  ngOnInit(): void {
  }

  continue(): void {
    this.modal.close();
  }

  toMainMenu(): void {
    this.modal.close();
    this.router.navigate(['/home']);
  }

  abandon(): void {
    this.store.dispatch(new AbandonGame()).subscribe(() => {
      this.toMainMenu();
    });
  }

  quit(): void {
    window.close();
  }

}
