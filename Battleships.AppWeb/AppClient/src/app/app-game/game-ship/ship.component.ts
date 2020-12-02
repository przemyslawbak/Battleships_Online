import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.css'],
})
export class ShipComponent {
  @Input() size: number = 0;
  @Input() rotation: number = 0;

  constructor() {}
}
