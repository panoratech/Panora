interface GithubTeam {
    id: number
    node_id: string
    url: string
    html_url: string
    name: string
    slug: string
    description: string
    privacy: string
    notification_setting: string
    permission: string
    members_url: string
    repositories_url: string
    parent: any
}

export type GithubTeamInput = {
    id: string
}


export type GithubTeamOutput = Partial<GithubTeam>;