var config = require('../config')
const logger = require('applogger');
var url = require('url')
var constants = require('../config/constants')
const Utils = {
  resolvePlanType: function (contractCount) {
    if(contractCount === 1){
      return "Monthly"
    } else if(contractCount === 12) {
      return "Annualy"
    } else if(contractCount === 24){
      return "Every 2 years"
    } else {
      return "Monthly"
    }
  },
  resolvePartnerType: function (localizer, type) {
    switch(type) {
      case constants.PARTNER_TYPES.msa: 
        return localizer.get('MASTER_SALES_AGENT')
      case constants.PARTNER_TYPES.sales:
        return localizer.get('SALES_AGENT')
      case constants.PARTNER_TYPES.referral:
        return localizer.get('REFERRAL_AGENT')
    }
  },
  getBaseURL: function (req) {
    return url.format({
  		protocol: req.protocol,
  		host: req.headers.host
  	});
  },
  resolvePictureUrl: function (picturefile) {
    if (!picturefile || picturefile === "") {
       return 'https://www.onesna.com/norevimages/noimage.jpg';
    }
    if (picturefile.indexOf('http://') > -1 || picturefile.indexOf('https://') > -1) {
       return picturefile;
    }
    return 'https://storage.googleapis.com/' + config.bucket + '/' + picturefile;
  },
  generateGUID: function () {
    return 'xxxyxxxx-xxxx-4xxx-yxxx-xxxxxyxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  },
  generateRandomString: function (len, chars) {
    chars = chars || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  	var string_length = len || 10;
  	var randomstring = '';
  	for (var i=0; i<string_length; i++) {
  		randomstring += chars.charAt(Math.floor(Math.random() * chars.length));
  	}

    return randomstring;
  },
  generateRandomEmail: () => {
    let email = 'dummy_' + Date.now().toString() + Utils.generateRandomString(5) + '@' + Utils.generateRandomString(5) + '.com'
    return email.toLowerCase()
  },
  CreateOrderConfirmationNumber: function () {
    var rand = 'xxxyxxxx-'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    var d = new Date().getTime().toString();
    d = d.slice(-8)
    var str = rand + d;
    return str.toUpperCase();
  },
  CreateContractNumber: function () {
    var rand = 'xxxyxxxx-xxyyxx-'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    var d = new Date().getTime().toString();
    d = d.slice(-8)
    var str = rand + d;
    return str.toUpperCase();
  },
  CreatePartnerCode: function () {
    return Math.random().toString(36).substring(16).shuffle().shuffle();
  },
  CreateQuoteId: function () {
    var rand = 'xxxyyxxx-'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    var d = new Date().getTime().toString();
    d = d.slice(-8)
    var str = rand + d;
    return str.toUpperCase();
  },
  InitializeCart: function () {
    return {
      items: [],
      billingInformation: {},
      accountInformation: {},
      shippingAddress: {}
    }
  },
  dashToCamelCase: function (str) {
    return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
  },
  findObjectIndex: function (list, field, value) {
    for(var i=0;i<list.length;i++){
      if(list[i][field] == value)
        return i;
    }
    return -1;
  },
  base64encode: function (str) {
    return new Buffer(str).toString('base64')
  },
  base64decode: function (base64) {
    return new Buffer(base64, 'base64').toString('ascii')
  },
  createRandomString: function () {
    return Math.random().toString(36).substr(2);
  },
  calculateDiff: function (from, to) {
    return from === to ? 0 : -(from-to);
  },
  randomFromArray: function (list) {
    return list[~~(Math.random() * list.length)];
  },
  padNumber: function(num, size)  {
    var s = "000000000" + num;
    return s.substr(s.length-size);
  },
  replaceAll: function(str,mapObj){
    var re = new RegExp(Object.keys(mapObj).join("|").replace(/([${}])/g, '\\$1'),"gi");

    return str.replace(re, function(matched){
        return mapObj[matched];
    });
  },
  escapeRegex: function(s) {
    return s.replace(/([.?*+$\[\]\/\\(){}|\-])/g, '\\$1');
  },

}

export default Utils
