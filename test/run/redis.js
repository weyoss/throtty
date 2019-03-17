'use strict';

const sinon = require('sinon');
const redis = require('redis');
const config = require('../common/config');
const commonTests = require('../common/tests');

const client = redis.createClient(config.redis);

beforeEach(function (done) {
    client.flushall(function (err) {
        if (err) done(err);
        else done();
    });
});

after(function (done) {
    client.end(true);
    done();
});

const params = {
    interval: 10000, // 10 seconds
    threshold: 3,
    delay: 1000, // 1 second
    promisify: true,
    redis: client,
};

commonTests('Redis rate limiter', params);
