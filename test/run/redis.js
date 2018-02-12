'use strict';

const sinon = require('sinon');
const redis = require('redis');
const rateLimiter = require('../../index');
const config = require('../common/config');
const commonTests = require('../common/tests');

const client = redis.createClient(config.redis);

beforeEach(function (done) {
    client.flushall(function (err) {
        if (err) done(err);
        else done();
    });
});

const params = {
    interval: 10000, // 10 seconds
    threshold: 3,
    delay: 1000, // 1 second
    redis: client,
    promisify: true,
};

const rLimiter = rateLimiter(Object.assign({}, params));
commonTests(`Redis rate limiter tests [interval: ${params.interval}, threshold: ${params.threshold}, delay: ${params.delay}]:`, rLimiter);