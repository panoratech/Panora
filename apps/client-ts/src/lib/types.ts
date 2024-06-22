export interface HookBaseReturn {
    isLoading: boolean;
    error: Error | null;
}

export interface PaginationParams {
    page: number;
    limit: number;
}