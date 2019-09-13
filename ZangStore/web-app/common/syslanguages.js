const ns = 'common/syslanguages';
import logger from 'js-logger'
import { FetchRest } from '../redux-state/middleware/fetchRest';
const fetchRest = new FetchRest();

export function setViewerLanguage(lang = 'en-US', cb) {
  let fn = `${ns}[handleFetchNumbers]`
  let url = `/clientapi/users/me/languages`
  logger.info(fn, 'url:', url);

  return fetchRest.fetch(url, {
    method: 'POST',
    body: JSON.stringify({ languages: [{ code: lang, primary: true }] })
  }, ).then(response => {
    logger.info(fn, 'fetch.then response:', response);
    cb(null, response);
  }).catch((error) => {
    logger.error(fn, error);
    cb(error);
  });
}

export const SYSTEM_AVAILABLE_LANGUEAGES = [{
  code: 'en-US',
  description: 'English'
}, {
  code: 'de-DE',
  description: 'Deutsch - German'
}, {
  code: 'es-LA',
  description: 'español - Spanish'
}, {
  code: 'fr-CA',
  description: 'français (Canada) - French (Canada)'
}, {
  code: 'fr-FR',
  description: 'français (France) - French (France)'
}, {
  code: 'it-IT',
  description: 'italiano - Italian'
}, {
  code: 'ja',
  description: '日本語 - Japanese'
}, {
  code: 'ko-KR',
  description: '한국어 - Korean'
}, {
  code: 'pt-BR',
  description: 'português - Portuguese (Brazil)'
}, {
  code: 'ru',
  description: 'русский - Russian'
}, {
  code: 'zh-CN',
  description: '中文（简体） - Chinese (Simplified)'
}, {
  code: 'zh-HK',
  description: '中文（香港）- Chinese (Hong Kong)'
}]