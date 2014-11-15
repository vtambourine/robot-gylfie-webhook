var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

var fs = require('fs');
var path = require('path');

import logger from '../lib/logger';
import GitHub from '../lib/github';
import CallReviewersAction from '../lib/actions/call-reviewers';
var action = new CallReviewersAction({
    disallowedUsers: ['markelog']
});

var requestStub = {
    send: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis()
};

describe('Call Reviewers Action Test', function () {
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
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened.txt'), {encoding: 'utf8'}));
        action.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/1/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@mdevils, @mike.sherov, обратите на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });

    it('should call responsible reviewer to pull request #2.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened-3.txt'), {encoding: 'utf8'}));
        action.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/3/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@mdevils, @mike.sherov, обратите на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });

    it('should call responsible reviewer to pull request #3 with user in ignore list.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/pull-request-opened-2.txt'), {encoding: 'utf8'}));
        action.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/2/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@ikokostya, обрати на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });

    it('should call responsible reviewer to pull request with only one contributor.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/single-author.txt'), {encoding: 'utf8'}));
        action.handle(payload)
            .then(() => {
                GitHub.post.should.have.been.calledWith('/repos/vtambourine/node-jscs/issues/4/comments');
                requestStub.send.should.have.been.calledWithMatch(
                    sinon.match({ body: '@mdevils, обрати на это внимание, пожалуйста!' })
                );
                done();
            })
            .catch(done);
    });

    it('should call nobody if sender is the only contributor.', (done) => {
        var payload = JSON.parse(fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened/no-other-contributors.txt'), {encoding: 'utf8'}));
        action.handle(payload)
            .then(() => {
                GitHub.post.callCount.should.be.eq(0);
                requestStub.send.callCount.should.be.eq(0);
                done();
            })
            .catch(done);
    });
});
