import { JiraCollectionMapper } from '../services/jira/mappers';

const jiraCollectionMapper = new JiraCollectionMapper();

export const collectionUnificationMapping = {
  jira: {
    unify: jiraCollectionMapper.unify.bind(jiraCollectionMapper),
    desunify: jiraCollectionMapper.desunify,
  },
};
