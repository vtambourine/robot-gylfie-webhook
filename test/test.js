var fs = require('fs');
var path = require('path');
//var request = require('superagent');
var request = require('supertest');
var traceur = require('traceur');
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

traceur.require.makeDefault(
    function(filename) {
        return filename.indexOf('node_modules') === -1;
    },
    {asyncFunctions: true}
);

var GitHub = require(path.join(__dirname, '../lib/github.js')).default;
var logger = require(path.join(__dirname, '../lib/logger.js')).default;


var child_process = require('child_process');
//var execFile = require('child_process').execFile;

var samplePayload;


var app = require(path.join(__dirname, '../server.js')).default;
describe('WebHook Server', function () {
    it('should respond with Gylfie name.', function (done) {
        request(app)
            .get('/')
            .end(function (error, response) {
                if (error) throw error;
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
            samplePayload = fs.readFileSync(path.join(__dirname, 'payloads/ping.txt'), {encoding: 'utf8'});
        });

        after(function () {
            logger.info.restore();
        });

        it('should log GitHub zen.', function (done) {
            request(app)
                .post('/payload')
                .set({
                    'Content-Type': 'application/json',
                    'X-GitHub-Event': 'ping'
                })
                .send(samplePayload)
                .buffer(true)
                .end(function () {
                    logger.info.should.have.been.calledWith('Practicality beats purity. — says GitHub.');
                    done();
                });
        });
    });

    describe.only('Call Reviewers Handler', function () {
        before(function () {
            samplePayload = fs.readFileSync(path.join(__dirname, 'payloads/pull-request-opened.txt'), {encoding: 'utf8'});
            sinon.stub(GitHub.prototype, 'post');
            sinon.stub(child_process, 'execFile');
        });

        after(function () {
            GitHub.prototype.post.restore();
        });

        it('should call top two contributors.', function (done) {
            request(app)
                .post('/payload')
                .set({
                    'Content-Type': 'application/json',
                    'X-GitHub-Event': 'pull_request'
                })
                .send(samplePayload)
                .buffer(true)
                .end(function () {
                    console.log('> end');
                    console.log('>1', GitHub.prototype.post.args);
                    console.log('>2', child_process.execFile.args);
                    done();
                });
        });
    });

    describe.skip('Link Issue Handler', function () {
        it('should link pull request to corresponding issue.', function () {

        });
    });
});
