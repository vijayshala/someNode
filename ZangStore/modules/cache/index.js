var LRU = require('lru-cache');

var jwtPublicKeyCache = LRU({max: 100000, maxAge: 86400000});
export default {jwtPublicKeyCache};