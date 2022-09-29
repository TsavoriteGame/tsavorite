import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnInit {

  @Input() icon = '';
  @Input() size = 64;
  @Input() showOutline = false;
  @Input() filter = '';
  @Input() roundCorners = true;

  public get fileExtension(): string {
    return this.electronService.isElectron ? 'png' : 'webp';
  }

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
  }

}
