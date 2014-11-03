import url from 'url'
import superagent from 'superagent'

class RestAPI {
    /**
     * @protected
     */
    getHost() {
        throw new Error('Each API must define host url.')
    }

    /**
     * @protected
     */
    getSign() {
        return {}
    }

    request(method, path) {
        var uri = url.resolve(this.getHost(), path)
        var request = superagent(method, uri)
        request.set(this.getSign())
        return request
    }

    get(path) {
        return this.request('get', path)
    }

    post(path) {
        return this.request('post', path)
    }

    link(path) {
        return this.request('link', path)
    }

    unlink(path) {
        return this.request('unlink', path)
    }

    put(path) {
        return this.request('put', path)
    }

    patch(path) {
        return this.request('patch', path)
    }

    delete(path) {
        return this.request('delete', path)
    }
}

export default RestAPI
