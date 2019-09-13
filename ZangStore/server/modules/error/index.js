'use strict';

const { VIOLATIONS, SALESMODELRULES } = require('./constants');
const ErrorMessage = require('./message');

class ASCustomError extends Error {}

const knownErrors = {
  // ============================================================
  // common http default errors
  BadRequestError: { message: 'Bad Request', httpStatus: 400, },
  UnauthorizedError: { message: 'Unauthorized', httpStatus: 401, },
  ForbiddenError: { message: 'Forbidden', httpStatus: 403, },
  NotFoundError: { message: 'Not Found', httpStatus: 404, },
  MethodNotAllowedError: { message: 'Method Not Allowed', httpStatus: 405, },
  NotAcceptableError: { message: 'Not Acceptable', httpStatus: 406, },
  RequestTimeoutError: { message: 'Request Timeout', httpStatus: 408, },
  ConflictError: { message: 'Conflict', httpStatus: 409, },
  PayloadTooLargeError: { message: 'Payload Too Large', httpStatus: 413, },
  URITooLongError: { message: 'URI Too Long', httpStatus: 415, },
  TooManyRequestsError: { message: 'Too Many Requests', httpStatus: 429, },
  InternalServerError: { message: 'Internal Server Error', httpStatus: 500, },
  NotImplementedError: { message: 'Not Implemented', httpStatus: 501, },

  // ============================================================
  // application defined errors

  ValidationError: { message: 'Input does not meet validation requirements', httpStatus: 400, },
  ThirdPartyAPIError: { message: 'Error On 3rd-Party API Request', httpStatus: 500, },

  SysUnkownError: { message: 'System Unkown Error', httpStatus: 400, },
  SysAlreadyRegisterDeferError: { message: 'The deffer already registered', httpStatus: 400, },
  SysNotExistedDeferError: { message: 'The deffer not existed', httpStatus: 400, },

  ServerInternalError: { message: 'Server Internal Error', httpStatus: 500, },
  DBError: { message: 'Database operation error', httpStatus: 500, },
  DBErrorDuplicateKey: { message: 'Database operation duplicate key error:', httpStatus: 409, },
  NotExsistedError: { message: 'Not exsist', httpStatus: 400, },
  NotCreatorError: { message: 'Not exsist creator', httpStatus: 400, },
  NotParentError: { message: 'Not exsist parent', httpStatus: 400, },
  UpdateRecordWithModifiedOutdate: { message: 'Update outdated record', httpStatus: 400, },

  OAuth2AccessTokenNotExisted: { message: 'Access_token not existed', httpStatus: 401, },
  AccessOnesnaHappenError: { message: 'Access zang account happen error', httpStatus: 400, },
  // BadRequestError: { message: 'Api Bad Request Check Input', httpStatus: 400, },

  AuthenticateErrorJWT: { message: 'Authenticate Jwt token failed', httpStatus: 401, },
  AuthenticateErrorOauth2: { message: 'Authenticate oauth2 failed', httpStatus: 401, },
  AuthenticateErrorAnonyJWT: { message: 'Authenticate anonymouse jwt failed', httpStatus: 401, },
  AuthenticateErrorEsnaServer: { message: 'Authenticate for esan server call failed', httpStatus: 401, },
  AuthenticateErrorApiKey: { message: 'Authenticate for api key call failed', httpStatus: 401, },

  AuthorizeErrorNotOnApprovedList: { message: 'Not on the approved list', httpStatus: 403, },
  AuthorizeErrorOauth2: { message: 'Authorise oauth2 failed', httpStatus: 403, },
  AuthorizeErrorPermission: { message: 'Authorise permission failed', httpStatus: 403, },

  SyncAddAccessTokenInvalidData: { message: 'Invalid data for adding accesstoken by synchronizing way', httpStatus: 400, },
  SyncAddAccessTokenFailed: { message: 'When adding access token by synchronizing way failed', httpStatus: 400, },
  SyncDeleteAccessTokenInvalidData: { message: 'Invalid data for deleting accesstoken by synchronizing way', httpStatus: 400, },
  SyncDeleteAccessTokenFailed: { message: 'When deleteing access token by synchronizing way failed', httpStatus: 400, },
  SignJWTFailed: { message: 'Sign a jwt token failed', httpStatus: 400, },
  VerifyJWTFailed: { message: 'Verify a jwt token failed', httpStatus: 400, },

  UploadUrlCreateFailed: { message: 'Create upload url failed!', httpStatus: 400, },
  DownloadUrlCreateFailed: { message: 'Create download url failed!', httpStatus: 400, },

  ViewNotImplement: { message: 'View not implement', httpStatus: 400, },

  UserGetFailed: { message: 'Get user failed!', httpStatus: 400, },

  AnonymousGetFailed: { message: 'Get anonymous failed!', httpStatus: 400, },

  TopicCreateFailed: { message: 'Create topic failed!', httpStatus: 400, },
  TopicNotSupportDirect: { message: 'Can not create direct topic!', httpStatus: 400, },

  MessageInvalidProvider: { message: 'Message object has invalid Provider in content.data', httpStatus: 400, },
  MessageInvalidPath: { message: 'Message object has invalid path in content.data', httpStatus: 400, },
  MessageInvalidPreviewFile: { message: 'Message object has invalid previewFile in content.data', httpStatus: 400, },
  MessageInvalidFileId: { message: 'Message object has invalid FileId in content.data', httpStatus: 400, },
  MessageInvalidFileSize: { message: 'Message object has invalid fileSize in content.data', httpStatus: 400, },
  MessageInvalidCategory: { message: 'Message object has invalid category', httpStatus: 400, },
  MessageNotSupportSenderType: { message: 'Message object has invalid sender type', httpStatus: 400, },
  MessageUnexpectedCategory: { message: 'The category is not as expected', httpStatus: 400, },
  ParentMessageNotExsistedError: { message: 'Parent message not existed', httpStatus: 400, },
  MessageInvalidDupLike: { message: 'Duplicate like message from same user to same category', httpStatus: 400, },
  TaskqueueInvalidUrl: { message: 'Taskqueue got a invalid url', httpStatus: 400, },
  TaskqueueRetry: { message: 'Taskqueue need retry again', httpStatus: 400, },
  TaskqueueEndBeforeTimout: { message: 'Taskqueue end before timeout', httpStatus: 400, },
  TaskNoRetryError: { message: 'Taskqueue no retry although happen error', httpStatus: 400, },
  RecordMigrageError: { message: 'Add record for migrate happen error', httpStatus: 400, },

  MemcacheNotReady: { message: 'Memcahe not ready', httpStatus: 400, },
  NoValidateObjectType: { message: 'Relation Permission must give valid object type', httpStatus: 400, },
  NoSuchConverter: { message: 'There is no such converter', httpStatus: 400, },
  AlreadyStartConvert: { message: 'The file already start convert', httpStatus: 400, },
  FileCopyFailed: { message: 'Copy file failed', httpStatus: 400, },
  FileCreateObjectFailed: { message: 'Create file object failed', httpStatus: 400, },
  AsposeNoSIDOrKey: { message: 'There is no App SID or App Key of Aspose', httpStatus: 400, },
  SetConvertStatusFailed: { message: 'Failed to set convert status of a file', httpStatus: 400, },
  SetPagesFailed: { message: 'Failed to set pages of a file', httpStatus: 400, },
  SetPagingFailed: { message: 'Failed to set paging number of a file', httpStatus: 400, },
  SetProcessurlFailed: { message: 'Failed to set process url of a file', httpStatus: 400, },

  FileConvertFailed: { message: 'Convert file failed', httpStatus: 400, },
  FileDeleteFailed: { message: 'Delete files failed', httpStatus: 400, },
  GetPreviewUrlFailed: { message: 'Get preview url failed', httpStatus: 400, },
  GetviewUrlsFailed: { message: 'Get view urls failed', httpStatus: 400, },
  ConvertFileCleanWorkFailed: { message: 'Convert file clean work failed', httpStatus: 400, },
  SyncMessageSenderFailed: { message: 'Synchronize sender information failed', httpStatus: 400, },
  SyncParentMessageTitleFailed: { message: 'Synchronize parent message title failed', httpStatus: 400, },

  DTSidInvalidDataForGenerate: { message: 'In valida data for generate device topic session id', httpStatus: 400, },
  DTSidRemoveFailed: { message: 'Remove device topic session id failed', httpStatus: 400, },
  DTSidCheckFailed: { message: 'Check device topic session id failed', httpStatus: 400, },
  DTSidGenerateFailed: { message: 'Generate device topic session id failed', httpStatus: 400, },
  DTSidUpdateCreatedFailed: { message: 'Update created time of device topic session id failed', httpStatus: 400, },
  DTSidVerifyFailed: { message: 'Verify dtsid failed', httpStatus: 400, },

  updateUserFailed: { message: 'Update user failed', httpStatus: 400, },
  syncUserFailed: { message: 'synchronize user failed', httpStatus: 400, },
  taskInsertFailed: { message: 'Insert task into queue happen error!', httpStatus: 400, },
  proxyTaskHappenError: { message: 'Proxy the task to processor failed!', httpStatus: 400, },
};

let errorClasses = { VIOLATIONS, SALESMODELRULES, ErrorMessage, ASCustomError };
Object.keys(knownErrors).forEach((name) => {
  const definition = knownErrors[name];
  errorClasses[name] = class extends ASCustomError {
    constructor(message, details) {
      super(message);

      this.name = name;
      this.message = message || definition.message;
      this.httpStatus = definition.httpStatus;
      if (details) {
        this.details = details;
      }
    }
  };
});

module.exports = errorClasses;
