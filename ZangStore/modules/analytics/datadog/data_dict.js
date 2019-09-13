/**
 * Created by patrick on 2016-12-09.
 *
 * Because we are going to change the data which is going
 * to sent to datadog when the requirement changes
 * We define the data(names , types) here
 * So other file has no need to change
 *
 */

/**
 * here is about how to naming
 * Metric names
 *
 * There are a few rules to stick to when naming metrics:
 *  - Metric names must start with a letter
 *  - Can only contain ascii alphanumerics, underscore and periods (other characters will get converted to underscores)
 *  - Should not exceed 200 characters (though less than 100 is genearlly preferred from a UI perspective)
 *  - Unicode is not supported
 *  We recommend avoiding spaces
 *
 * the are following data types which can send to datagod statsd :
 * refer :  http://docs.datadoghq.com/guides/metrics/
 *
 * 1 Counters   -- c     (this will be n/(sec*flushInterval(10) , when querying the count - should x10 ) )
 * 2 Gauges     -- g
 * 3 Histograms -- h
 * 4 Sets       -- s
 * 5 Timing     -- ms
 *
 *  6 event     --e //self defined type
 *
 */

"use strict";

var zang_office_send_to_datadog_data_dict = {
  "zang_office_accounts":           { "metric_type":"g" ,   "metric_name":"zang.office.accounts"        },
  "zang_office_basicUsers":         { "metric_type":"g" ,   "metric_name":"zang.office.basicUsers"      },
  "zang_office_standardUsers":      { "metric_type":"g" ,   "metric_name":"zang.office.standardUsers"   },
  "zang_office_powerUsers":         { "metric_type":"g" ,   "metric_name":"zang.office.powerUsers"      },
  "zang_office_devices":            { "metric_type":"g" ,   "metric_name":"zang.office.devices"         },
  "zang_office_freeLocalDIDs":      { "metric_type":"g" ,   "metric_name":"zang.office.freeLocalDIDs"   },
  "zang_office_tollFreeDIDs":       { "metric_type":"g" ,   "metric_name":"zang.office.tollFreeDIDs"    },

  "zang_office_fmfm_feature":       { "metric_type":"g" ,   "metric_name":"zang.office.fmfm.feature"      },
  "zang_office_hotdesking_feature": { "metric_type":"g" ,   "metric_name":"zang.office.hotdesking.feature"},

  //please continue
};

var zang_office_statsd_metric_name_prefix = "zang.office."

var zang_office_statsd_tags_prefix=
{
  "accountName" : "accountName:",
  "accountId" : "accountId:",

  //to add more for naming normalizition in the project
};

/* event 'zang.office.accountCreated'
Datadogstatsd::event('Account created for Don\'s Company', array(
        'alert_type' => 'info',
    'aggregation_key' => 'zang.office.accountCreated'
));

Datadogstatsd::event('Account created for Ed\'s Company', array(
        'alert_type' => 'info',
    'aggregation_key' => 'zang.office.accountCreated

*/

exports.zang_office_statsd_tags_prefix =  zang_office_statsd_tags_prefix;
exports.zang_office_data_dict =  zang_office_send_to_datadog_data_dict;
exports.zang_office_statsd_metric_name_prefix = zang_office_statsd_metric_name_prefix;
