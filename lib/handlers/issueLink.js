import Startrek from '../startrek';
import logger from '../logger';
import {parseIssues} from '../helpers';

export default function (payload) {
    payload.on('xpull_request', (body) => {
        if (body.action !== 'opened') {
            return;
        }

        var title = body.pull_request.title;
        logger.info(`Link "${title}" to corresponding issue`);
        for (let issue of parseIssues(title)) {
            Startrek.link(`/v2/issues/${issue}`)
                .set('Link', `<${body.pull_request.html_url}>; rel="relates"`)
                .end((response) => {
                    if (response.error) {
                        payload.emit('error', response.error);
                    } else {
                        logger.info(`Issue ${issue} was linked.`);
                    }
                });
        }
    });
}
