interface GithubTag {
    id: number
    node_id: string
    url: string
    name: string
    description: string
    color: string
    default: boolean
}

export type GithubTagInput = {
    id: string
}


export type GithubTagOutput = Partial<GithubTag>;