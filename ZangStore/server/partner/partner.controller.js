const ns = '[partner.controller]';
import logger from 'applogger';
const { QuoteBackend } = require('../quote/quote.backend');
const { PartnerBackend } = require('./partner.backend');
import { UnauthorizedError } from '../modules/error';
import { createPaginationByPage } from '../utils/serverHelper';
import config from '../../config';
var ObjectId = require('mongodb').ObjectId;

export const getPartnerQuotes = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getPartnerQuotes]`;
  const partnerId = req.params.partnerId;
  const size = req.query && req.query.size || 30;
  const page = req.query && req.query.page || 1;

  try {
    let quotes = await QuoteBackend.find({ partner: ObjectId(partnerId) }, { size, page });
    logger.info(fn, 'quote:', quotes);
    res.status(200).json({
      error: false,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerAgentQuotes = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getPartnerAgentQuotes]`;
  const partnerId = req.params.partnerId;
  const partnerAgentId = req.params.partnerAgentId;
  logger.info(fn, 'quote:', req.params, 'query', req.query);
  const size = req.query && Number(req.query.size) || 30;
  const page = req.query && Number(req.query.page) || 1;
  try {

    let quotes = await QuoteBackend.find({ partner: ObjectId(partnerId), partnerAgent: ObjectId(partnerAgentId) }, { size, page });
    // logger.info(fn, 'quote:', quotes);
    let response = createPaginationByPage(req, {
      results: { results: quotes },
      queryData: { page, size }
    })
    response.error = false;
    res.status(200).json(response);
  } catch (error) {
    logger.info(fn, error);
    next(error);
  }
};

export async function searchPartners(req, res, next) {
  const fn = `[${req.requestId}]${ns}[searchPartners]`;
  const escapeStringRegexp = require('escape-string-regexp');
  const { PartnerBackend } = require('./partner.backend');
  const Utils = require('../../common/Utils');

  const search = escapeStringRegexp(req.query.search);
  const region = req.query.region;

  const options = {
    requestId: req.requestId
  };

  if (!search || search.length < 3) {
    return res.status(400).json({
      error: true,
      data: []
    });
  }

  try {
    const partners = await PartnerBackend.searchPartners(search, {
      ...options,
      region: region,
      limit: 5,
      select: {
        'fields.companyName': 1,
        type: 1
      }
    });

    let projectPartners = partners.map(one => {
      return {
        id: one._id,
        type: Utils.resolvePartnerType(req.localizer, one.type),
        text: one.fields && one.fields.companyName
      };
    });

    logger.info(fn, 'projected:', projectPartners);

    res.status(200).json({
      error: false,
      data: projectPartners
    });
  } catch (err) {
    logger.error(fn, 'Error:', err);
    res.status(400).json({
      error: true,
      data: []
    });
  }
}
