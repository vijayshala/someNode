const ns = '[LocalizerUtil]';

import logger from 'applogger';
import _locals from './supportedLanguages';
import moment from 'moment';

export default function (language, req) {
  let supportedLanguages = Object.keys(_locals);
  let defaultLang, browserLang;
  if (req)  {
    defaultLang = req.regionDetail && req.regionDetail.defaultLanguage && _locals[req.regionDetail.defaultLanguage] ? req.regionDetail.defaultLanguage : 'en-US';
    browserLang = req.acceptsLanguages && req.acceptsLanguages(supportedLanguages) || 'en-US';
  } else {
    defaultLang = 'en-US';
  }
  
  let defaultLocale = _locals[defaultLang];
  logger.info(ns, 'defaultLang:', defaultLang);
  logger.info(ns, 'supportedLanguages:', JSON.stringify(supportedLanguages));
  logger.info(ns, 'browserLang:', browserLang);

  let localizer = {
    messages: defaultLocale,
    defaultLocale: defaultLocale,
    lang: defaultLang,
    get: function (key) {
      if(!this.messages[key]) {
        return this.defaultLocale[key] ? this.defaultLocale[key] : key
      } else {
        return this.messages[key]
      }
    },
    getDate: function(date) {
      let DATE_FORMAT = 'MMMM Do YYYY, h:mm';
      // set date format to user lang
      if(selectedLanguage) {
        moment.locale(selectedLanguage);
      }else{
        moment.locale('en-US');
      }
      return moment(date).format(DATE_FORMAT);
    }
  }
  let selectedLanguage = defaultLang;
  let userLang = (req && req.userInfo && req.userInfo.language) || language;
  if(userLang) {
    logger.info(ns, 'userLang:', userLang);
    selectedLanguage = _locals[userLang] ? userLang : defaultLang;
  } else {
    selectedLanguage = _locals[browserLang] ? browserLang : defaultLang    
  }
  localizer.lang = selectedLanguage;

  logger.info(ns, 'selectedLanguage:', selectedLanguage);
  localizer.messages = _locals[selectedLanguage];

  return localizer;
}