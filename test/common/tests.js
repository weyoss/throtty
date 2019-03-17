'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const uuid = require('uuid/v4');
const rateLimiter = require('../../index');


const expect = chai.expect;
chai.use(sinonChai);


async function runNTimesWithDelay(rLimiter, ns, times, delay) {
    const results = [];
    for (let i = 0; i < times; i += 1) {
        const r = await rLimiter.checkRateAsync(ns);
        results.push(r);
        const t = r.details.wait || delay;
        await Promise.delay(t);
    }
    return results;
}

module.exports = (title, params) => {
    const rLimiter = rateLimiter(params);
    title = `${title} (interval: ${params.interval}, threshold: ${params.threshold}, delay: ${params.delay})`;

    describe(title, function () {
        it('Make sure promisify is working. Expect first roll to be allowed.', async function () {
            this.timeout(100000);
            const id = uuid();
            const r = await rLimiter.checkRateAsync(id);
            expect(r.allowed).to.eq(true);
            expect(r.details.delayViolation).to.eq(false);
            expect(r.details.thresholdViolation).to.eq(false);
            expect(r.details.wait).to.eq(0);
        });

        it('Run 4 rolls with a delay of one second. Expect 4th roll to be not allowed due to threshold violation.', async function () {
            this.timeout(100000);
            const id = uuid();
            const results = await runNTimesWithDelay(rLimiter, id, 4, 1000);
            for (let i = 0; i < results.length; i += 1) {
                const r = results[i];
                if (i < 3) {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                } else {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(true);
                    expect(r.details.wait).to.be.above(0);
                }
            }
        });

        it('Run 5 rolls with a delay of one second. Expect 4th roll to be not allowed due to threshold violation and 5th roll to be allowed after waiting.', async function () {
            this.timeout(100000);
            const id = uuid();
            const results = await runNTimesWithDelay(rLimiter, id, 5, 1000);
            for (let i = 0; i < 5; i += 1) {
                const r = results[i];
                if (i < 3) {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                } else if (i === 3) {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(true);
                    expect(r.details.wait).to.be.above(0);
                } else {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                }
            }
        });

        it('Run 2 rolls with a delay of 500 ms. Expect 2nd roll to be not allowed due to delay violation.', async function () {
            this.timeout(100000);
            const id = uuid();
            const results = await runNTimesWithDelay(rLimiter, id, 2, 500);
            for (let i = 0; i < 2; i += 1) {
                const r = results[i];
                if (i === 0) {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                } else {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(true);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.be.above(0);
                }
            }
        });

        it('Run 3 rolls with a delay of 500 ms. Expect 2nd roll to be not allowed due to delay violation and 3rd roll to be allowed after waiting.', async function () {
            this.timeout(100000);
            const id = uuid();
            const results = await runNTimesWithDelay(rLimiter, id, 3, 500);
            for (let i = 0; i < 3; i += 1) {
                const r = results[i];
                if (i === 0) {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                } else if (i === 1) {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(true);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.be.above(0);
                } else {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                }
            }
        });

        it('Run 8 rolls with a delay of 500 ms. Expect both delay violations and threshold violations. Wait when required.', async function () {
            this.timeout(100000);
            const id = uuid();
            const results = await runNTimesWithDelay(rLimiter, id, 8, 500);
            for (let i = 0; i < 8; i += 1) {
                const r = results[i];
                if (i % 2 === 0) {
                    expect(r.allowed).to.eq(true);
                    expect(r.details.delayViolation).to.eq(false);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.eq(0);
                } else if (i === 5 || i === 3 || i === 7) {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(true);
                    expect(r.details.thresholdViolation).to.eq(true);
                    expect(r.details.wait).to.be.above(0);
                } else {
                    expect(r.allowed).to.eq(false);
                    expect(r.details.delayViolation).to.eq(true);
                    expect(r.details.thresholdViolation).to.eq(false);
                    expect(r.details.wait).to.be.above(0);
                }
            }
        });

        it('Run [8 rolls] x 2, each group with own namespace, in parallel, with a delay of 500 ms with different namespaces. Expect both delay violations and threshold violations. Wait when required.', async function () {
            this.timeout(100000);
            let counter = 0;
            const check = (results) => {
                for (let i = 0; i < 8; i += 1) {
                    const r = results[i];
                    if (i % 2 === 0) {
                        expect(r.allowed).to.eq(true);
                        expect(r.details.delayViolation).to.eq(false);
                        expect(r.details.thresholdViolation).to.eq(false);
                        expect(r.details.wait).to.eq(0);
                    } else if (i === 5 || i === 3 || i === 7) {
                        expect(r.allowed).to.eq(false);
                        expect(r.details.delayViolation).to.eq(true);
                        expect(r.details.thresholdViolation).to.eq(true);
                        expect(r.details.wait).to.be.above(0);
                    } else {
                        expect(r.allowed).to.eq(false);
                        expect(r.details.delayViolation).to.eq(true);
                        expect(r.details.thresholdViolation).to.eq(false);
                        expect(r.details.wait).to.be.above(0);
                    }
                }
                counter += 1;
            };
            const id = uuid();
            const r1 = runNTimesWithDelay(rLimiter, id, 8, 500);
            const anotherId = uuid();
            const r2 = runNTimesWithDelay(rLimiter, anotherId, 8, 500);
            const r = await Promise.all([r1, r2]);
            for (let i = 0; i < r.length; i += 1) {
                check(r[i]);
            }
        });
    });
};
