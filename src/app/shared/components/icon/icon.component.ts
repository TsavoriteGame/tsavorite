import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {

  @Input() icon = '';
  @Input() size = 64;
  @Input() showOutline = false;

  public get fileExtension(): string {
    return this.electronService.isElectron ? 'png' : 'webp';
  }

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
  }

}
