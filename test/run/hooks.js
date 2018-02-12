'use strict';

const sinon = require('sinon');

function runNTimesWithDelay(rLimiter, ns, times, delay, cb) {
    const results = [];
    const run = (i = 0) => {
        rLimiter.checkRate(ns, (err, r) => {
            if (err) done(err);
            else {
                results.push(r);
                i += 1;
                if (i < times) {
                    const t = r.details.wait ? r.details.wait : delay;
                    setTimeout(() => run(i), t);
                } else cb(null, results);
            }
        });
    };
    run();
}

before(function (done) {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.runNTimesWithDelay = runNTimesWithDelay;
    done();
});

beforeEach(function (done) {
    this.sandbox.restore();
    done();
});