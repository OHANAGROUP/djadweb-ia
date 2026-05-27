const NodeCache = require('node-cache');

// TTL de 1 hora — suficiente para no saturar PJUD, fresco para el usuario
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

function cacheKey(params) {
  return JSON.stringify(params);
}

function get(params) {
  return cache.get(cacheKey(params));
}

function set(params, data, ttl) {
  if (ttl !== undefined) {
    cache.set(cacheKey(params), data, ttl);
  } else {
    cache.set(cacheKey(params), data);
  }
}

function stats() {
  return cache.getStats();
}

module.exports = { get, set, stats };
