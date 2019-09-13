import {
  createDeepEqualSelector,
  statusSelector
} from '../../utils/commonSelectors';
import { createSelector } from 'reselect';
import { userSelector } from '../viewer';

export const commonAuthenticationSelector = createDeepEqualSelector(
  statusSelector('authentication'),
  authentication => ({ ...authentication })
);

export const commonTopicsStatusSelector = createDeepEqualSelector(
  statusSelector('topics'),
  topics => topics
);

export const presenceSelector = createDeepEqualSelector(
  statusSelector('presence'),
  presence => presence
);

export const getSidebarPeople = state => {
  return state.status.sidebarPeople.toJS();
};

export const getInvitePeople = state => {
  return state.status.invitePeople.toJS();
};

const filteredAttendeesSelector = topicId =>
  createDeepEqualSelector(
    [statusSelector('presence'), userSelector],
    (presence, user) => {
      const attendees = presence[topicId] || {};
      const attendeesRes = Object.keys(attendees).map(key => attendees[key]);
      return attendeesRes.sort((a, b) => {
        const isCurrentUserA = user._id === a.user._id;
        const isCurrentUserB = user._id === b.user._id;

        if (isCurrentUserA) return -1;
        if (isCurrentUserB) return 1;

        if (a.content.offline > b.content.offline) return 1;
        if (a.content.offline < b.content.offline) return -1;

        if (a.content.role === b.content.role)
          return a.displayname > b.displayname;
        if (a.content.role === 'admin') return -1;
        if (b.content.role === 'admin') return 1;
        if (a.content.role === 'member') return -1;
        return 1;
      });
    }
  );

export const attendeesSelector = (state, topicId) =>
  createDeepEqualSelector(
    filteredAttendeesSelector(topicId),
    attendees => attendees
  )(state);

const topicsSettings = state => state.status.topicsSettings;

const topicSettings = (state, props) =>
  state.status.topicsSettings[props.spaceId];

export const getMediaServer = () =>
  createSelector(topicSettings, settings => settings.mediaServer);

export const getSpaceSettings = () =>
  createSelector(topicSettings, settings => settings.settings);
