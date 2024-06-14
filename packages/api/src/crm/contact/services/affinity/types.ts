interface AffinityContact {
    id: number
    type: number
    first_name: string
    last_name: string
    primary_email: string
    emails: string[]
    organization_ids: number[]
    opportunity_ids: number[]
    current_organization_ids: number[]
    list_entries: ListEntry[]
    interaction_dates: InteractionDates
    interactions: Interactions
}

export type AffinityContactInput = {
    first_name: string,
    last_name: string,
    emails: string[],
    organization_ids?: number[]
}

interface ListEntry {
    id: number
    list_id: number
    creator_id: number
    entity_id: number
    created_at: string
}

interface InteractionDates {
    first_email_date: string
    last_email_date: string
    last_event_date: string
    last_chat_message_date: string
    last_interaction_date: string
    next_event_date: string
    first_event_date: string
}

interface Interactions {
    first_email: InteractionsType
    last_email: InteractionsType
    last_event: InteractionsType
    last_chat_message: InteractionsType
    last_interaction: InteractionsType
    next_event: InteractionsType
    first_event: InteractionsType
}

interface InteractionsType {
    date: string
    person_ids: number[]
}

export type AffinityContactOutput = Partial<AffinityContact>;

