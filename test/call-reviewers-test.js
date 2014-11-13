var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

var fs = require('fs');
var path = require('path');

import logger from '../lib/logger';
import GitHub from '../lib/github';
import CallReviewersHandler from '../lib/handlers/callMaintainers';
var handler = new CallReviewersHandler;

var requestStub = {
    send: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis()
};

describe('Call Reviewers Handler Test', function () {
    beforeEach(() => {
        sinon.stub(logger, 'info');
        sinon.stub(GitHub, 'post');
        GitHub.post.returns(requestStub);
    });

    afterEach(() => {
        logger.info.restore();
        GitHub.post.restore();
        requestStub.send.reset();
        requestStub.end.reset();
    });

    it('should call responsible reviewer to pull request #1.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened.txt'), {encoding: 'utf8'}));
        handler.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/1/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@mdevils, @mike.sherov, обратите на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });

    it('should call responsible reviewer to pull request #1.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened-2.txt'), {encoding: 'utf8'}));
        handler.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/2/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@ikokostya, @markelog, обратите на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });
});
