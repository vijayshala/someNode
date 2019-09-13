class ESErrors{
  constructor(code, message){
    this.code = code || exports.SysUnkownError;
    this.message = message || getMessageByCode(this.code);
  }
  toString(){
    return this.message;
  }
}

exports.SysUnkownError = 'sys_unkown_error';
exports.SysAlreadyRegisterDeferError = 'sys_dup_register_deffer';
exports.SysNotExistedDeferError = 'sys_not_existed_deffer';
exports.BadRequestError = 'api_bad_request_input';
exports.ServerInternalError = 'sys_internal_error';
exports.AuthenticateErrorJWT = 'authen_error.jwt_auth_failed';
exports.AuthenticateErrorOauth2 = 'authen_error.oauth2_auth_failed';
exports.AuthenticateErrorOauth = 'authen_error.oauth_auth_failed';
exports.AuthenticateErrorEsnaServer = 'authen_error.esnaserver_auth_failed';
exports.AuthenticateErrorApiKey = 'authen_error.apikey_auth_failed';
exports.AuthenticateFailed = 'authen_error';
exports.AuthenticateErrorAnonyJWT = 'authen_error.anonymouse_jwt_auth_failed';
exports.AuthenticateErrorAnony4001JWT = 'authen_error.anonymouse_jwt_auth_4001_failed';
exports.AuthenticateFailedOnesnaServer = 'authen_error.account_servercall_authentication_failed';
exports.AuthorizeErrorOauth2 = 'authorize_error.oauth2';
exports.AuthorizeErrorPermission= 'authorize_error.permission';
exports.AuthorizeErrorDeveloperAdmin = 'authorize_error.developer_admin';
// for pre-alpha-release
exports.AuthorizeErrorNotOnApprovedList = 'authorize_error.not_on_approved_list';
//
exports.AuthorizeFailed = 'authorize_error';
exports.SyncAddAccessTokenInvalidData = 'sync_add_accesstoekn_invalid_data';
exports.SyncAddAccessTokenFailed = 'sync_add_accesstoekn_failed';
exports.SyncDeleteAccessTokenInvalidData = 'sync_delete_accesstoekn_invalid_data';
exports.SyncDeleteAccessTokenFailed = 'sync_delete_accesstoekn_failed';
exports.SignJWTFailed = 'sign_jwt_failed';
exports.VerifyJWTFailed = 'verify_jwt_failed'

exports.UploadUrlCreateFailed = 'upload_url_create_failed';
exports.DownloadUrlCreateFailed = 'download_url_create_failed';

exports.DBError = 'db_error';
exports.DBErrorDuplicateKey = 'db_error.duplicateKey';
exports.NotExsistedError = 'not_existed_error';
exports.NotCreatorError = 'not_exist_creator_error';
exports.NotParentError = 'not_exist_parent_error';
exports.UpdateRecordWithModifiedOutdate = 'update_outdated_record';

exports.OAuth2AccessTokenNotExisted = 'access_token_not_existed_error';
exports.AccessOnesnaHappenError = 'access_accounts_happen_error';
exports.ViewNotImplement = 'view_not_implement';

exports.SchemaInvalidHeader = 'schema_invalid.';

exports.UserGetFailed = 'user.get_failed';

exports.AnonymousGetFailed = 'Anonymous.get_failed';

exports.TopicNotSupportDirect = 'topic.not_support_direct';
exports.TopicCreateFailed = 'topic.create_failed';

exports.MessageInvalidProvider = 'message_invalid.content_data_provider';
exports.MessageInvalidPath = 'message_invalid.content_data_path';
exports.MessageInvalidPreviewFile = 'message_invalid.content_data_previewfile';
exports.MessageInvalidFileId = 'message_invalid.content_data_fileid';
exports.MessageInvalidFileSize = 'message_invalid.content_data_filesize';
exports.MessageInvalidCategory = 'message_invalid.category';
exports.MessageNotSupportSenderType = 'message_invalid.sender.type';
exports.MessageUnexpectedCategory = 'message_unexpected.category';
exports.ParentMessageNotExsistedError = 'parent_message_not_existed_error';
exports.MessageInvalidDupLike = 'message_invalid.duplicate_like_comment';

exports.TaskqueueInvalidUrl = 'taskqueue_invalid.url';
exports.TaskqueueRetry = 'taskqueue.retry';
exports.TaskqueueEndBeforeTimout = 'taskqueue.end_before_timeout';
exports.TaskNoRetryError = 'taskqueue.no_retry'; 
exports.TaskNeedRetryError = 'taskqueue.TaskNeedRetryError';
exports.RecordMigrageError = 'migrateAddRecord.failed';

exports.MemcacheNotReady = 'memcache.not_ready';
exports.NoValidateObjectType = 'relationPermission.objecttype_invalid';

