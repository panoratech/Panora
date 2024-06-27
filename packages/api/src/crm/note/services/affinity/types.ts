interface AffinityNote {
    id: number
    creator_id: number
    person_ids: number[]
    associated_person_ids: number[]
    interaction_person_ids: number[]
    interaction_id: number
    interaction_type: number
    is_meeting: boolean
    mentioned_person_ids: number[]
    organization_ids: number[]
    opportunity_ids: number[]
    parent_id: any
    content: string
    type: number
    created_at: string
    updated_at: string
}

export type AffinityNoteInput = {
    content: string,
    person_ids?: number[],
    organization_ids?: number[],
    opportunity_ids?: number[],
    type?: number,
    parent_id?: number,
    creator_id?: number,
    created_at?: string
}

export type AffinityNoteOutput = Partial<AffinityNote>


