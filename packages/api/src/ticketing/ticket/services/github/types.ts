interface GithubTicketOutputType {
    id: number
    node_id: string
    url: string
    repository_url: string
    labels_url: string
    comments_url: string
    events_url: string
    html_url: string
    number: number
    state: string
    title: string
    body: string
    user: User
    labels: Label[]
    assignee: Assignee
    assignees: Assignee2[]
    milestone: Milestone
    locked: boolean
    active_lock_reason: string
    comments: number
    pull_request: PullRequest
    closed_at: any
    created_at: string
    updated_at: string
    repository: Repository
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

interface Label {
    id: number
    node_id: string
    url: string
    name: string
    description: string
    color: string
    default: boolean
}

interface Assignee {
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

interface Assignee2 {
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

interface Milestone {
    url: string
    html_url: string
    labels_url: string
    id: number
    node_id: string
    number: number
    state: string
    title: string
    description: string
    creator: Creator
    open_issues: number
    closed_issues: number
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
}

interface Creator {
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

interface PullRequest {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
}

interface Repository {
    id: number
    node_id: string
    name: string
    full_name: string
    owner: Owner
    private: boolean
    html_url: string
    description: string
    fork: boolean
    url: string
    archive_url: string
    assignees_url: string
    blobs_url: string
    branches_url: string
    collaborators_url: string
    comments_url: string
    commits_url: string
    compare_url: string
    contents_url: string
    contributors_url: string
    deployments_url: string
    downloads_url: string
    events_url: string
    forks_url: string
    git_commits_url: string
    git_refs_url: string
    git_tags_url: string
    git_url: string
    issue_comment_url: string
    issue_events_url: string
    issues_url: string
    keys_url: string
    labels_url: string
    languages_url: string
    merges_url: string
    milestones_url: string
    notifications_url: string
    pulls_url: string
    releases_url: string
    ssh_url: string
    stargazers_url: string
    statuses_url: string
    subscribers_url: string
    subscription_url: string
    tags_url: string
    teams_url: string
    trees_url: string
    clone_url: string
    mirror_url: string
    hooks_url: string
    svn_url: string
    homepage: string
    language: any
    forks_count: number
    stargazers_count: number
    watchers_count: number
    size: number
    default_branch: string
    open_issues_count: number
    is_template: boolean
    topics: string[]
    has_issues: boolean
    has_projects: boolean
    has_wiki: boolean
    has_pages: boolean
    has_downloads: boolean
    archived: boolean
    disabled: boolean
    visibility: string
    pushed_at: string
    created_at: string
    updated_at: string
    permissions: Permissions
    allow_rebase_merge: boolean
    template_repository: any
    temp_clone_token: string
    allow_squash_merge: boolean
    allow_auto_merge: boolean
    delete_branch_on_merge: boolean
    allow_merge_commit: boolean
    subscribers_count: number
    network_count: number
    license: License
    forks: number
    open_issues: number
    watchers: number
}

interface Owner {
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

interface Permissions {
    admin: boolean
    push: boolean
    pull: boolean
}

interface License {
    key: string
    name: string
    url: string
    spdx_id: string
    node_id: string
    html_url: string
}


export type GithubTicketInput = {
    title: string | number,
    body?: string,
    assignee?: string,
    milestone?: string | number,
    labels?: string[],
    assignees?: string[],
    [key: string]: any,

}


export type GithubTicketOutput = Partial<GithubTicketOutputType>;
