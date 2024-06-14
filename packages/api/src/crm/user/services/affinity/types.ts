interface AffinityUser {
    tenant: Tenant
    user: User
    grant: Grant
}

interface Tenant {
    id: number
    name: string
    subdomain: string
}

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
}

interface Grant {
    type: string
    scope: string
    createdAt: string
}

export type AffinityUserOutput = Partial<AffinityUser>;
export type AffinityUserInput = null;
