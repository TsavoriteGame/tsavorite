import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.component.html',
  styleUrls: ['./splashscreen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashscreenComponent implements OnInit {

  showFirst = false;
  showSecond = false;
  showThird = false;

  windowWidth: string;
  opacityChange = 1;
  showSplash = environment.showSplash;
  splashTransition = '';

  @Input() animationDuration = 0.5;
  @Input() duration = 2;

  constructor() { }

  ngOnInit(): void {

    setTimeout(() => {
      this.showFirst = true;
    }, 500);

    setTimeout(() => {
      this.showSecond = true;
    }, 1000);

    setTimeout(() => {
      this.showThird = true;
    }, 1500);

    setTimeout(() => {
      const transitionStyle = 'opacity ' + this.animationDuration + 's';
      this.opacityChange = 0;

      this.splashTransition = transitionStyle;

      setTimeout(() => {
        this.showSplash = !this.showSplash;
      }, this.animationDuration * 1000);
    }, this.duration * 1000);
  }

}
