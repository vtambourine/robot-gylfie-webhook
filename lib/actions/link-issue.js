import Action from '../action';
import Startrek from '../startrek';
import logger from '../logger';
import {parseIssues} from '../helpers';

class LinkIssueAction extends Action {

    /**
     * @param {EventEmitter} emitter
     */
    listen(emitter) {
        emitter.on('pull_request', this.handle);
    }

    /**
     * @param {Payload} payload
     */
    handle(payload) {
        if (payload.action !== 'opened') {
            return;
        }
        var title = payload.pull_request.title;
        logger.info(`Link "${title}" to corresponding issue`);
        for (let issue of parseIssues(title)) {
            Startrek.link(`/v2/issues/${issue}`)
                .set('Link', `<${payload.pull_request.html_url}>; rel="relates"`)
                .end((error, response) => {
                    if (error) {
                        logger.error(error);
                        return;
                    }
                    if (response.error) {
                        logger.error(response.error);
                    } else {
                        logger.info(`Issue ${issue} was linked.`);
                    }
                });
        }
    }

}

export default LinkIssueAction;
