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
  message: string;
  @Input() id: string;
  private element: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  public ngOnInit(): void {
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', (el) => {
      if (el.target.className === 'jw-modal') {
        this.close();
      }
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
