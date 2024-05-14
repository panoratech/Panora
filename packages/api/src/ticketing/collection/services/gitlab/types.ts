interface GitlabCollection {
  id: number;
  description: string;
  description_html: string;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
  topics: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  readme_url: string;
  avatar_url: string;
  forks_count: number;
  star_count: number;
  last_activity_at: string;
  namespace: Namespace;
  container_registry_image_prefix: string;
  _links: Links;
  packages_enabled: boolean;
  empty_repo: boolean;
  archived: boolean;
  visibility: string;
  resolve_outdated_diff_discussions: boolean;
  container_expiration_policy: ContainerExpirationPolicy;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  service_desk_enabled: boolean;
  can_create_merge_request_in: boolean;
  issues_access_level: string;
  repository_access_level: string;
  merge_requests_access_level: string;
  forking_access_level: string;
  wiki_access_level: string;
  builds_access_level: string;
  snippets_access_level: string;
  pages_access_level: string;
  analytics_access_level: string;
  container_registry_access_level: string;
  security_and_compliance_access_level: string;
  emails_disabled: any;
  emails_enabled: any;
  shared_runners_enabled: boolean;
  group_runners_enabled: boolean;
  lfs_enabled: boolean;
  creator_id: number;
  import_url: any;
  import_type: any;
  import_status: string;
  import_error: any;
  open_issues_count: number;
  ci_default_git_depth: number;
  ci_forward_deployment_enabled: boolean;
  ci_forward_deployment_rollback_allowed: boolean;
  ci_allow_fork_pipelines_to_run_in_parent_project: boolean;
  ci_job_token_scope_enabled: boolean;
  ci_separated_caches: boolean;
  ci_restrict_pipeline_cancellation_role: string;
  public_jobs: boolean;
  build_timeout: number;
  auto_cancel_pending_pipelines: string;
  ci_config_path: string;
  shared_with_groups: any[];
  only_allow_merge_if_pipeline_succeeds: boolean;
  allow_merge_on_skipped_pipeline: any;
  restrict_user_defined_variables: boolean;
  request_access_enabled: boolean;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  remove_source_branch_after_merge: boolean;
  printing_merge_request_link_enabled: boolean;
  merge_method: string;
  squash_option: string;
  enforce_auth_checks_on_uploads: boolean;
  suggestion_commit_message: any;
  merge_commit_template: any;
  squash_commit_template: any;
  issue_branch_template: string;
  auto_devops_enabled: boolean;
  auto_devops_deploy_strategy: string;
  autoclose_referenced_issues: boolean;
  keep_latest_artifact: boolean;
  runner_token_expiration_interval: any;
  external_authorization_classification_label: string;
  requirements_enabled: boolean;
  requirements_access_level: string;
  security_and_compliance_enabled: boolean;
  compliance_frameworks: any[];
  warn_about_potentially_unwanted_characters: boolean;
  permissions: Permissions;
}

interface Namespace {
  id: number;
  name: string;
  path: string;
  kind: string;
  full_path: string;
  parent_id: any;
  avatar_url: string;
  web_url: string;
}

interface Links {
  self: string;
  issues: string;
  merge_requests: string;
  repo_branches: string;
  labels: string;
  events: string;
  members: string;
  cluster_agents: string;
}

interface ContainerExpirationPolicy {
  cadence: string;
  enabled: boolean;
  keep_n: number;
  older_than: string;
  name_regex: string;
  name_regex_keep: string;
  next_run_at: string;
}

interface Permissions {
  project_access: any;
  group_access: any;
}

export type GitlabCollectionInput = Partial<GitlabCollection>;
export type GitlabCollectionOutput = GitlabCollectionInput;
