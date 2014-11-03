import RestAPI from './rest-api'
import {githubToken as token} from '../tokens'

class GitHub extends RestAPI {
    /**
     * @override
     */
    getHost() {
        return 'https://api.github.yandex-team.ru/'
    }

    /**
     * @override
     */
    getSign() {
        return {'Authorization': `token ${token}`}
    }
}

export default new GitHub
