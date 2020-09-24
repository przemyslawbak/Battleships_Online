import { Injectable } from '@angular/core';

@Injectable()
export class ModalService {
  private modals: any[] = [];

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
