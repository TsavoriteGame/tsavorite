import { Component, Input, OnInit } from '@angular/core';
import { ItemConfig } from '../../../../../content/interfaces';

@Component({
  selector: 'app-item-slot',
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss']
})
export class ItemSlotComponent implements OnInit {

  @Input() placeholder: string;
  @Input() item: ItemConfig;

  constructor() { }

  ngOnInit(): void {
  }

}
