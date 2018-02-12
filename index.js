'use strict';

const InMemoryRateLimiter = require('./src/memory');
const RedisRateLimiter = require('./src/redis');

/**
 *
 * @param {object} options
 * @param {number} options.interval in ms
 * @param {number} options.threshold
 * @param {number} options.delay in ms
 * @param {object} options.redis
 * @returns {*}
 */
function throtty(options) {
    if (options.hasOwnProperty('redis')) return new RedisRateLimiter(options);
    return new InMemoryRateLimiter(options);
}

module.exports = throtty;
