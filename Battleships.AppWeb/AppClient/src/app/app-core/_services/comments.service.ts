import { Injectable } from '@angular/core';
import { CommentModel } from '@models/comment.model';

@Injectable()
export class CommentsService {
  private yourTurnComments: string[] = [
    'Your round, do not waste it.',
    'Your shot, do your best.',
    'Your turn, good luck.',
    'Now is your turn.',
  ];
  private anotherShotComments: string[] = [
    'You have another shot.',
    'You can try again.',
    'You have one more shot.',
    'Keep shooting.',
  ];
  private opponentsTurnComments: string[] = [
    'Your opponents turn.',
    'Now opponent is trying.',
    'Opponent is trying now.',
  ];
  private missedComments: string[] = [
    'What a shame, you missed. Again.',
    'Maybe next time you have more luck.',
    'Well, you did your best. I hope.',
  ];
  private hitComments: string[] = [
    'Lucky bastard!',
    'Nice one!',
    'Another one bites the dust!.',
  ];

  constructor() {}

  public getHitComment(): CommentModel {
    return {
      text: this.randomPhrase(this.hitComments),
      color: 'green',
    } as CommentModel;
  }

  public getMissedComment(): CommentModel {
    return {
      text: this.randomPhrase(this.missedComments),
      color: 'red',
    } as CommentModel;
  }

  public getAnotherShotComment(): CommentModel {
    return {
      text: this.randomPhrase(this.anotherShotComments),
      color: 'green',
    } as CommentModel;
  }

  public getOpponentsTurnComment(): CommentModel {
    return {
      text: this.randomPhrase(this.opponentsTurnComments),
      color: 'red',
    } as CommentModel;
  }

  public getYourTurnComment(): CommentModel {
    return {
      text: this.randomPhrase(this.yourTurnComments),
      color: 'green',
    } as CommentModel;
  }

  public getInitialComment(): CommentModel {
    return { text: 'Please wait...', color: 'black' } as CommentModel;
  }

  public getWaitingComment(): CommentModel {
    return {
      text: 'Waiting for 2nd player...',
      color: 'black',
    } as CommentModel;
  }

  private randomPhrase(textArray: string[]): string {
    return textArray[Math.floor(Math.random() * textArray.length)];
  }
}
