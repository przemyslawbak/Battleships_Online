import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ModalService {
  private modals: any[] = [];

  public displayErrorMessage(error: HttpErrorResponse) {
    if (error.error == null) {
      this.open('info-modal', 'Unknown error.');
    } else {
      this.open('info-modal', error.error);
    }
  }

  public add(modal: any) {
    this.modals.push(modal);
  }

  public remove(id: string) {
    this.modals = this.modals.filter((arr) => arr.id !== id);
  }

  public open(id: string, message: string) {
    const modal = this.modals.find((arr) => arr.id === id);
    modal.open(message);
  }

  public close(id: string) {
    const modal = this.modals.find((arr) => arr.id === id);
    modal.close();
  }
}
