/**
 * Created by andreasi on 11/6/2015.
 */

module.exports =  {
  $is: function(v, objectType){
    "use strict";
    return Object.prototype.toString.call(v) === "[object " + objectType + "]";
  },
  $array: function(v){
    "use strict";
    return this.$is(v, "Array");
  },
  $object: function(v){
    "use strict";
    return this.$is(v, "Object");
  },
  $function: function(v){
    "use strict";
    return this.$is(v, "Function");
  },
  $number: function(v){
    "use strict";
    return this.$is(v, "Number");
  },
  $boolean: function(v){
    "use strict";
    return this.$is(v, "Boolean");
  },
  $string: function(v){
    "use strict";
    return this.$is(v, "String");
  },
  $email: function(v){
    "use strict";
    let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(v);
  },
  $url: function(v, pureLink){
    if(pureLink && v && ((v.indexOf('http://') > 0) || (v.indexOf('https://') > 0)) //not pure link, link is within a text content
    ){
      return false;
    }
    return /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/.test(v);
  },
	$blob: function (v) {
		return v.indexOf('blob:') > -1;
	},
  $firefox: function(){
    "use strict";
    return navigator.mozGetUserMedia;
  },
  $chrome: function(){
    "use strict";
    return navigator.webkitGetUserMedia;
  },
  $empty: function(v){
    return v === undefined || v === "" || (this.$array(v) && v.length === 0);
  },
  $imageMime: function(mime){
    if(mime.indexOf('image')>=0){ //return (mime=='image/jpeg' || mime=='image/png');
      return true;
    }
    return false;
  },
  $videoMime: function(mime){
    if(mime.indexOf('video')>=0){ //return (mime=='image/jpeg' || mime=='image/png');
      return true;
    }
    return false;
  }
};
