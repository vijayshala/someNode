const ns = '[common/currencyFormatter]';
import logger from 'js-logger'
import currencyFormatter from 'currency-formatter'

export function formatCurrency(price = 0.00, options={ code: 'USD', format: '%s %v'}) {
  // format the currency to display the symbol first
  options.format = '%s %v';
  return currencyFormatter.format(parseFloat(price.toString()), options);
}


export function findCurrency(price = 0.00, currency = 'USD') {  
  let fn = `${ns}[findCurrency]`
  let currencyFormat = currencyFormatter.findCurrency(currency) || {};
  let {
    symbol = '$',
    decimalSeparator = '.',
    symbolOnLeft = true,
    spaceBetweenAmountAndSymbol = false,
    decimalDigits=2
  } = currencyFormat;
  
  let formattedCurrency = currencyFormatter
    .format(price, { code: currency })
    .replace(symbol, '');
  
    logger.info(fn, 'currencyFormat:', {currencyFormat, price, currency, formattedCurrency});
  
  let number = formattedCurrency
  let desimal = null      
  if (formattedCurrency.indexOf(decimalSeparator) > -1) {      
    number = formattedCurrency.split(decimalSeparator)[0]
    desimal = formattedCurrency.split(decimalSeparator)[1]      
  }
  

  // logger.info(fn, {
  //   price,
  //   fixedDecimals,
  //   symbol,
  //   decimalSeparator,
  //   symbolOnLeft,
  //   spaceBetweenAmountAndSymbol,
  //   decimalDigits,
  //   number,
  //   desimal
  // });

  return {
    symbol,
    decimalSeparator,
    symbolOnLeft,
    spaceBetweenAmountAndSymbol,
    decimalDigits,
    formattedCurrency,
    number,
    desimal
  }
}