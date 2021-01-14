import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let commentsService: CommentsService;

  beforeEach(() => {
    commentsService = new CommentsService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(commentsService).toBeTruthy();
  });
});
