import { Injectable } from '@angular/core';
import { CommentModel } from '@models/comment.model';

@Injectable()
export class CommentsService {
  private yourTurnComments: string[] = [
    'Your turn, do not waste it.',
    'Your turn, do your best.',
    'Your turn, good luck.',
  ];
  private anotherShotComments: string[] = [
    'Shoot again. You have another shot.',
    'Shoot again. You can try again.',
    'Shoot again. You have one more shot.',
  ];
  private opponentsTurnComments: string[] = [
    'Opponents turn. Cross your fingers.',
    'Opponents turn. Now opponent is trying.',
    'Opponents turn. You can start praying.',
  ];
  private missedComments: string[] = [
    'You missed. What a shame.',
    'You missed. Maybe next time you have more luck.',
    'You missed. You did your best. I hope.',
  ];
  private hitComments: string[] = [
    'You hit. Lucky bastard!',
    'You hit. Nice one!',
    'You hit. Another one bites the dust!',
  ];
  private lostComments: string[] = [
    'You are hit. Next time you will have more luck.',
    'You are hit. Bad luck, sorry.',
    'You are hit. No luck this time.',
  ];
  private notLostComments: string[] = [
    'Opponent missed. Lucky you.',
    'Opponent missed. You are lucky this time.',
    'Opponent missed. Good for you.',
  ];

  constructor() {}

  public getNoLostComment(): CommentModel {
    return {
      text: this.randomPhrase(this.notLostComments),
      color: 'green',
    } as CommentModel;
  }

  public getLostComment(): CommentModel {
    return {
      text: this.randomPhrase(this.lostComments),
      color: 'red',
    } as CommentModel;
  }

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

  public getTimeoutComment(): CommentModel {
    return { text: 'Time out.', color: 'black' } as CommentModel;
  }

  public getWaitingComment(): CommentModel {
    return {
      text: 'Waiting for 2nd player to join...',
      color: 'black',
    } as CommentModel;
  }

  private randomPhrase(textArray: string[]): string {
    return textArray[Math.floor(Math.random() * textArray.length)];
  }
}
