import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ModalComponent } from '../modal-views/modal-views.component';
import { TextService } from './text.service';

@Injectable()
export class ModalService {
  private modals: ModalComponent[] = [];

  constructor(private text: TextService) {}

  public displayErrorMessage(error: HttpErrorResponse) {
    let message: string = this.text.getErrorMessage(error.error);
    this.open('info-modal', message);
  }

  public add(modal: ModalComponent): void {
    console.log('add');
    this.modals.push(modal);
  }

  public remove(id: string): void {
    this.modals = this.modals.filter((arr) => arr.id !== id);
  }

  public open(id: string, message: string): void {
    const modal = this.modals.find((arr) => arr.id === id);
    console.log('modal');
    console.log(modal);
    modal.open(message);
  }

  public close(id: string): void {
    const modal = this.modals.find((arr) => arr.id === id);
    modal.close();
  }
}
