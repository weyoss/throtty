'use strict';

const bluebird = require('bluebird');
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
    const RateLimiter = options.hasOwnProperty('redis') ? RedisRateLimiter : InMemoryRateLimiter;
    if (options.hasOwnProperty('promisify') && options.promisify === true) bluebird.promisifyAll(RateLimiter.prototype);
    return new RateLimiter(options);
}

module.exports = throtty;
