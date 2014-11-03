import RestAPI from './rest-api'
import {startrekToken as token} from '../tokens'

class Startrek extends RestAPI {
    /**
     * @override
     */
    getHost() {
        return 'https://st-api.yandex-team.ru/v2/'
    }

    /**
     * @override
     */
    getSign() {
        return {'Authorization': `OAuth ${token}`}
    }
}

var startrek = new Startrek()

export default startrek
