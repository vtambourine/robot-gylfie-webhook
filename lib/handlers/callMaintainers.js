import path from 'path';
import child_process from 'child_process';
import mkdirp from 'mkdirp';
import request from 'superagent';
import GitHub from '../github';
import logger from '../logger';

// TODO: Consider use execFileSync.
var execFile = child_process.execFile;

// TODO: Move to config.
var repositoryDir = './tmp/repository';

export default function (payload) {
    payload.on('pull_request', (body) => {
        if (body.action !== 'opened') {
            return;
        }

        (async function () { // jshint ignore:line
            logger.info(`Calling reviewers to pull request #${body.number}.`);

            // Repository name as <owner>/<name>.
            var repositoryName = body.repository.full_name;
            // Path to repository local copy.
            var repositoryPath = path.join(repositoryDir, repositoryName);
            mkdirp.sync(repositoryPath);

            // Repository clone url.
            var cloneUrl = body.repository.clone_url;
            // Pull request base branch.
            var baseBranch = body.pull_request.base.ref;

            // Cloning and updating repository in local cache.
            await new Promise((resolve, reject) => { // jshint ignore:line
                console.log('boobs');
                execFile(
                    path.resolve(process.cwd(), 'lib/sh/clone-repository.sh'),
                    [cloneUrl, baseBranch],
                    {cwd: repositoryPath},
                    (error) => {
                        console.log('boobs 2');
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
                    .get(body.pull_request.diff_url)
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
                            reject(new Error(`Pull request #${body.number} to ${repositoryName} is empty.`));
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
                .filter((author) => author !== body.sender.login);

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
            var callAuthors = concernedAuthors.filter((author) => body.pull_request.body.indexOf(`@${author}`) === -1);
            if (callAuthors.length >= 1) {
                var call = callAuthors.map((name) => `@${name}`).join(', ');
                var message;
                if (callAuthors.length === 1) {
                    message = `${call}, обрати на это внимание, пожалуйста!`;
                } else {
                    message = `${call}, обратите на это внимание, пожалуйста!`;
                }

                GitHub
                    .post(`/repos/${repositoryName}/issues/${body.number}/comments`)
                    .send({
                        body: message
                    })
                    .end((response) => {
                        if (response.error) {
                            logger.error(response.error);
                        } else {
                            logger.info(`Reviewers for pull request #${body.number} to ${repositoryName} was called.`);
                        }
                    });
            }
        })().catch((error) => payload.emit('error', error)); // jshint ignore:line
    });
}
