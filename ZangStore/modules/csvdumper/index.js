import debugmodule from 'debug'
import logger from '../logger'
import mongoose from 'mongoose';
import csvWriter from 'csv-write-stream'
import fs from 'fs'
import stream from 'stream';
import uuidv4 from 'uuid/v4'; 

const Schema = mongoose.Schema;


var debug = debugmodule('mongtocsv');

function prepare_filestreams(folder, headerObj, csvWriters){
  let funcName = '[prepare_filestreams] '
  let headersInCsv = [];
  if ('_id' in headerObj.headers){
    headersInCsv.push('_id')
  }
  if ('_ext_id' in headerObj.headers){
    headersInCsv.push('_ext_id')
  }
  for (let item in headerObj.headers){
    if (item == '_id' || item =='_ext_id'){
      continue
    }
    if (headerObj.headers[item] instanceof Object && 'headers' in headerObj.headers[item]){
      prepare_filestreams(folder, headerObj.headers[item], csvWriters);
    }
    else{
      if (headerObj.ignore_property.indexOf(item) >= 0){
        continue;
      }
      headersInCsv.push(item);
    }    
  }
  debug(funcName + `Create file ${folder + headerObj.filestream +'.csv'} with headers ${headersInCsv}`)
  let csvstream = new csvWriter({headers: headersInCsv});
  csvstream.pipe(fs.createWriteStream(folder + headerObj.filestream + '.csv'));
  headerObj.csvstream = csvstream;
  csvWriters.push(csvstream);
}

function getPropertyValue(propertyname, properttype, null_undefined_map, docObj){
  let funcName = '[getPropertyValue] '
  let propertynamelist = propertyname.split('.');
  if (!(docObj instanceof Object) && propertynamelist.length==1){
    if (properttype == 'Date'){
      return docObj.toISOString()
    }
    else{      
      return docObj.toString()      
    }
  }
  for (let idx = 0; idx < propertynamelist.length; idx++){
    let item = propertynamelist[idx];
    debug(funcName + `Try to get value of ${item}, ${propertyname}`)
    let parentDocObj = docObj;
    docObj = docObj[item];
    if (docObj===undefined || docObj===null){
      if (null_undefined_map == 'null_undefined_get_from_parent' && idx >= propertynamelist.length - 1 && !(parentDocObj instanceof Object)){
        if (properttype == 'Date'){
          return parentDocObj.toISOString()
        }
        else{      
          return parentDocObj.toString()      
        }
      }
      return '';      
    }
    else{
      if (idx >= propertynamelist.length - 1){
        if (properttype == 'Date'){
          return docObj.toISOString()
        }
        else{
          return docObj.toString()
        }
      }
    }
  }
}

function getSubdocs(propertyname, docObj){
  let funcName = '[getSubdocs] '
  let propertynamelist = propertyname.split('.');
  for (let idx = 0; idx < propertynamelist.length; idx++){
    let item = propertynamelist[idx];
    docObj = docObj[item];
    if (idx >= propertynamelist.length - 1){
      return docObj;
    }
    else{
      if (docObj===undefined || docObj==null){
        return undefined
      }
    }
  }
}

function writeADoc(headerObj, docObj, _ext_id){
  let funcName = '[writeADoc] '
  let outputdata = {'_ext_id': _ext_id};
  if ('_id' in headerObj.headers){
    if (docObj._id && docObj._id.toString()){
      outputdata['_id'] = docObj._id.toString()
    }
    else{
      let value = uuidv4()
      outputdata['_id'] = value
    }
  }
  for (let item in headerObj.headers){
    if (item == '_ext_id' || item=='_id'){
      continue;
    }
    if (headerObj.headers[item] instanceof Object && 'headers' in headerObj.headers[item]){
      debug(funcName + `The item ${item} is array of subdoc.`);
      let subdocs = getSubdocs(item, docObj);      
      
      if (subdocs && Array.isArray(subdocs)){
        for (let subdoc of subdocs){
          debug(funcName + `There exists subdoc in the array of subdoc`);          
          writeADoc(headerObj.headers[item], subdoc, outputdata['_id']);
        }
      }
      else{
        logger.warn(funcName + 'Although this is array in headers, but the data looks like not!!')
      }
    }
    else{      
      let null_undefined_map = null;
      if (item in headerObj.null_undefined_maps){
        null_undefined_map = headerObj.null_undefined_maps[item];
      }
      let value = getPropertyValue(item, headerObj.headers[item], null_undefined_map, docObj);
      if (value){
        debug(funcName + `Write item ${item} with value ${value}`)
        outputdata[item] = value;
      }
      else{        
        debug(funcName + `The item ${item} no value ignored!!!`)        
      }
    }
  }
  headerObj.csvstream.write(outputdata)
}

