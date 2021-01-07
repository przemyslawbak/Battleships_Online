import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css'],
})
export class PolicyComponent {
  constructor(private router: Router) {}

  public onBack() {
    this.router.navigate(['']);
  }
}
