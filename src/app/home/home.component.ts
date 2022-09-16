import { Component, OnInit } from '@angular/core';
import { BUILDVARS } from '../../environments/_vars';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public get version() {
    return BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
  }

  constructor(public electronService: ElectronService) {}

  ngOnInit(): void {
  }

  newGame(): void {

  }

  continueGame(): void {

  }

  quit(): void {
    window.close();
  }

}
