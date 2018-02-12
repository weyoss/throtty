'use strict';

const microtime = require('microtime');

class RateLimiter {
    /**
     *
     * @param {object} options
     * @param {number} options.interval in ms
     * @param {number} options.threshold
     * @param {number} options.delay in ms
     * @constructor
     */
    constructor(options) {
        const { interval, threshold, delay } = options;
        if (interval !== parseInt(interval, 10) || interval <= 0) {
            throw new Error('Interval must be a positive integer');
        }
        if (threshold !== parseInt(threshold, 10) || threshold <= 0) {
            throw new Error('Threshold must be a positive integer');
        }
        if (delay !== parseInt(delay, 10) || delay < 0) {
            throw new Error('Delay must be a an integer >= 0');
        }
        this.interval = interval * 1000;
        this.delay = delay * 1000;
        this.threshold = threshold;
    }

    /**
     *
     * @param {string} context
     * @param {number} now
     * @param {function} cb
     */
    touchRolls(context, now, cb) {
        /* eslint  class-methods-use-this: 0 */
        throw new Error('Method Not Implemented');
    }

    /**
     *
     * @param {string} context
     * @param {function} cb
     */
    checkRate(context, cb) {
        const now = microtime.now();
        this.touchRolls(context, now, (err, rolls) => {
            if (err) cb(err);
            else {
                const thresholdViolation = rolls.length > this.threshold;
                const elapsedTime = rolls.length > 1 ? now - rolls[rolls.length - 2] : -1;
                const delayViolation = !!(this.delay && elapsedTime > -1 && elapsedTime < this.delay);
                const t1 = thresholdViolation ? (rolls[rolls.length - this.threshold] + this.interval) - now : 0;
                const t2 = delayViolation ? this.delay : 0;
                const wait = Math.ceil(Math.max(t1, t2) / 1000);
                cb(null, {
                    allowed: !(thresholdViolation || delayViolation),
                    details: {
                        wait,
                        thresholdViolation,
                        delayViolation,
                        rolls: rolls.length,
                        remaining: Math.max(0, this.threshold - rolls.length),
                    },
                });
            }
        });
    }
}

module.exports = RateLimiter;
