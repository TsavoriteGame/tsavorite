import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../../../../content/interfaces';

@Component({
  selector: 'app-card-slot',
  templateUrl: './card-slot.component.html',
  styleUrls: ['./card-slot.component.scss']
})
export class CardSlotComponent implements OnInit {

  @Input() placeholder: string;
  @Input() card: Card;

  constructor() { }

  ngOnInit(): void {
  }

}