class esCsvWriter extends stream.Writable{
  constructor (folder, headers, tablename, options){
    let optionsin = options || {};
    optionsin.decodeStrings = false;
    optionsin.objectMode = true;
    super(optionsin)
    this.folder = folder;
    this.headers = headers;
    this.csvWriters = [];
    this.tablename = tablename
    prepare_filestreams(folder, headers, this.csvWriters);
  }

  _write(chunk, encoding, callback) {
    writeADoc(this.headers, chunk, '');  
    return callback();      
  }
  
  _final(callback){
    let funcName = '[esCsvWriter.end] '
    for (let item of this.csvWriters){
      item.end();
    }    
    logger.info(funcName + `Finish dump the table ${this.tablename}`);
    return callback();
  }
}

function mongooseToCsvPlg(schema, options){
  //This is mongoose plugin which dumps mongodb data to csv file
  var funcName = '[mongooseToCsvPlg] '
  let res = parseSchema(schema, options);
  logger.info(funcName + `Create file with filename ${JSON.stringify(res)}`)
  
  

  schema.static('csvReadStream', function(folder, docs){
    let csvWriters = [];
    prepare_filestreams(folder, res, csvWriters);

    for (let item of docs){
      writeADoc(res, item, '');
    }
    for (let item of csvWriters){
      item.end();
    }
    debug('Finish writing the docs')
  })
  
  schema.static('csvReadStream2', function(folder, tablename){
    let csvwriter =  new esCsvWriter(folder, res, tablename);    
    return csvwriter;
  })
}

function parseArraySchemaType(pathname, schemaType, options)
{
  var funcName = '[parseArraySchemaType] ';
  pathname = pathname.split('.');
  pathname = pathname[pathname.length - 1]
  debug(funcName + `Get ${pathname} instance ${schemaType.caster.instance}`)
  logger.info(funcName + `Create file with filename ${options.file}`)
  let filestream = options.file;
  let headers = {'_ext_id': 'String'};
  headers[pathname] =  schemaType.caster.instance;
  let null_undefined_maps = options.null_undefined_maps;
  let ignore_property = options.ignore_property;
  return {filestream: filestream, headers: headers, null_undefined_maps: null_undefined_maps, ignore_property: ignore_property};
}