exports.FileCopyFailed = 'file.copy_failed';
exports.FileCreateObjectFailed = 'file.create_fileobject_failed';
exports.FileDeleteFailed = 'file.delete_files_failed';
exports.NoSuchConverter = 'fileView.convert_not_implement';
exports.AlreadyStartConvert = 'fileView.convert_already_start_convert';
exports.SetConvertStatusFailed = 'fileView.set_convertstatus_failed';
exports.SetPagesFailed = 'fileView.set_pages_failed';
exports.SetPagingFailed = 'fileView.set_paging_failed';
exports.SetProcessurlFailed = 'fileView.set_processurl_failed';
exports.AsposeNoSIDOrKey = 'fileView.aspose_nosidorkey';
exports.FileConvertFailed = 'fileView.convert_failed';
exports.GetPreviewUrlFailed = 'fileView.get_previewurl_failed';
exports.GetviewUrlsFailed = 'fileView.get_viewurls_failed';
exports.ConvertFileCleanWorkFailed = 'fileView.convert_file_cleanwork_failed';
exports.SyncMessageSenderFailed = 'sync_sender_msg.failed';
exports.SyncParentMessageTitleFailed = 'sync_prt_msg_title.failed';
exports.ConvertSprNotWorking='fileView.convert_servrice_provider_not_working';
exports.ConvertUnkownError='fileView.convert_unkown_error';

exports.DTSidInvalidDataForGenerate='dtsid.invalid_data_generating';
exports.DTSidRemoveFailed='dtsid.remove_failed';
exports.DTSidCheckFailed='dtsid.check_failed';
exports.DTSidGenerateFailed = 'dtsid.generate_dtsid_failed';
exports.DTSidUpdateCreatedFailed = 'dtsid.update_created_failed';
exports.DTSidVerifyFailed = 'dtsid.verify_failed';

exports.updateUserFailed = 'user.update_failed';
exports.syncUserFailed = 'user.sync_failed';

exports.taskInsertFailed = 'task.insert_failed';
exports.proxyTaskHappenError = 'task.proxy_failed';

exports.rateLongDistInvalidProd = 'rate_longdistance.invalid_provider';
exports.rateLongDistImportFailed = 'rate_longdistance.import_failed';

var ErrorDescription = {};
ErrorDescription[exports.SysUnkownError] = 'System Unkown Error';
ErrorDescription[exports.SysAlreadyRegisterDeferError] = 'The deffer already registered';
ErrorDescription[exports.SysNotExistedDeferError] = 'The deffer not existed';

ErrorDescription[exports.ServerInternalError] = 'Server Internal Error';
ErrorDescription[exports.DBError] = 'Database operation error';
ErrorDescription[exports.DBErrorDuplicateKey] = 'Database operation duplicate key error:';
ErrorDescription[exports.NotExsistedError] = 'Not exsist';
ErrorDescription[exports.NotCreatorError] = 'Not exsist creator';
ErrorDescription[exports.NotParentError] = 'Not exsist parent';
ErrorDescription[exports.UpdateRecordWithModifiedOutdate] = 'Update outdated record';

ErrorDescription[exports.OAuth2AccessTokenNotExisted] = 'Access_token not existed';
ErrorDescription[exports.AccessOnesnaHappenError] = 'Access zang account happen error';
ErrorDescription[exports.BadRequestError] = 'Api Bad Request Check Input';
ErrorDescription[exports.AuthenticateErrorJWT] = 'Authenticate Jwt token failed';
ErrorDescription[exports.AuthenticateErrorOauth2] = 'Authenticate oauth2 failed';
ErrorDescription[exports.AuthenticateErrorAnonyJWT] = 'Authenticate anonymouse jwt failed';
ErrorDescription[exports.AuthenticateErrorAnonyJWT] = 'Authenticate anonymouse jwt failed';
ErrorDescription[exports.AuthenticateErrorEsnaServer] = 'Authenticate for esan server call failed';
ErrorDescription[exports.AuthenticateErrorApiKey] = 'Authenticate for api key call failed';

ErrorDescription[exports.AuthorizeErrorNotOnApprovedList] = 'Not on the approved list';
ErrorDescription[exports.AuthorizeErrorOauth2] = 'Authorise oauth2 failed';
ErrorDescription[exports.AuthorizeErrorPermission] = 'Authorise permission failed';

ErrorDescription[exports.SyncAddAccessTokenInvalidData] = 'Invalid data for adding accesstoken by synchronizing way';
ErrorDescription[exports.SyncAddAccessTokenFailed] = 'When adding access token by synchronizing way failed';
ErrorDescription[exports.SyncDeleteAccessTokenInvalidData] = 'Invalid data for deleting accesstoken by synchronizing way';
ErrorDescription[exports.SyncDeleteAccessTokenFailed] = 'When deleteing access token by synchronizing way failed';
ErrorDescription[exports.SignJWTFailed] = 'Sign a jwt token failed';
ErrorDescription[exports.VerifyJWTFailed] = 'Verify a jwt token failed';

