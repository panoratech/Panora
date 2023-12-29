import { v4 as uuidv4 } from 'uuid';
import { Comment } from '@ticketing/ticket/types';

export function normalizeComments(comments: Comment[]) {
  const normalizedComments = comments.map((comment) => ({
    ...comment,
    created_at: new Date(),
    modified_at: new Date(),
    id_tcg_comment: uuidv4(),
  }));
  return {
    normalizedComments,
  };
}
