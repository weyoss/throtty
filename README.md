# Throtty - Yet another rolling window rate limiter

Throtty is an efficient rate limiter for Node.js. Useful when you need to rate limit/throttle 
API clients or any other task that need to be rate limited. Can be used in standalone mode using in-memory storage or
backed by a Redis server.

# Features

* Based on rolling windows with minimum delay between successive requests.
* Atomic. When backed by redis, atomicity is guaranteed with the help of transactions.
* Concurrency proof. When backed by redis, `Throtty` can handle multiple requests which can be performed in parallel.
* Distributed. When backed by redis, multiple `Throtty` instances can be run from different hosts. 

# Installation

```text
npm install throtty --save
```

# Usage

````javascript
const throtty = require('throtty');
const redisClient = require('redis').createClient();

const rateLimiter = throtty({
    interval: 10000, // Required. Rolling windows in milliseconds.
    threshold: 3, // Required. How many times per rolling window?
    delay: 1000, // Required. Minimum delay between two successive requests in milliseconds.
    redis: redisClient // Optional. Redis client. If not provided In-memory storage is used. 
});

rateLimiter.checkRate('user-1234-some-action', function(err, res) {
    if (err) {
        // handle error
        
    }  else {
        if (res.allowed) {
            // accepted request
            
        } else {
            // reject request
            
        }
    }
})
````

## Advanced usage

```javascript
rateLimiter.checkRate('user-1234-some-action', function(err, res) {
    
    // error handling
    // ...
        
    const allowed = res.allowed; // Boolean. True when allowed otherwise false.
    const { 
        wait, // Number. Time to wait in milliseconds before performing a new request. 
        thresholdViolation, // Boolean. Whether or not the current request was rejected because of threshold violation.
        delayViolation, // Boolean. Whether or not the current request was rejected because of delay violation.
        rolls, // Number. How many requests has been performed so far.
        remaining, // Number. How many remaining requests do we have?
    } = res.details;
    
})
````

# The algorithm

Let's suppose we want to limit API requests on some busy service or maybe to rate limit user requests for some specific
end-points. For example we want to limit API requests to our service like 1000 per user (token) each hour.

The rolling/sliding window in our case is one hour.

```text

-------------|--|------|------|-|----|----------|-----|--------|--------  Time
             ^
             request                  

                           |<--------------------------------->|
                                 Rolling window == 1 hour

```

```javascript
const interval = 60 * 60 * 1000000; // One hour in microseconds (rolling window)
const threshold = 1000;
```

To track the number of user's requests performed in the last hour from NOW, we need to remember the timestamp of each 
 request.

```javascript
const rolls = {}; // storage of user's timestamps
```

Each time when a user performs a request, we save the request timestamp first. Request timestamps are saved in an 
ordered list (array).

```javascript
const now = microtime.now(); // time in microseconds
const key = 'user-2345-some-action';
rolls[key] = rolls[key] || [];
rolls[key].push(now);
```

To get the count of user requests in the last hour:

```javascript
const from = now - interval;
rolls[key] = rolls[key].filter(timestamp => timestamp > from);
const count = rolls[key].length; 
```

From this point we can check if the count of the user's requests in the last hour exceeds maximum allowed 
requests per hour and based on that we can accept/reject the request. 

```javascript
const thresholdExceeded = count > threshold;
```

This should give you a basic idea about the algorithm being implemented by this package. 

# Considerations

Because of the limitation of the Javascript engine, setTimeout, setInterval and other timers are allowed to lag 
arbitrarily and are not guaranteed to run at exact time. They tend to drift and delays due to CPU load are expected to 
happen. 

Considering that sometimes even when the rate limiter asks to wait for certain amount of time, it is not 
guaranteed that this timing will be fulfilled. Therefore `details.wait` provided by this package in callbacks can be 
considered only as an estimation and can not be exact.

# Contributing

So you are interested in contributing to this project? Please see [CONTRIBUTING.md](https://github.com/weyoss/guidelines/blob/master/CONTRIBUTIONS.md).

# License

[MIT](https://github.com/weyoss/throtty/blob/master/LICENSE)                

