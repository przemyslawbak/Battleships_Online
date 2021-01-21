import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

let component: FooterComponent;
let fixture: ComponentFixture<FooterComponent>;
let span: HTMLElement;

describe('FooterComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    span = fixture.nativeElement.querySelector('span');
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_ShouldDisplayPresentYear', () => {
    fixture.detectChanges();
    let year: number = new Date().getFullYear();
    expect(span.innerHTML).toBe('©' + year.toString() + ' ACME, Inc.');
  });
});
