function ESErrors(code, message){
	this.code = code;
	this.message = message || getMessageByCode(this.code);
	this.toString = function(){
		return this.message;
	}
}

exports.DBError = 'db_error';
exports.SchemaInvalidHeader = 'schema_invalid.';
exports.DBErrorDuplicateKey = 'db_error.duplicateKey';

var ErrorDescription = {};
ErrorDescription[exports.DBError] = 'Database operation error';
ErrorDescription[exports.DBErrorDuplicateKey] = 'Database operation duplicate key error:';

function getMessageByCode(code){
  return ErrorDescription[code] || NoErrorMessage;
}

exports.ESErrors = ESErrors;
exports.getMessageByCode = getMessageByCode;