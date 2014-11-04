var fs = require('fs');
var path = require('path');
var request = require('superagent');
var traceur = require('traceur');
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

traceur.require.makeDefault(function(filename) {
    return filename.indexOf('node_modules') === -1;
});
var logger = require(path.join(__dirname, '../lib/logger.js')).default;

require('../bootstrap');

var payload = fs.readFileSync(path.join(__dirname, 'payloads/ping.txt'), {encoding: 'utf8'});

describe('WebHook Server', function () {
    it('should respond with Gylfie name.', function (done) {
        request
            .get('http://localhost:4567')
            .end(function (response) {
                response.status.should.be.eq(200);
                response.text.should.match(/^Gylfie/);
                done();
            });
    });
});

describe('Handlers', function () {
    describe('Ping Handler', function () {
        before(function () {
            sinon.stub(logger, 'info');
        });

        after(function () {
            logger.info.restore();
        });

        it('should log GitHub zen.', function (done) {
            request
                .post('http://localhost:4567/payload')
                .set({
                    'Content-Type': 'application/json',
                    'X-GitHub-Event': 'ping'
                })
                .send(payload)
                .buffer(true)
                .end(function () {
                    logger.info.should.have.been.calledWith('Practicality beats purity. — says GitHub.');
                    done();
                });
        });
    });

    describe.skip('Call Reviewers Handler', function () {
        it('should call top two contributors.', function () {

        });
    });
});
