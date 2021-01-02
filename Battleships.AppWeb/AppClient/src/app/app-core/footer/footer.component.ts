import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  year: number = 0;
  constructor(private router: Router) {}

  public ngOnInit(): void {
    this.year = new Date().getFullYear();
  }
}
