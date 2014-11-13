import Handler from '../handler';
import logger from '../logger';

class PingHandler extends Handler {

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

export default PingHandler;
