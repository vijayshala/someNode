const USER_TABLE_NAME = 'user';

// export const USER_PERMISSION_GROUP_TYPES = {
//   USERSELF_PERMISSION_GROUP: 'USERSELF_PERMISSION_GROUP',
//   IT_ADMIN_PERMISSION_GROUP: 'IT_ADMIN_PERMISSION_GROUP',
//   SITE_ADMIN_PERMISSION_GROUP: 'SITE_ADMIN_PERMISSION_GROUP'
// };

// export const isITAdmin = user =>
//   !!user.permissions &&
//   !!user.permissions.indexOf(
//     USER_PERMISSION_GROUP_TYPES.IT_ADMIN_PERMISSION_GROUP
//   );

// export const isSiteAdmin = user =>
//   !!user.permissions &&
//   !!user.permissions.indexOf(
//     USER_PERMISSION_GROUP_TYPES.SITE_ADMIN_PERMISSION_GROUP
//   );

module.exports = {
  USER_TABLE_NAME,
};
