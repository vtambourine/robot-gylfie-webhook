import path from 'path';
import child_process from 'child_process';
import mkdirp from 'mkdirp';
import request from 'superagent';
import GitHub from '../github';
import Action from '../action';
import logger from '../logger';

// TODO: Consider use execFileSync.
var execFile = child_process.execFile;

// TODO: Move to config.
var repositoryDir = './tmp/repository';

class CallReviewersAction extends Action {

    /**
     * @param {EventEmitter} emitter
     */
    listen(emitter) {
        emitter.on('pull_request', this.handle);
    }

    /**
     * @param {Payload} payload
     */
    async handle(payload) {
        if (payload.action !== 'opened') {
            return;
        }

        // TODO: Use default option getter.
        var allowedUsers = this.config.allowedUsers || [];
        var disallowedUsers = this.config.disallowedUsers || [];

        logger.info(`Calling reviewers to pull request #${payload.number}.`);

        // Repository name as <owner>/<name>.
        var repositoryName = payload.repository.full_name;
        // Path to repository local copy.
        var repositoryPath = path.join(repositoryDir, repositoryName);
        mkdirp.sync(repositoryPath);

        // Repository clone url.
        var cloneUrl = payload.repository.clone_url;
        // Pull request base branch.
        var baseBranch = payload.pull_request.base.ref;

        // Cloning and updating repository in local cache.
        await new Promise((resolve, reject) => { // jshint ignore:line
            execFile(
                path.resolve(process.cwd(), 'lib/sh/clone-repository.sh'),
                [cloneUrl, baseBranch],
                {cwd: repositoryPath},
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                }
            );
        });

        // Determine files changed in current pull request based on diff.
        var changedFiles = await new Promise((resolve, reject) => { // jshint ignore:line
            request
                .get(payload.pull_request.diff_url)
                .end((error, response) => {
                    if (error) {
                        reject(error);
                    }
                    var diff = response.text;
                    if (diff) {
                        var markers = diff.match(/^--- a\/.*$/gm);
                        var modifiedFiles = markers.map((marker) => marker.replace('--- a/', ''));
                        resolve(modifiedFiles);
                    } else {
                        reject(new Error(`Pull request #${payload.number} to ${repositoryName} is empty.`));
                    }
                });
        });

        // Define changed files authors based on git-blame data.
        var changedFilesAuthors = await new Promise((resolve, reject) => { // jshint ignore:line
            execFile(
                path.resolve(process.cwd(), 'lib/sh/git-blame-authors.sh'),
                [changedFiles.join(' ')],
                {cwd: repositoryPath},
                (error, stdout) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(stdout.trim().split(' '));
                }
            );
        });

        // Define concerned authors, excluding the sender of review.
        var concernedAuthors = changedFilesAuthors
            .map((author) => author.replace(/@.*$/, ''))
            .filter((author) => author !== payload.sender.login);


        // Calculate contribution of each concerned author to files affected by pull request.
        var contribution = {};
        for (let author of concernedAuthors) {
            if (!contribution[author]) {
                contribution[author] = 0;
            }
            contribution[author]++;
        }

        // Get top two contributors.
        concernedAuthors.sort((a, b) => contribution[a] - contribution[b]);

        logger.info(`Concerned authors (in contribution order) are ${concernedAuthors.join(', ')}.`);
        while (concernedAuthors.length > 2) {
            concernedAuthors.pop();
        }

        // Call top contributors which wasn't called by review sender.
        // Filter out disallowed users from call.
        var callAuthors = concernedAuthors.filter((author) => {
            return payload.pull_request.body.indexOf(`@${author}`) === -1
                && disallowedUsers.indexOf(author) === -1;
        });

        if (callAuthors.length >= 1) {
            var call = callAuthors.map((name) => `@${name}`).join(', ');
            var message;
            if (callAuthors.length === 1) {
                message = `${call}, обрати на это внимание, пожалуйста!`;
            } else {
                message = `${call}, обратите на это внимание, пожалуйста!`;
            }

            GitHub
                .post(`/repos/${repositoryName}/issues/${payload.number}/comments`)
                .send({
                    body: message
                })
                .end((error, response) => {
                    if (error) throw error;
                    if (response.error) {
                        logger.error(response.error);
                    } else {
                        logger.info(`Reviewers for pull request #${payload.number} to ${repositoryName} was called.`);
                    }
                });
        }
    }
}

export default CallReviewersAction;
