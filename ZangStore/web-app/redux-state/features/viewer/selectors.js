const ns = '[viewer/selectors]';
import logger from 'js-logger'
import { Map } from 'immutable';
import cookie from 'react-cookie';

import { createDeepEqualSelector } from '../../utils/commonSelectors';

export const viewerSelector = state => {
  return state.viewer;
};

export const userSelector = createDeepEqualSelector(
  [viewerSelector],
  viewer => {
    console.log('......viewer:', viewer.user.toJS());
    return viewer.user.toJS();
  }
);

export const settingsSelector = createDeepEqualSelector(
  [viewerSelector],
  viewer => {
    console.log('......viewer:', viewer);
    return viewer.settings.toJS();
  }
);

export const globalSettingsSelector = createDeepEqualSelector(
  [settingsSelector],
  settings => ({
    dANotif: settings.dANotif,
    dNotif: settings.dNotif,
    disableAutoJoin: settings.disableAutoJoin,
    muteaudio: settings.muteaudio,
    mutevideo: settings.mutevideo,
    showFeatureTipsOnStartUp: settings.showFeatureTipsOnStartUp,
    _id: settings._id,
    isFetching: settings.isFetching
  })
);

export const userStatisticsSelector = createDeepEqualSelector(
  [viewerSelector],
  viewer => viewer.statistics.toJS()
);


export function getViewerRegion() {
  let region = cookie.load('USER_REGION') || 'us';
  logger.info('user region:', region);
  return region.toLowerCase()
}