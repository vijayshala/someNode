export const isUndefined = value => typeof value === 'undefined';

export const isDefined = value => typeof value !== 'undefined';

export const getGUID = () => {
  let date = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = ((date + Math.random() * 16) % 16) | 0;
    date = Math.floor(date / 16);
    return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return uuid;
};
