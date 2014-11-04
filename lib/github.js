import RestAPI from './rest-api';
import {githubToken as token} from '../tokens';

/**
 * Proxy to GitHub API resources.
 * @see {@link https://developer.github.com/v3/}
 * @augments RestAPI
 */
class GitHub extends RestAPI {
    /**
     * @returns {String}
     */
    getHost() {
        return 'https://api.github.yandex-team.ru/';
    }

    /**
     * @returns {Object}
     */
    getSign() {
        return {'Authorization': `token ${token}`};
    }
}

export default GitHub;
