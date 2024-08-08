interface LinearCollection {
  id: string
  name: string
  description: string
}

export type LinearCollectionInput = Partial<LinearCollection>;
export type LinearCollectionOutput = LinearCollectionInput;
