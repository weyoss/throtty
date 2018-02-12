'use strict';

const RateLimiter = require('./rate-limiter');


class RedisRateLimiter extends RateLimiter {
    /**
     *
     * @param {object} options
     * @param {number} options.interval in ms
     * @param {number} options.threshold
     * @param {number} options.delay in ms
     * @param {object} options.redis
     * @constructor
     */
    constructor(options) {
        super(options);
        if (!options.hasOwnProperty('redis')) throw new Error('options.redis parameter is required');
        if (typeof options.redis !== 'object' || options.redis.constructor.name !== 'RedisClient') {
            throw new Error('options.redis must be an instance of RedisClient');
        }
        this.redis = options.redis;
    }

    /**
     *
     * @param {string} context
     * @param {number} now
     * @param {function} cb
     */
    touchRolls(context, now, cb) {
        const scoreMax = now - this.interval;
        const multi = this.redis.multi();
        const key = `rate-limiter-${context}`;
        multi.zremrangebyscore(key, '-inf', scoreMax);
        multi.zadd(key, now, now);
        multi.zrange(key, 0, -1);
        multi.pexpire(key, this.interval / 1000);
        multi.exec((err, results) => {
            if (err) cb(err);
            else cb(null, results[2].map(Number));
        });
    }
}

module.exports = RedisRateLimiter;
