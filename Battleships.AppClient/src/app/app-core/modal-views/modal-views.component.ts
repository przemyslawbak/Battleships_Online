import {
  Component,
  ViewEncapsulation,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { ModalService } from '@services/modal.service';

@Component({
  selector: 'jw-modal',
  templateUrl: 'modal-views.component.html',
  styleUrls: ['modal-views.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
  public message: string;
  @Input() public id: string;
  private element: HTMLElement;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  public ngOnInit(): void {
    document.body.appendChild(this.element);

    this.element.addEventListener('click', (el) => {
      this.close();
    });

    this.modalService.add(this);
  }

  public ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  public open(message: string): void {
    this.element.style.display = 'block';
    document.body.classList.add('jw-modal-open');
    this.message = message;
  }

  public close(): void {
    this.element.style.display = 'none';
    document.body.classList.remove('jw-modal-open');
  }
}
