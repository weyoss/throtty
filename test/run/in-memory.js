'use strict';

const sinon = require('sinon');
const rateLimiter = require('../../index');
const commonTests = require('../common/tests');

const params = {
    interval: 10000, // 10 seconds
    threshold: 3,
    delay: 1000, // 1 second
    promisify: true,
};

const rLimiter = rateLimiter(Object.assign({}, params));
commonTests(`In-memory rate limiter tests [interval: ${params.interval}, threshold: ${params.threshold}, delay: ${params.delay}]:`, rLimiter);