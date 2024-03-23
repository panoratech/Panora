import { JiraCollectionMapper } from '../services/jira/mappers';
import { GorgiasCollectionMapper } from '../services/gorgias/mappers';

const jiraCollectionMapper = new JiraCollectionMapper();
const gorgiasCollectionMapper = new GorgiasCollectionMapper();

export const collectionUnificationMapping = {
  jira: {
    unify: jiraCollectionMapper.unify.bind(jiraCollectionMapper),
    desunify: jiraCollectionMapper.desunify,
  },
  gorgias: {
    unify: gorgiasCollectionMapper.unify.bind(gorgiasCollectionMapper),
    desunify: gorgiasCollectionMapper.desunify,
  },
};
