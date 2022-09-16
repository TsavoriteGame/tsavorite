import { Component, OnInit } from '@angular/core';
import { BUILDVARS } from '../../environments/_vars';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public get version() {
    return BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
  }

  ngOnInit(): void {
  }

}