function parseSchema(schema,  options){
  var funcName = '[parseSchema] ';
  let filestream = null;
  if (!options.no_file_create){
    debug(funcName + `Begin to parse schema ${options.file}`)
    logger.info(funcName + `Create file with filename ${options.file}`) 
    filestream = options.file;
  }
  let headers = {};
  let null_undefined_maps = {}
  let ignore_property = []
  if (options._ext_id){
    headers['_ext_id'] = 'String';
  }
  schema.eachPath((pathname, schemaType)=>{
    if(options.no_id && pathname == '_id'){
      return;
    }
    debug(funcName + `get path ${pathname}, ${schemaType.instance}`)
    let innerOptions = {file: options.file + '.' + pathname}
    if (schemaType.instance == 'Array'){
      if (schemaType.schema){
        let new_mixed_unkown_property = {}
        let new_null_undefined_maps = {}
        let new_ignore_property = []
        if (options.mixed_unkown_property){
          for (let mixed_unkown_property_item in options.mixed_unkown_property){
            if (mixed_unkown_property_item.startsWith(pathname + '.')){
              new_mixed_unkown_property[mixed_unkown_property_item.substring((pathname + '.').length)] = options.mixed_unkown_property[mixed_unkown_property_item];
            }            
          }
        }
        if (options.null_undefined_maps){
          for (let null_undefined_maps_item in options.null_undefined_maps){
            if (null_undefined_maps_item.startsWith(pathname + '.')){
              new_null_undefined_maps[null_undefined_maps_item.substring((pathname + '.').length)] = options.null_undefined_maps[null_undefined_maps_item];              
            }
          }
        }

        if (options.ignore_property){
          for (let new_ignore_property_item of options.ignore_property){
            if (new_ignore_property_item.startsWith(pathname + '.')){
              new_ignore_property.push(new_ignore_property_item.substring((pathname + '.').length))
            }
          }
        }

        innerOptions['mixed_unkown_property'] = new_mixed_unkown_property;
        innerOptions['null_undefined_maps'] = new_null_undefined_maps;
        innerOptions['ignore_property'] = new_ignore_property;
        innerOptions['_ext_id'] = true
        let res = parseSchema(schemaType.schema, innerOptions);
        headers[pathname] = res;        
      }
      else{
        if (schemaType.caster.instance){
          let new_null_undefined_maps = {}          
          if (options.null_undefined_maps && pathname in options.null_undefined_maps){
            new_null_undefined_maps[pathname] = options.null_undefined_maps[pathname];
          }
          innerOptions.null_undefined_maps = new_null_undefined_maps;

          let new_ignore_property = [] 
          if (options.ignore_property && options.ignore_property.indexOf(pathname)>=0){
            new_ignore_property.push(pathname);
          }
          innerOptions.ignore_property = new_ignore_property;
          let res = parseArraySchemaType(pathname, schemaType, innerOptions);
          headers[pathname] = res;               
        }
        else{
          throw funcName + `Can not parse the path ${pathname}`
        }
      }
    }
    else if (schemaType.instance == 'Mixed'){
      if (pathname in options.mixed_unkown_property){            
        let temp_schema = options.mixed_unkown_property[pathname];
        if (!(temp_schema instanceof Schema)){
          if (Object.keys(temp_schema).length > 0){              
            temp_schema = new Schema(temp_schema)
          }
          else{
            logger.warn(funcName + `Can not parse the Mixed path ${pathname}, and ignore it!`);
            return;
          }
        }        
        let inneroptions = {
          file: options.file + '.' + pathname, 'no_file_create': true, 'no_id': true
        }
        let new_null_undefined_maps = {}
        if (options.null_undefined_maps){
          for (let item in options.null_undefined_maps){
            if (item.startsWith(pathname + '.')){
              new_null_undefined_maps[item.substring((pathname + '.').length)] = options.null_undefined_maps[item]
            }
          }
        }
        inneroptions.null_undefined_maps = new_null_undefined_maps;

        let new_ignore_property = [];
        if (options.ignore_property){
          for (let item of options.ignore_property){
            if (item.startsWith(pathname + '.')){
              new_ignore_property.push(item.substring((pathname + '.').length))
            }
          }
        }
        inneroptions.ignore_property = new_ignore_property

        let res = parseSchema(temp_schema, inneroptions);
        for (let key in res.headers){
          headers[pathname +'.' + key] = res.headers[key];
        }
        
        for (let key in res.null_undefined_maps){
          null_undefined_maps[pathname +'.' + key] = res.null_undefined_maps[key];
        }

        for (let item of res.ignore_property){
          ignore_property.push(pathname + '.' + item);
        }
      }
      else{
        throw funcName + `Can not parse the Mixed path ${pathname}. You can add ${pathname} in mixed_unkown_property with {} to ignore it!`
      }
    }
    else{
      headers[pathname] = schemaType.instance;
      if (options.null_undefined_maps && pathname in options.null_undefined_maps){
        null_undefined_maps[pathname] = options.null_undefined_maps[pathname];
      }

      if (options.ignore_property && options.ignore_property.indexOf(pathname) >= 0){
        ignore_property.push(pathname)
      }
    }
  });
  return {filestream: filestream, headers: headers, null_undefined_maps:null_undefined_maps, ignore_property: ignore_property};
}

module.exports = mongooseToCsvPlg
