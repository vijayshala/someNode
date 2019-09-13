const ns = '[LocalizerMiddleware]'

import logger from 'applogger'
import _locals from '../localizer/supportedLanguages'
import moment from 'moment'
import localizerUtil from '../localizer/localizerUtil';


export default function (req, res, next) {
  let localizer = localizerUtil(null, req);

  req.localizer = localizer
  res.locals.localizer = localizer
  res.locals.defaultLocale = localizer.defaultLocale;
  res.locals.selectedLanguage = localizer.lang;
  next()
}

// export default function (req, res, next) {
//   let langs = req.acceptsLanguages();
//   logger.info(req.requestId, ns, '[accepted languages]', langs)
//   logger.info(req.requestId, ns, '[first language]', langs[0])
//   let lang = null
//   try {
//     lang = require('../localizer/' + langs[0] + '.js')
//     lang.__lang = langs[0]
//   } catch(e) {
//     logger.warn(req.requestId, ns, e)
//
//     lang = require('../localizer/en.js')
//     lang.__lang = 'en'
//     logger.info(req.requestId, ns, 'Setting Default Language', lang.__lang)
//   }
//
//   req.localizer = lang
//   res.locals.localizer = lang
//   next()
// }
