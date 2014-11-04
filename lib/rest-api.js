import url from 'url';
import {superagent as Request} from 'superagent';

/**
 * Proxy to REST services.
 * Each service must extend this class and provide base host URI and optional OAuth signature.
 *
 */
class RestAPI {
    /**
     * @throws {Error} Will throw an error if base host is not defined.
     * @returns {String}
     * @abstract
     */
    getHost() {
        throw new Error('Each API must define base host.');
    }

    /**
     * @returns {Object}
     * @abstract
     */
    getSign() {
        return {};
    }

    /**
     * @param {String} method
     * @param {String} path
     * @returns {Request}
     * @private
     */
    request(method, path) {
        var uri = url.resolve(this.getHost(), path);
        var request = new Request(method, uri);
        request.set(this.getSign());
        return request;
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    get(path) {
        return this.request('get', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    post(path) {
        return this.request('post', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    link(path) {
        return this.request('link', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    unlink(path) {
        return this.request('unlink', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    put(path) {
        return this.request('put', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    patch(path) {
        return this.request('patch', path);
    }

    /**
     * @param {String} path
     * @returns {Request}
     */
    delete(path) {
        return this.request('delete', path);
    }
}

export default RestAPI;
