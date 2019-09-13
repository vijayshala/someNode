const ns = '[billing][integrations][avalara]';

import logger from 'applogger';
import { asyncRequest as request } from '../helper';
import config from '../../../config';
import * as constants from '../Constants';
import { nonBlockify } from '../../modules/utils';
import { BillingError, ERROR_CODES } from '../Error';


export async function VerifyAddress(req, address_obj) {
  let func = `[${req.requestId}][${ns}][VerifyAddress]`;

  logger.info(func, 'begin');

  let options = {
    method: 'POST',
    uri: `${config.AVALARA_ENDPOINT}${constants.AVALARA_ENDPOINTS.GEOCODE}`,
    headers:  {
      api_key: Buffer.from(`${config.AVALARA_USERNAME}:${config.AVALARA_PASSWORD}`).toString('base64')
    },
    body: [
      {
        cass: false, //Standardize address
        addr: address_obj.address,
        city: address_obj.city,
        st: address_obj.state,
        zip: address_obj.zip,
        ctry: address_obj.country
      }
    ],
    json: true
  };

  logger.info(func, 'request', options);

  let geocode = await request(options);

  logger.info(func, 'response', geocode);

  return geocode;
}

export async function CalculateTax(req, data) {
  let func = `[${req.requestId}][${ns}][CalculateTax]`;

  logger.info(func, 'begin');

  let options = {
    method: 'POST',
    uri: `${config.AVALARA_ENDPOINT}${constants.AVALARA_ENDPOINTS.CALCULATE_TAX}`,
    headers:  {
      api_key: Buffer.from(`${config.AVALARA_USERNAME}:${config.AVALARA_PASSWORD}`).toString('base64')
    },
    body: {
      cmpn: {
        bscl: 1,  // [BusinessClass]		0 = ILEC, 1 = CLEC 
        svcl: 0,  //  0 = Primary Local, 1 = Primary Long Distance
        fclt: false,  // [Facilities]		true = seller is facilities based, false = seller is not facilities based
        frch: false,  // [Franchise]			true = seller has franchise agreement, false = franchise taxes do not apply to seller
        reg: true  // [Regulated]			true = seller is regulated, false = seller is not regulated
      },
      inv:  [
        {
          doc: data.taxCalcId || '',  //ID of this taxCalculation
          cmmt: data.commit || false,  //commit tax transaction
          bill: { //Billing address
            ctry: data.country, //country
            geo: false,  //Use geocode service
            int: data.incorporated !== false && data.incorporated !== 'false', // [Incorporated]	Incorporated flag for BillTo location
            addr: data.address,   //street address
            city: data.city,   //city
            st: data.state,   //state
            zip: data.zip  //zipcode
          },
          lfln: false,  //Lifeline
          cust: data.customerType || 1,   //0 = Residential, 1 = Business, 2 = Senior Citizen, 3 = Industrial
          date: data.transactionDate || new Date(),
          itms: data.items,
          /*[   //items
            {
              ref: data.sku || '',
              dbt: data.prepaid || false,
              chg: 0, //amount
              sale: 1,  // [SaleType]	0 = wholesale, 1 = retail, [SAU ONLY 2 = consumed, 3 = vendor use ]
              incl: data.taxIncluded || false,
              tran: 0,  //transaction type from tax codes
              serv: 0,  //service type from tax codes
              disc: 0,  //discount type: 0 = none, 1 = retail product (An amount subtracted from the original price to arrive at a lower price), 
                        //2 = manufacturer product (A discount of the total amount reimbursed to either the retailer or the customer by the manufacturer),
                        //3 = account level (A stand alone discount that is not applied against any service but instead as a stand alone product),
                        //4 = subsidized (A discount caused exclusively in telephone service where the telephone provider provides a service to a lifeline eligible customer. The discount will be on the local exchange service),
                        //5 = goodwill (The total discount of a service that is recorded for accounting purposes but never billed to a customer.)
            }
          ]*/
          invm: true,  //items are part of same invoice
          dtl: true,   //return tax detail for each item
          summ: true   //return summary of tax for whole invoice
        }
      ]
    },
    json: true
  };

  logger.info(func, 'avalara request', options);
  let CalculatedTax = await request(options);

  logger.info(func, 'avalara response', CalculatedTax);

  return CalculatedTax;
}

export async function CommitTax(req, taxCalcId)  {
  let func = `[${req.requestId}][${ns}][CommitTax]`;

  logger.info(func, 'begin');

  let options = {
    method: 'POST',
    uri: `${config.AVALARA_ENDPOINT}${constants.AVALARA_ENDPOINTS.COMMIT_TAX}`,
    headers:  {
      api_key: Buffer.from(`${config.AVALARA_USERNAME}:${config.AVALARA_PASSWORD}`).toString('base64')
    },
    body: {
      doc: taxCalcId, //ID of tax calculation
      cmmt: true,   //commmit this tax calculation
    },
    json: true
  };

  logger.info(func, 'request', options);

  let committedTax = await request(options);

  logger.info(func, 'response', committedTax);

  return committedTax;
}

export async function UnCommitTax(req, taxCalcId)  {
  let func = `[${req.requestId}][${ns}][UnCommitTax]`;

  logger.info(func, 'begin');

  let options = {
    method: 'POST',
    uri: `${config.AVALARA_ENDPOINT}${constants.AVALARA_ENDPOINTS.COMMIT_TAX}`,
    headers:  {
      api_key: Buffer.from(`${config.AVALARA_USERNAME}:${config.AVALARA_PASSWORD}`).toString('base64')
    },
    body: {
      doc: taxCalcId, //ID of tax calculation
      cmmt: false,   //uncommmit this tax calculation
    },
    json: true
  };

  logger.info(func, 'request', options);

  let committedTax = await request(options);

  logger.info(func, 'response', committedTax);

  return committedTax;
}

export async function ParseError(payload) {
  let func = `${ns}[ParseError]`;

  logger.info(func, 'begin');

  if (!payload || !payload.itms) {
    return new AvalaraError();
  }

  let messages = [];
  let isBillAddressError = false, isShipAddressError = false;
  const findErrors = nonBlockify((item, i) =>  {
    if (item.err) {
      for (let j in item.err) {
        if (item.err[j] && item.err[j].msg) {
          if (constants.AVALARA_ADDRESS_ERRORS.indexOf(item.err[j].msg) > -1)  {
            if (i > 0)  {
              isShipAddressError = true;
            } else {
              isBillAddressError = true;
            }
          }
          messages.push(item.err[j].msg);
        }
      }
    }
  });

  for (let i in payload.itms)  {
    let item = payload.itms[i];
    await findErrors(item, i);
  }

  if (isBillAddressError && isShipAddressError) {
    return new BillingError('Billing and Shipping address not found.', ERROR_CODES.ADDRESS_NOT_FOUND);
  } else if (isBillAddressError)  {
    return new BillingError('Billing address not found.', ERROR_CODES.BILL_ADDRESS_NOT_FOUND);
  } else if (isShipAddressError)  {
    return new BillingError('Shipping address not found.', ERROR_CODES.SHIP_ADDRESS_NOT_FOUND);
  }

  return new AvalaraError(messages);
}

class AvalaraError extends Error {
  constructor(messages)  {
    super(ERROR_CODES.AVALARA_ERROR);
    this.code = ERROR_CODES.AVALARA_ERROR;
    this.messages = messages;
  }
}