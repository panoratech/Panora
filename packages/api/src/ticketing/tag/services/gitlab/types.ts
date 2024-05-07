interface GitlabTag {
    commit: Commit
    release: Release
    name: string
    target: string
    message: any
    protected: boolean
    created_at: string
}

export interface Commit {
    id: string
    short_id: string
    title: string
    created_at: string
    parent_ids: string[]
    message: string
    author_name: string
    author_email: string
    authored_date: string
    committer_name: string
    committer_email: string
    committed_date: string
}

export interface Release {
    tag_name: string
    description: string
}


export type GitlabTagInput = Partial<GitlabTag>;
export type GitlabTagOutput = GitlabTagInput;