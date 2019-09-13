import { createSelector } from 'reselect';

const selectTabs = state => state.ui;

export const selectCurrentTab = createSelector(
  selectTabs,
  ui => ui.selectedTopicTab
);

export const getAssigneFilter = state =>
  state.ui.taskFilter.get('taskAssigneFilter');
export const getStatusFilter = state =>
  state.ui.taskFilter.get('taskStatusFilter');
