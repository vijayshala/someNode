import { fromJS } from 'immutable';
import {
  createSelectorCreator,
  defaultMemoize,
  createSelector
} from 'reselect';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

export const entitiesSelector = type => state => {
  console.log(
    'entitiesSelector...state.entities[type]:',
    type,
    state.entities[type]
  );
  return (state.entities && state.entities[type]) || fromJS({});
};

export const entitiesArraySelector = type =>
  createDeepEqualSelector([entitiesSelector(type)], entities => {
    console.log('entitiesArraySelector...entities', entities.toArray());
    return entities.toArray(); //Object.keys(entities).map(id => entities[id])
  });

export const entitySelector = (type, id) =>
  createDeepEqualSelector([entitiesSelector(type)], entities => entities[id]);

export const statusSelector = type => state => state.status[type].toJS();

export const commonEntitiesArraySelector = type =>
  createSelector([entitiesSelector(type)], entities => {
    console.log('commonEntitiesArraySelector...entities', entities);
    return entities.toArray(); //Object.keys(entities).map(id => entities[id])
  });

export const commonSortedEntitiesArraySelector = (type, fields) =>
  createSelector(commonEntitiesArraySelector(type), items =>
    sortBy(items, fields)
  );

export const location = state => state.routing.location;

export const currentProductIdSelector = state => {
  const pathname = state.routing.location.pathname;
  return (    
    (pathname.includes('/products/') && pathname.substr('/products/'.length))
  );
};

export const getSpaceId = createSelector(
  state => state.routing.location.pathname,
  pathname => {
    return (
      (pathname.includes('/spaces/dashboard') && '') ||
      (pathname.includes('/spaces/') && pathname.substr(8))
    );
  }
);

export const getSpaceTitle = createSelector(
  [getSpaceId, state => state.entities.topics],
  (spaceId, topics) => {
    if (topics[spaceId]) {
      return topics[spaceId].title;
    }
    return '';
  }
);

/*
export const currentTopicSelector = state => {
    const pathname = state.routing.location.pathname;
    const pathnameParts = pathname.split('/');

    if(pathnameParts[1] && pathnameParts[1] == 'spaces' && pathnameParts[2] && pathnameParts[2] != 'dashboard'){
      var topicId = pathnameParts[2];

      if(state.entities.topics[topicId]){
          return state.entities.topics[topicId];
      }
    }

    return null;

};
*/
