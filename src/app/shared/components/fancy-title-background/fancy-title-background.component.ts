import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fancy-title-background',
  templateUrl: './fancy-title-background.component.html',
  styleUrls: ['./fancy-title-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FancyTitleBackgroundComponent implements OnInit {

  @Input() text: string;

  constructor() { }

  ngOnInit(): void {
  }

}
