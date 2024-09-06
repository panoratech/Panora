import { LinearCommentInput } from "@ticketing/comment/services/linear/types"
import { LinearTagInput } from "@ticketing/tag/services/linear/types"

interface LinearTicket {
    id: string
    title: string
    description?: string
    dueDate?: string
    parent?: {
        id: string
    }
    state: {
        name: string
    }
    project?: any
    labels?: {
        nodes: LinearTagInput[]
    }
    completedAt?: any
    priorityLabel?: string
    assignee?: {
        id: string
    }
    comments?: {
        nodes: LinearCommentInput[]
    }
    team?: {
        id: string
    }
}

export type LinearTicketInput = Partial<LinearTicket>;
export type LinearTicketOutput = Partial<LinearTicket>;
