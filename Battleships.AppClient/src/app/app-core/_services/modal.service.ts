import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalComponent } from '../modal-views/modal-views.component';

@Injectable()
export class ModalService {
  private modals: ModalComponent[] = [];

  public displayErrorMessage(error: HttpErrorResponse) {
    if (error.error == null) {
      this.open('info-modal', 'Unknown error.');
    } else {
      this.open('info-modal', error.error);
    }
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
