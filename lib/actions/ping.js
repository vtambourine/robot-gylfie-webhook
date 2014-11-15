import Action from '../action';
import logger from '../logger';

class PingAction extends Action {

    /**
     * @param {EventEmitter} emitter
     */
    listen(emitter) {
        emitter.on('ping', this.handle);
    }

    /**
     * @param {Payload} payload
     */
    handle(payload) {
        logger.info(`${payload.zen} — says GitHub.`);
    }

}

export default PingAction;
