import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { ElectronService } from '../../../core/services';
import { AbandonGame } from '../../../core/services/game/actions';
import { OptionsComponent } from '../../../options/options.component';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.scss']
})
export class PauseComponent implements OnInit {

  constructor(
    private router: Router,
    private store: Store,
    private modalService: NgbModal,
    public modal: NgbActiveModal,
    public electronService: ElectronService
  ) { }

  ngOnInit(): void {
  }

  continue(): void {
    this.modal.close();
  }

  options(): void {
    this.modalService.open(OptionsComponent, {
      modalDialogClass: 'options-dialog',
      backdropClass: 'no-backdrop-opacity',
      backdrop: 'static'
    });
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
