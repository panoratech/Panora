interface AffinityDeal {
    id: number
    name: string
    person_ids: number[]
    organization_ids: number[]
    list_entries: ListEntry[]
}

interface ListEntry {
    id: number
    creator_id: number
    list_id: number
    entity_id: number
    entity_type: number
    created_at: string
}

export type AffinityDealInput = {
    name: string,
    list_id: number,
    person_ids?: number[],
    organization_ids?: number[]
}

export type AffinityDealOutput = Partial<AffinityDeal>

