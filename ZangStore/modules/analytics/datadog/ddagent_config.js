/**
 * Created by patrick on 2016-12-09.
 *
 * Dadadog agent may runs in
 *  1 localhost
 *  2 other VM
 *  3 in the kubernetes pod(s)
 *
 *  This file will provide where is Dadadog agent
 *
 *  Client can just change config in this file ,
 *
 *  so that other files have no need to change if the Dadadog agent location changes
 */

"use strict";
var dd_agent_config ={

  /** run on localhost
  "host" : "localhost",
  "port" : 8125,
  */

  // this the dd-agent's UDP port number,
  // please make sure whiich port dd-agent is using
  // refer : http://docs.datadoghq.com/guides/basic_agent_usage/osx/
  // On Windows, the port might be 8126

  /* run on other machine

   "host" : "1.2.3.4",  //give the correct mahine DNS name or IP address
   "port" : 8125,     // this the dd-agent's udp port number, please make sure whiich port dd-agent is using

   */


  /*  run on Kubernetes pod(s) -- we need to know the 'service' name of dd-agent ' pod*/
   //dd-agent is insatll in the namespace of "datadog-agent-ns"
   //if the caller pod is not in the same namespace, it should use the full name
   //"host" : "dd-agent",  // "dd-agent.datadog-agent-ns.svc.cluster.local"   -- 'dd-agent' is the 'service' name of dd-agent ' pod
    "host"  : "dd-agent.datadog-agent-ns.svc.cluster.local",
   "port" : 8125,      // this the dd-agent's udp port number


  "dummy":""
};

exports.dd_agent_config = dd_agent_config;
