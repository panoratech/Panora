import { GitlabCollectionMapper } from '../services/gitlab/mappers';
import { JiraCollectionMapper } from '../services/jira/mappers';

const jiraCollectionMapper = new JiraCollectionMapper();

const gitlabCollectionMapper = new GitlabCollectionMapper();
export const collectionUnificationMapping = {
  jira: {
    unify: jiraCollectionMapper.unify.bind(jiraCollectionMapper),
    desunify: jiraCollectionMapper.desunify.bind(jiraCollectionMapper),
  },
  gitlab: {
    unify: gitlabCollectionMapper.unify.bind(gitlabCollectionMapper),
    desunify: gitlabCollectionMapper.desunify.bind(gitlabCollectionMapper),
  },
};
