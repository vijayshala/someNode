//var env = process.env.NODE_ENV || 'development';

//module.exports = require('./' + env);
var fs = require('fs');

var store_cfg_file = process.env.StoreConfig;

if (store_cfg_file){
	console.log("Use config with security config. store_cfg_file:", store_cfg_file);
	var store_cfg_content = fs.readFileSync(store_cfg_file);
	try{
		let store_cfg = JSON.parse(store_cfg_content);
                store_cfg.urls.storeURL = process.env.STOREURL || store_cfg.urls.storeURL;
		module.exports = store_cfg;
	}
	catch (err){
		console.log("Happen error while load config file. Use default setting", err);
		loadDefaultConfig();
	}
}
else{
	console.log("There is no environment of StoreSecConfig use default setting");
}

if (process.env.ESNA_LINK){
	module.exports.urls.identityProviderURL = process.env.ESNA_LINK;
	module.exports.urls.identityProviderApiURL = process.env.ESNA_LINK + '/api/1.0';
	module.exports.urls.identityProviderStorageURL = process.env.ESNA_LINK + '/gcsmock/onesnatesting/';
}
