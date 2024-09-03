interface LinearComment {
  id: string
  body: string
  user: {
    id: string
  }
  issue: {
    id: string
  }
}

export type LinearCommentInput = Partial<LinearComment>;
export type LinearCommentOutput = LinearCommentInput;
