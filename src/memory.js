'use strict';

const RateLimiter = require('./rate-limiter');


class InMemoryRateLimiter extends RateLimiter {
    /**
     *
     * @param {object} options
     * @param {number} options.interval in ms
     * @param {number} options.threshold
     * @param {number} options.delay in ms
     * @constructor
     */
    constructor(options) {
        super(options);
        this.rolls = {};
        this.timers = {};
    }

    /**
     *
     * @param {string} context
     * @param {number} now
     * @param {function} cb
     */
    touchRolls(context, now, cb) {
        this.clearTimeout(context);
        const from = now - this.interval;
        this.rolls[context] = this.rolls[context] || [];
        this.rolls[context] = this.rolls[context].filter(timestamp => timestamp > from);
        this.rolls[context].push(now);
        this.timers[context] = setTimeout(() => this.reset(context), this.interval / 1000);
        cb(null, this.rolls[context]);
    }

    /**
     *
     * @param {string} context
     */
    clearTimeout(context) {
        clearTimeout(this.timers[context]);
        delete this.timers[context];
    }

    /**
     *
     * @param {string} context
     */
    reset(context) {
        this.clearTimeout(context);
        delete this.rolls[context];
    }
}

module.exports = InMemoryRateLimiter;
