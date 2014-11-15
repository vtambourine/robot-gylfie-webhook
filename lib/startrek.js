import RestAPI from './rest-api';
import {startrekToken as token} from '../tokens';

/**
 * Proxy to Startrek API resources.
 * @augments RestAPI
 */
class Startrek extends RestAPI {
    /**
     * @returns {String}
     */
    getHost() {
        return 'https://st-api.yandex-team.ru/v2/';
    }

    /**
     * @returns {Object}
     */
    getSign() {
        return {'Authorization': `OAuth ${token}`};
    }
}

export default new Startrek;
