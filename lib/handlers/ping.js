import logger from '../logger'

export default function (payload) {
    payload.on('ping', (body) => {
        logger.info(`${body.zen} — says GitHub.`)
    })
}
