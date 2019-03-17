'use strict';

const sinon = require('sinon');
const commonTests = require('../common/tests');

const params = {
    interval: 10000, // 10 seconds
    threshold: 3,
    delay: 1000, // 1 second
    promisify: true,
};

commonTests('In-memory rate limiter', params);
