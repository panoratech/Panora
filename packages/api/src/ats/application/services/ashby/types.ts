export type AshbyApplicationInput = Partial<{
  canidateId: string;
  jobId: string;
  interviewPlanId: string;
  interviewStageId: string;
  sourceId: string;
  creditedToUserId: string;
  applicationHistory: {
    stageId: string;
    stageNumber: number;
    enteredStageAt: Date;
    archiveReasonId: string;
  }[];
}>;

export type AshbyApplicationOutput = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customFields: Array<{
    id: string;
    title: string;
    value: string;
  }>;
  candidate: {
    id: string;
    name: string;
    primaryEmailAddress: {
      value: string;
      type: string;
      isPrimary: boolean;
    };
    primaryPhoneNumber: {
      value: string;
      type: string;
      isPrimary: boolean;
    };
  };
  currentInterviewStage: {
    id: string;
    title: string;
    type: string;
    orderInInterviewPlan: number;
    interviewStageGroupId: string;
    interviewPlanId: string;
  };
  source: {
    id: string;
    title: string;
    isArchived: boolean;
    sourceType: {
      id: string;
      title: string;
      isArchived: boolean;
    };
  };
  archiveReason: {
    id: string;
    text: string;
    reasonType: string;
    isArchived: boolean;
  };
  archivedAt: string;
  job: {
    id: string;
    title: string;
    locationId: string;
    departmentId: string;
  };
  creditedToUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    globalRole: string;
    isEnabled: boolean;
    updatedAt: string;
  };
  hiringTeam: Array<{
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userId: string;
  }>;
  appliedViaJobPostingId: string;
  openings: Array<{
    id: string;
    openedAt: string;
    closedAt: string;
    isArchived: boolean;
    archivedAt: string;
    openingState: string;
    latestVersion: {
      id: string;
      identifier: string;
      description: string;
      authorId: string;
      createdAt: string;
      teamId: string;
      jobIds: string[];
      targetHireDate: string;
      targetStartDate: string;
      isBackfill: boolean;
      employmentType: string;
      locationIds: string[];
      hiringTeam: Array<{
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        userId: string;
      }>;
    };
  }>;
};
