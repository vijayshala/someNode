/**
 * Created by patrick on 2016-12-08.
 *
 *  Would love to see analogous data views on:
 *        Total users (eventually, users by license level)
 *        Total spaces created
 *        Counts/bar graphs showing activity in spaces:
 *        chat messages sent
 *        documents shared
 *        tasks created
 *        video meetings launched
 *        integrations used (future)
 *        etc.
 *        Load on our various services (media engines, database, eventing, etc.)
 *        Top 10 "domains" or customers by activity
 */
"use strict";

import logger from '../../logger';

//var log = console.log ;//logger.info;
var logerr = logger.error;
//var StatsD = require('node-dogstatsd').StatsD;
var StatsD = require('hot-shots');


var dd_agent_config = require('./ddagent_config').dd_agent_config;
var zang_spaces_data_dict_v2 = require('./data_dict').zang_spaces_data_dict;

/*
*  tags format :
*   tags=["123123","sdfsdf"];
*   tags=["123:123","sdfs:df"]
* tags=['hosts': ['test.metric.host', 'test.tag.host'],
*         'metrics': ['test.metric.metric', 'test.tag.metric']
*        ];
 * tags=['hosts:test.metric.host',
 *         'metrics': ['test.metric.metric', 'test.tag.metric']
 *        ];
* */

//class DD_wrapper is a wrapper of datadog statsd
var DD_wrapper = function( ) {
  this.dd_agent_host = dd_agent_config["host"];
  this.dd_agent_port = dd_agent_config["port"];
  this.statsd = null;
};

DD_wrapper.prototype.create_datadog_statsd =  function(logRequestID)  {

  if(!this.statsd)
  {
    try {
      this.statsd = new StatsD(this.dd_agent_host, this.dd_agent_port);

      this.statsd.socket.on('error', this.onSocketError); //register socket error event

      if(!this.statsd){
        logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.create_datadog_statsd", "create StatsD failed"  );
      }
    }
    catch (e){
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.create_datadog_statsd","create StatsD exception : " + e.name + ", message: " + e.message    );
    }
  }

  return this.statsd;
};

DD_wrapper.prototype.onSocketError =  function(error )  {

 logger.error("Analytics:datadog:DD_wrapper.onSocketError", "Error in socket: ", error);

};


//use this one , because it has error handling
// call reportByName("zang_spaces_users_created", 1)
DD_wrapper.prototype.reportByName = function (name, value, sample_rate, tags, logRequestID) {

  try {
    var dict_val = zang_spaces_data_dict_v2[name];
    if (!dict_val) {
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.reportByName", name + " is not define in zang_spaces_data_dict");
      return;
    }
    this.report (dict_val, value, sample_rate, tags, logRequestID)
  }
  catch (e){
    logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.reportByName",  "Has exception - name: " + e.name + ", message: " + e.message  );
  }
};

//// call report( { "metric_type":"c" ,   "metric_name":"zang.spaces.users.created"         }, 1)

DD_wrapper.prototype.report_gauge = function (name, value, sample_rate, tags, logRequestID) {
  try{

    var metric_name =  name;
    if(!metric_name  )
    {
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.report", "'metric_name' is not defined in " + data_val);
      return ;
    }

    var datadog = this.create_datadog_statsd(logRequestID);
    if(!datadog)
    {
      logger.error(logRequestID||"","Analytics:datadog:DD_wrapper.report", "Failed to create datadog statsd object");
      return ;
    }

    logger.info(logRequestID||"", "Analytics:datadog:DD_wrapper.report ", "Send statsd data : name = "+ metric_name + "; value =" + value + ", tags=" + ( tags ||  "") );

    datadog.gauge(metric_name, value, sample_rate, tags);
  }
  catch (e){
    logger.error(logRequestID||"",  "Analytics:datadog:DD_wrapper.report",  "Has exception - name: " + e.name + ", message: " + e.message  );
  }
}

DD_wrapper.prototype.report = function (nameAndType, value, sample_rate, tags, logRequestID) {

  try{
    var dict_val =  nameAndType;
    if(!dict_val)
    {
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.report"," DD_wrapper : Invalid input parameter : " + nameAndType);
      return ;
    }

    var metric_type =  dict_val["metric_type"];
    var metric_name =  dict_val["metric_name"];
    if(!metric_type || !metric_name)
    {
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.report", "'metric_type' or 'metric_name' is not defined in " + data_val);
      return ;
    }

    var datadog = this.create_datadog_statsd(logRequestID);
    if(!datadog)
    {
      logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.report", "Failed to create datadog statsd object");
      return ;
    }


    logger.info(logRequestID||"", "Analytics:datadog:DD_wrapper.report", "Send statsd data : name = "+ metric_name + "; value =" + value + ", tags=" + ( tags ||  "") );

    if(metric_type == 'c' && value) {
      datadog.increment(metric_name, value, sample_rate, tags);
    }
    else if(metric_type == 'g' && value) {
      datadog.gauge(metric_name, value, sample_rate, tags);
    }
    else if(metric_type == 'h' && value) {
      datadog.histogram(metric_name, value, sample_rate, tags);
    }
    else if(metric_type == 's' && value) {
      datadog.set([metric_name], value, sample_rate, tags);//set need the name to be an array here
    }
    else if(metric_type == 'ms' && value) {
      datadog.timing(metric_name, value, sample_rate, tags);
    }

  }
  catch (e){
    logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.report",  "Has exception - name: " + e.name + ", message: " + e.message  );
  }
};


  /**
   * Send on an event
   * @param title {String} The title of the event
   * @param text {String} The description of the event.  Optional- title is used if not given.
   * @param options
   *   @option date_happened {Date} Assign a timestamp to the event. Default is now.
   *   @option hostname {String} Assign a hostname to the event.
   *   @option aggregation_key {String} Assign an aggregation key to the event, to group it with some others.
   *   @option priority {String} Can be ‘normal’ or ‘low’. Default is 'normal'.
   *   @option source_type_name {String} Assign a source type to the event.
   *   @option alert_type {String} Can be ‘error’, ‘warning’, ‘info’ or ‘success’. Default is 'info'.
   * @param tags {Array=} The Array of tags to add to metrics. Optional.
   */

DD_wrapper.prototype.reportEvent = function (title, text, options, tags, logRequestID)
{
  try {
    var datadog = this.create_datadog_statsd(logRequestID);
    if (datadog) {
      datadog.event(title, text, options, tags, function(err, bytes){
        if(err) {
          logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.reportEvent","Try to send event - has error", err);
        }
        else {
          logger.info(logRequestID||"", "Analytics:datadog:DD_wrapper.reportEvent","Sent statsd data : name = "+ title ,"  text =" + text , " tags=" , ( tags ||  "") , 'options:' ,JSON.stringify(options) );
        }
      });

    }
  }
  catch(e){
    logger.error(logRequestID||"", "Analytics:datadog:DD_wrapper.reportEvent", "Try to send event - has error", e);
  }
}

//to use : import or require this module
//refer 'data_dict.js'
// var test=new StatsD_Report_data();
//test.report(obj,1,sample,tags); //or
//test.reportByName("sss",1,sample,tags)

var   DD_wrapper_instance;
var exportMe = {
  getInstance: function() {
    return DD_wrapper_instance || (DD_wrapper_instance = new DD_wrapper());
  }
};

exports.StatsD_Report_data = exportMe;
