
import { formatCurrency, findCurrency } from './currencyFormatter';
import { hasCartItemByTag } from '../redux-state/features/cart/utils'
import { SYSTEM_AVAILABLE_LANGUEAGES, setViewerLanguage } from './syslanguages'
window.webApp = (function () {
  return {
    'formatCurrency': formatCurrency,
    'findCurrency': findCurrency,
    'hasCartItemByTag': hasCartItemByTag,
    'SYSTEM_AVAILABLE_LANGUEAGES': SYSTEM_AVAILABLE_LANGUEAGES,
    'setViewerLanguage': setViewerLanguage,
  }
})();