import path from 'path';
import EventEmitter from 'events';
import express from 'express';
import bodyParser from 'body-parser';
import glob from 'glob';
import logger from './lib/logger';

import './lib/rest-api';

// GitHub Webhooks events wrapper.
// @see https://developer.github.com/webhooks
var payload = new EventEmitter();
for (let file of glob.sync('./lib/handlers/*.js')) {
    require(file).default(payload);
    logger.info(`${path.basename(file, '.js')} module loaded.`);
}

payload.on('error', (error) => {
    logger.error(error.stack);
});

payload.on('call-maintainers-done', (error) => {
    console.log('c m done');
});

var app = express();

app.use(bodyParser.json());

app.post('/payload', (request, response, next) => {
    var event = request.headers['x-github-event'];
    if (event) {
        payload.emit(event, request.body);
    }
    next();
});

app.use((request, response) => {
    response.set({'Content-Type': 'text/plain'});
    response.end('Gylfie');
});

export default app;

//app.listen(4567);
