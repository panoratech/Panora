interface GithubComment {
    id: number
    node_id: string
    url: string
    html_url: string
    body: string
    user: User
    created_at: string
    updated_at: string
    issue_url: string
    author_association: string
}

interface User {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
}


export type GithubCommentInput = {
    body: string
}


export type GithubCommentOutput = Partial<GithubComment>;
