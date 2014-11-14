var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

var fs = require('fs');
var path = require('path');

import logger from '../lib/logger';
import Startrek from '../lib/startrek';
import LinkIssueAction from '../lib/actions/linkIssue';
var action = new LinkIssueAction;

var requestStub = {
    set: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis()
};

describe('Link Issue Action Test', () => {
    beforeEach(() => {
        sinon.stub(logger, 'info');
        sinon.stub(Startrek, 'link');
        Startrek.link.returns(requestStub);
    });

    afterEach(() => {
        logger.info.restore();
        Startrek.link.restore();
        requestStub.set.reset();
        requestStub.end.reset();
    });

    it('should do nothing if no issue id in the pull request title.', () => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened.txt'), {encoding: 'utf8'}));
        action.handle(payload);
        Startrek.link.callCount.should.be.eq(0);
    });

    it('should link pull request to the corresponding issue.', () => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened-2.txt'), {encoding: 'utf8'}));
        action.handle(payload);
        Startrek.link.should.have.been.calledWithExactly('/v2/issues/SAMPLE-001');
        requestStub.set.should.have.been.calledWithExactly('Link', '<https://github.com/vtambourine/node-jscs/pull/2>; rel="relates"');
    });

    it('should link pull request to the all corresponding issuee.', () => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened-3.txt'), {encoding: 'utf8'}));
        action.handle(payload);
        Startrek.link.firstCall.should.have.been.calledWith('/v2/issues/SAMPLE-002');
        Startrek.link.secondCall.should.have.been.calledWith('/v2/issues/SAMPLE-003');
        requestStub.set.should.have.been.calledWithExactly('Link', '<https://github.com/vtambourine/node-jscs/pull/3>; rel="relates"');
    });
});
