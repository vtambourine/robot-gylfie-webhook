var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

var fs = require('fs');
var path = require('path');

import logger from '../lib/logger';
import PingAction from '../lib/actions/ping';
var action = new PingAction;

describe('Ping Action Test', function () {
    before(function () {
        sinon.stub(logger, 'info');
    });

    after(function () {
        logger.info.restore();
    });

    it('should log GitHub zen.', function () {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/ping.txt'), {encoding: 'utf8'}));

        action.handle(payload);

        logger.info.should.have.been.calledWith('Practicality beats purity. — says GitHub.');
    });
});
