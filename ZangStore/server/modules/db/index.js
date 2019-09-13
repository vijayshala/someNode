const logger = require('applogger');
const {
  NotFoundError,
  DBError,
  // DBErrorDuplicateKey
} = require('../error');

class DbBase {
  constructor(schema, options) {
    this.ns = '[DbBase]';

    this.schema = schema;
    this.options = Object.assign({
      enableCache: false,
    }, options);
  }

  async findOne(query, options) {
    let _this = this;
    const func = '[findOne]';
    options = Object.assign({
      ignoreNotFoundError: false,
    }, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;

    logger.debug(fn, 'query', JSON.stringify(query));
    const projection = options.projection;
    let doc;
    try {
      let dbq = _this.schema.findOne(query, projection);
      if (options.select) {
        dbq = dbq.select(options.select);
      }
      if (options.sort) {
        dbq = dbq.sort(options.sort);
      }
      if (options.populate) {
        for (let prop of options.populate) {
          dbq = dbq.populate(prop);
        }
      }
      doc = await await dbq.lean();
    } catch (err) {
      logger.error(fn, 'database error', err);
      throw new DBError();
    }

    if (!doc && !options.ignoreNotFoundError) {
      throw new NotFoundError();
    }

    return doc;
  }

  async findOneById(id, options) {
    return await this.findOneBy('_id', id, options);
  }

  async findOneBy(field, value, options) {
    let query = {};
    query[field] = value;
    return await this.findOne(query, options);
  }

  async find(query, options) {
    let _this = this;
    const func = '[find]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;

    logger.debug(fn, 'query', JSON.stringify(query));

    let dbq = _this.schema.find(query);
    if (options.select) {
      dbq = dbq.select(options.select);
    }
    
    if (options.sort) {
      dbq = dbq.sort(options.sort);
    }

    if (options.size) {
      dbq = dbq.limit(options.size);
    }

    if (options.page) {
      let size = options.size || 30;
      dbq = dbq.skip(size*(options.page-1));
    }

    if (options.populate) {
      for (let prop of options.populate) {
        dbq = dbq.populate(prop);
      }
    }
    let docs = await dbq.lean();

    return docs;
  }

  async findOneAndUpdate(query, doc, options) {
    let _this = this;
    const func = '[findOneAndUpdate]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;

    logger.debug(fn, 'query', JSON.stringify(query));
    logger.debug(fn, 'doc', JSON.stringify(doc));

    return await _this.schema.findOneAndUpdate(query, doc, options);
  }

  async create(doc, options) {
    let _this = this;
    const func = '[create]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;
    if(!doc.updated){
      doc.updated = {}
    }
    doc.updated.on = (new Date).toISOString();

    logger.debug(fn, 'doc', JSON.stringify(doc));

    return await _this.schema.create(doc);
  }

  async remove(query, options) {
    let _this = this;
    const func = '[remove]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;

    logger.debug(fn, 'query', JSON.stringify(query));

    return await _this.schema.remove(query);
  }

  async aggregate(operation, options) {
    let _this = this;
    const func = '[aggregate]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;

    logger.debug(fn, 'operation', JSON.stringify(operation));

    let dbq = _this.schema.aggregate(operation);

    dbq.options = options;

    let result = await dbq.exec();

    return result;
  }

  async update(query, update, options)  {
    let _this = this;
    const func = '[update]';
    options = Object.assign({}, options);

    const reqId = (options && options.requestId && `[${options.requestId}]`) || '';
    const fn = `${reqId}${_this.ns}${func}`;
    
    if(!update.updated) {
      update.updated = {};
    }
    update.updated.on = (new Date()).toISOString();

    console.log("UPDATED: ", query,  update);

    logger.debug(fn, 'query', JSON.stringify(query), 'update', JSON.stringify(update));

    let dbq = _this.schema.update(query, update, options);

    let result = await dbq.exec();

    return result;
  }
}

module.exports = {
  DbBase,
};