ErrorDescription[exports.UploadUrlCreateFailed] = 'Create upload url failed!';
ErrorDescription[exports.DownloadUrlCreateFailed] = 'Create download url failed!';

ErrorDescription[exports.ViewNotImplement] = 'View not implement';

ErrorDescription[exports.UserGetFailed] = 'Get user failed!';

ErrorDescription[exports.AnonymousGetFailed] = 'Get anonymous failed!';

ErrorDescription[exports.TopicCreateFailed] = 'Create topic failed!';
ErrorDescription[exports.TopicNotSupportDirect] = 'Can not create direct topic!';

ErrorDescription[exports.MessageInvalidProvider] = 'Message object has invalid Provider in content.data';
ErrorDescription[exports.MessageInvalidPath] = 'Message object has invalid path in content.data';
ErrorDescription[exports.MessageInvalidPreviewFile] = 'Message object has invalid previewFile in content.data';
ErrorDescription[exports.MessageInvalidFileId] = 'Message object has invalid FileId in content.data';
ErrorDescription[exports.MessageInvalidFileSize] = 'Message object has invalid fileSize in content.data';
ErrorDescription[exports.MessageInvalidCategory] = 'Message object has invalid category';
ErrorDescription[exports.MessageNotSupportSenderType] = 'Message object has invalid sender type';
ErrorDescription[exports.MessageUnexpectedCategory] = 'The category is not as expected';
ErrorDescription[exports.ParentMessageNotExsistedError] = 'Parent message not existed';
ErrorDescription[exports.MessageInvalidDupLike] = 'Duplicate like message from same user to same category';
ErrorDescription[exports.TaskqueueInvalidUrl] = 'Taskqueue got a invalid url';
ErrorDescription[exports.TaskqueueRetry] = 'Taskqueue need retry again';
ErrorDescription[exports.TaskqueueEndBeforeTimout] = 'Taskqueue end before timeout';
ErrorDescription[exports.TaskNoRetryError] = 'Taskqueue no retry although happen error';
ErrorDescription[exports.RecordMigrageError] = 'Add record for migrate happen error';

ErrorDescription[exports.MemcacheNotReady] = 'Memcahe not ready';
ErrorDescription[exports.NoValidateObjectType] = 'Relation Permission must give valid object type';
ErrorDescription[exports.NoSuchConverter] = 'There is no such converter';
ErrorDescription[exports.AlreadyStartConvert] = 'The file already start convert';
ErrorDescription[exports.FileCopyFailed] = 'Copy file failed';
ErrorDescription[exports.FileCreateObjectFailed] = 'Create file object failed';
ErrorDescription[exports.AsposeNoSIDOrKey] = 'There is no App SID or App Key of Aspose';
ErrorDescription[exports.SetConvertStatusFailed] = 'Failed to set convert status of a file';
ErrorDescription[exports.SetPagesFailed] = 'Failed to set pages of a file';
ErrorDescription[exports.SetPagingFailed] = 'Failed to set paging number of a file';
ErrorDescription[exports.SetProcessurlFailed] = 'Failed to set process url of a file';

ErrorDescription[exports.FileConvertFailed] = 'Convert file failed';
ErrorDescription[exports.FileDeleteFailed] = 'Delete files failed';
ErrorDescription[exports.GetPreviewUrlFailed] = 'Get preview url failed';
ErrorDescription[exports.GetviewUrlsFailed] = 'Get view urls failed';
ErrorDescription[exports.ConvertFileCleanWorkFailed] = 'Convert file clean work failed';
ErrorDescription[exports.SyncMessageSenderFailed] = 'Synchronize sender information failed';
ErrorDescription[exports.SyncParentMessageTitleFailed] = 'Synchronize parent message title failed';

ErrorDescription[exports.DTSidInvalidDataForGenerate] = 'In valida data for generate device topic session id';
ErrorDescription[exports.DTSidRemoveFailed] = 'Remove device topic session id failed';
ErrorDescription[exports.DTSidCheckFailed] = 'Check device topic session id failed';
ErrorDescription[exports.DTSidGenerateFailed] = 'Generate device topic session id failed';
ErrorDescription[exports.DTSidUpdateCreatedFailed] = 'Update created time of device topic session id failed';
ErrorDescription[exports.DTSidVerifyFailed] = 'Verify dtsid failed';

ErrorDescription[exports.updateUserFailed] = 'Update user failed';
ErrorDescription[exports.syncUserFailed] = 'synchronize user failed';
ErrorDescription[exports.taskInsertFailed] = 'Insert task into queue happen error!';
ErrorDescription[exports.proxyTaskHappenError] = 'Proxy the task to processor failed!'


const NoErrorMessage = 'No Error Message';

function getMessageByCode(code){
  return ErrorDescription[code] || NoErrorMessage;
}

exports.ESErrors = ESErrors;
exports.getMessageByCode = getMessageByCode;
