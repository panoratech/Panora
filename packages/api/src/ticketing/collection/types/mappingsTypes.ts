import { JiraCollectionMapper } from '../services/jira/mappers';
import { GitlabCollectionMapper } from '../services/gitlab/mappers';

const jiraCollectionMapper = new JiraCollectionMapper();
const gitLabCollectionMapper = new GitlabCollectionMapper();

export const collectionUnificationMapping = {
  jira: {
    unify: jiraCollectionMapper.unify.bind(jiraCollectionMapper),
    desunify: jiraCollectionMapper.desunify,
  },
  gitlab: {
    unify: gitLabCollectionMapper.unify.bind(gitLabCollectionMapper),
    desunify: gitLabCollectionMapper.desunify.bind(gitLabCollectionMapper),
  },
};
