import path from 'path';
import EventEmitter from 'events';
import express from 'express';
import bodyParser from 'body-parser';
import glob from 'glob';
import logger from './lib/logger';
import config from './config.js'

import './lib/rest-api';

// GitHub Webhooks events wrapper.
// @see https://developer.github.com/webhooks
var payloadEmitter = new EventEmitter();
for (let file of glob.sync('./lib/actions/*.js')) {
    var Action = require(file).default;
    var name = path.basename(file, '.js');
    var action = new Action(config[name]);
    action.listen(payloadEmitter);
    logger.info(`${name} module loaded.`);
}

payloadEmitter.on('error', (error) => {
    logger.error(error.stack);
});

var app = express();

app.use(bodyParser.json());

app.post('/payload', (request, response, next) => {
    var event = request.headers['x-github-event'];
    if (event) {
        payloadEmitter.emit(event, request.body);
    }
    next();
});

app.use((request, response) => {
    response.set({'Content-Type': 'text/plain'});
    response.end('Gylfie');
});

export default app;
