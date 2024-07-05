export interface AshbyInterviewInput {
  id: string;
  status: string;
  applicationId: string;
  interviewStageId: string;
  interviewEvents: InterviewEvent[];
}

export type AshbyInterviewOutput = Partial<AshbyInterviewInput>;

type InterviewEvent = {
  id: string;
  interviewId: string;
  interviewScheduleId: string;
  interviewerUserIds: string[];
  createdAt: string;
  startTime: string;
  endTime: string;
  feedbackLink: string;
  location: string;
  meetingLink: string;
  hasSubmittedFeedback: boolean;
};
