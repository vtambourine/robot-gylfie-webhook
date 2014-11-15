class Action {

    constructor(config) {
        this.config = config || {};
    }

    /**
     * @param {EventEmitter} emitter
     */
    listen(emitter) {}

    /**
     * @param {Payload} payload
     */
    handle(payload) {}
}

export default Action;
